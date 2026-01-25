'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar, Clock, Users, Link2, X, Check } from 'lucide-react';
import { parseISO } from 'date-fns';
import { GoogleCalendarSnapshot } from '@/components/calendar/google-calendar-snapshot';
import { toast } from 'sonner';
import { usePatientList } from '../../_hooks/usePatientList';
import { PatientSearchSelect } from '@/components/copilot/patient-search-select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';

interface CalendarIntegration {
  id: string;
  provider: 'google' | 'outlook';
  is_connected: boolean;
  last_synced_at?: string;
}

type DatePreset = 'next_3_days' | 'next_week' | 'next_2_weeks' | 'custom';

function formatDateInput(date: Date) {
  return date.toISOString().split('T')[0];
}

function getPresetRange(preset: Exclude<DatePreset, 'custom'>) {
  const startDate = new Date();
  const endDate = new Date();

  if (preset === 'next_3_days') {
    endDate.setDate(endDate.getDate() + 3);
  } else if (preset === 'next_week') {
    endDate.setDate(endDate.getDate() + 7);
  } else if (preset === 'next_2_weeks') {
    endDate.setDate(endDate.getDate() + 14);
  }

  return {
    start: formatDateInput(startDate),
    end: formatDateInput(endDate),
  };
}

export function CalendarManagementPanel() {
  const { user } = useAuth();
  const supabase = createClient();
  const { patients, loading: patientsLoading } = usePatientList();
  const [connectedCalendars, setConnectedCalendars] = useState<CalendarIntegration[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedPatientId, setSelectedPatientId] = useState('');
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [previewSlots, setPreviewSlots] = useState<
    { start: string; end: string; confidence?: number }[]
  >([]);
  const [selectedSlotIndices, setSelectedSlotIndices] = useState<Set<number>>(new Set());
  const [proposalId, setProposalId] = useState<string | null>(null);
  const [datePreset, setDatePreset] = useState<DatePreset>('next_week');
  const [dateRange, setDateRange] = useState(() => getPresetRange('next_week'));
  const [calendarMonth, setCalendarMonth] = useState<Date>(new Date());

  useEffect(() => {
    if (user) {
      fetchConnectedCalendars();
    }
  }, [user]);

  const selectedPatient = patients.find((p) => p.id === selectedPatientId);

  const fetchConnectedCalendars = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('calendar_integrations')
        .select('*')
        .eq('therapist_id', user.id)
        .eq('is_connected', true);

      if (error) throw error;
      setConnectedCalendars(data || []);
    } catch (error: any) {
      console.error('Error fetching calendars:', error);
      toast.error('Failed to load calendar integrations');
    }
  };

  const handleConnectGoogle = async () => {
    if (!user) return;
    
    const callbackUrl = `${window.location.origin}/api/auth/google-calendar/callback`;
    const authUrl = `/api/auth/google-calendar?therapist_id=${user.id}&redirect_uri=${encodeURIComponent(callbackUrl)}`;
    window.location.href = authUrl;
  };

  const handleConnectOutlook = async () => {
    if (!user) return;
    
    const callbackUrl = `${window.location.origin}/api/auth/outlook-calendar/callback`;
    const authUrl = `/api/auth/outlook-calendar?therapist_id=${user.id}&redirect_uri=${encodeURIComponent(callbackUrl)}`;
    window.location.href = authUrl;
  };

  const handleDisconnect = async (provider: 'google' | 'outlook') => {
    if (!user) return;

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('agent-orchestrator', {
        body: {
          message: `Disconnect my ${provider} calendar`,
          context: { userId: user.id },
        },
      });

      if (error) throw error;

      // Also directly update the database to mark as disconnected
      const { error: updateError } = await supabase
        .from('calendar_integrations')
        .update({ is_connected: false })
        .eq('therapist_id', user.id)
        .eq('provider', provider);

      if (updateError) throw updateError;

      toast.success(`${provider.charAt(0).toUpperCase() + provider.slice(1)} calendar disconnected`);
      await fetchConnectedCalendars();
    } catch (error: any) {
      console.error('Error disconnecting calendar:', error);
      toast.error(`Failed to disconnect ${provider} calendar`);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Step 1: Ask Copilot to find candidate slots (no notifications yet).
   * This calls the calendar agent via agent-orchestrator and extracts the
   * proposed_slots + proposal_id from the toolCalls payload, then opens
   * a confirmation dialog so the therapist can review before sending.
   */
  const handlePrepareProposals = async () => {
    if (!user || !selectedPatientId) {
      toast.error('Please select a patient');
      return;
    }
    setLoading(true);
    try {
      const requestBody = {
        message: `Calendar management: Check my calendar availability and propose 3-5 optimal meeting slots to patient ${selectedPatientId} for the date range ${dateRange.start} to ${dateRange.end}. Use check_availability to find free slots, then use propose_slots to create the proposal.`,
        context: {
          intent: 'calendar', // Explicitly request calendar agent
          userId: user.id,
          patientId: selectedPatientId,
          dateRange: {
            start: new Date(dateRange.start).toISOString(),
            end: new Date(dateRange.end).toISOString(),
          },
        },
      };
      
      console.log('[CalendarManagementPanel] Sending request to agent-orchestrator:', {
        message: requestBody.message.substring(0, 100) + '...',
        context: requestBody.context,
        intent: requestBody.context.intent,
      });
      
      const { data, error } = await supabase.functions.invoke('agent-orchestrator', {
        body: requestBody,
      });

      console.log('[CalendarManagementPanel] agent-orchestrator response', {
        data,
        error,
        hasToolCalls: !!(data as any)?.toolCalls,
        toolCallsCount: ((data as any)?.toolCalls || []).length,
      });

      if (error) {
        console.error('[CalendarManagementPanel] agent-orchestrator error:', error);
        throw error;
      }

      const toolCalls = ((data as any)?.toolCalls || []) as any[];
      console.log('[CalendarManagementPanel] parsed toolCalls:', toolCalls);

      let slots:
        | { start: string; end: string; confidence?: number }[]
        | undefined;
      let newProposalId: string | null = null;

      // Preferred path: agent already used the propose_slots tool
      const proposeCall = toolCalls.find((tc: any) => tc.tool === 'propose_slots');
      if (proposeCall) {
        slots =
          proposeCall.arguments?.proposed_slots ||
          proposeCall.arguments?.slots ||
          proposeCall.result?.slots ||
          [];
        newProposalId = proposeCall.result?.proposal_id || null;
      }

      // Fallback path: agent only ran check_availability; create proposal on our side
      if ((!slots || slots.length === 0) || !newProposalId) {
        const availabilityCall = toolCalls.find(
          (tc: any) => tc.tool === 'check_availability'
        );
        const availableSlots =
          availabilityCall?.result?.slots ||
          availabilityCall?.arguments?.slots ||
          [];

        if (availableSlots && availableSlots.length > 0) {
          const selectedSlots = availableSlots.slice(0, 5);

          const createResponse = await fetch(
            '/api/calendar/create-slot-proposals',
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                patientId: selectedPatientId,
                slots: selectedSlots,
              }),
            }
          );

          const createResult = await createResponse.json();
          if (!createResponse.ok || !createResult.success) {
            throw new Error(
              createResult.error || 'Failed to create slot proposals'
            );
          }

          slots = selectedSlots;
          newProposalId = createResult.proposalId;
        }
      }

      if (!slots || slots.length === 0 || !newProposalId) {
        console.warn('No proposed slots returned from calendar agent', { 
          toolCalls,
          data,
          proposeCall,
          availabilityCall: toolCalls.find((tc: any) => tc.tool === 'check_availability'),
        });
        toast.error('Copilot could not generate slot proposals. Please try again.');
        return;
      }

      setPreviewSlots(slots);
      setProposalId(newProposalId);
      // Select all slots by default
      setSelectedSlotIndices(new Set(slots.map((_, idx) => idx)));
      // Set calendar month to show the first slot's month
      if (slots.length > 0) {
        setCalendarMonth(parseISO(slots[0].start));
      }
      setConfirmOpen(true);
      toast.success(`Copilot found ${slots.length} candidate slot${slots.length > 1 ? 's' : ''}.`);
    } catch (error: any) {
      console.error('Error preparing slot proposals:', error);
      toast.error(error?.message || 'Failed to prepare slot proposals');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Step 2: After therapist reviews the proposed slots, send notifications
   * (email / WhatsApp / in-app) for the selected proposal.
   */
  const handleSendProposals = async () => {
    if (!proposalId) {
      toast.error('No proposal to send. Please ask Copilot to find slots again.');
      return;
    }

    if (selectedSlotIndices.size === 0) {
      toast.error('Please select at least one slot to send to the patient.');
      return;
    }

    setLoading(true);
    try {
      // Filter to only selected slots
      const selectedSlots = previewSlots.filter((_, idx) => selectedSlotIndices.has(idx));
      
      // Update the proposal in the database to only include selected slots
      const { error: updateError } = await supabase
        .from('slot_proposals')
        .update({
          proposed_slots: selectedSlots,
        })
        .eq('id', proposalId);

      if (updateError) {
        throw new Error('Failed to update proposal with selected slots');
      }

      const response = await fetch('/api/calendar/send-slot-proposals', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ proposalId }),
      });

      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Failed to send slot proposals');
      }

      toast.success(`Sent ${selectedSlots.length} slot proposal${selectedSlots.length > 1 ? 's' : ''} to patient.`);
      setSelectedPatientId('');
      setPreviewSlots([]);
      setSelectedSlotIndices(new Set());
      setProposalId(null);
    } catch (error: any) {
      console.error('Error sending slot proposals:', error);
      toast.error(error?.message || 'Failed to send slot proposals');
    } finally {
      setLoading(false);
    }
  };

  const handleSyncCalendar = async (provider: 'google' | 'outlook') => {
    if (!user) return;

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('agent-orchestrator', {
        body: {
          message: `Sync my ${provider} calendar`,
          context: { userId: user.id },
        },
      });

      if (error) throw error;

      toast.success(`${provider.charAt(0).toUpperCase() + provider.slice(1)} calendar synced`);
      await fetchConnectedCalendars();
    } catch (error: any) {
      console.error('Error syncing calendar:', error);
      toast.error(`Failed to sync ${provider} calendar`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 p-6">
      <div>
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
          <Calendar className="w-6 h-6" />
          Calendar Integrations
        </h2>
        
        <div className="grid grid-cols-2 gap-4 mb-4">
          <Button
            onClick={handleConnectGoogle}
            disabled={loading || connectedCalendars.some(c => c.provider === 'google')}
            className="p-4 h-auto flex flex-col items-center gap-2"
            variant={connectedCalendars.some(c => c.provider === 'google') ? 'outline' : 'default'}
          >
            {connectedCalendars.some(c => c.provider === 'google') ? (
              <>
                <Check className="w-5 h-5 text-green-600" />
                <span>Google Connected</span>
              </>
            ) : (
              <>
                <Link2 className="w-5 h-5" />
                <span>Connect Google Calendar</span>
              </>
            )}
          </Button>
          
          <Button
            onClick={handleConnectOutlook}
            disabled={loading || connectedCalendars.some(c => c.provider === 'outlook')}
            className="p-4 h-auto flex flex-col items-center gap-2"
            variant={connectedCalendars.some(c => c.provider === 'outlook') ? 'outline' : 'default'}
          >
            {connectedCalendars.some(c => c.provider === 'outlook') ? (
              <>
                <Check className="w-5 h-5 text-green-600" />
                <span>Outlook Connected</span>
              </>
            ) : (
              <>
                <Link2 className="w-5 h-5" />
                <span>Connect Outlook</span>
              </>
            )}
          </Button>
        </div>

        {connectedCalendars.length > 0 && (
          <div className="mt-4 space-y-2">
            {connectedCalendars.map(calendar => (
              <div
                key={calendar.id}
                className="flex justify-between items-center p-3 bg-gray-100 dark:bg-zinc-800 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <span className="font-semibold capitalize">{calendar.provider} Calendar</span>
                  {calendar.last_synced_at && (
                    <span className="text-xs text-gray-500">
                      Last synced: {new Date(calendar.last_synced_at).toLocaleDateString()}
                    </span>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleSyncCalendar(calendar.provider)}
                    disabled={loading}
                  >
                    Sync
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleDisconnect(calendar.provider)}
                    disabled={loading}
                    className="text-red-600 hover:text-red-800"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="border-t pt-6">
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
          <Clock className="w-6 h-6" />
          Ask Copilot to Propose Slots
        </h2>
        <div className="space-y-4">
          <PatientSearchSelect
            patients={patients}
            loading={patientsLoading}
            value={selectedPatientId}
            onSelect={(p) => setSelectedPatientId(p?.id ?? '')}
            placeholder="Search patient by name..."
            label="Patient"
            className="w-full"
          />

          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              size="sm"
              variant={datePreset === 'next_3_days' ? 'default' : 'outline'}
              onClick={() => {
                setDatePreset('next_3_days');
                setDateRange(getPresetRange('next_3_days'));
              }}
            >
              Next 3 days
            </Button>
            <Button
              type="button"
              size="sm"
              variant={datePreset === 'next_week' ? 'default' : 'outline'}
              onClick={() => {
                setDatePreset('next_week');
                setDateRange(getPresetRange('next_week'));
              }}
            >
              Next week
            </Button>
            <Button
              type="button"
              size="sm"
              variant={datePreset === 'next_2_weeks' ? 'default' : 'outline'}
              onClick={() => {
                setDatePreset('next_2_weeks');
                setDateRange(getPresetRange('next_2_weeks'));
              }}
            >
              Next 2 weeks
            </Button>
            <Button
              type="button"
              size="sm"
              variant={datePreset === 'custom' ? 'default' : 'outline'}
              onClick={() => setDatePreset('custom')}
            >
              Custom range
            </Button>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="startDate">Start Date</Label>
              <Input
                id="startDate"
                type="date"
                value={dateRange.start}
                onChange={(e) => {
                  setDatePreset('custom');
                  setDateRange({ ...dateRange, start: e.target.value });
                }}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="endDate">End Date</Label>
              <Input
                id="endDate"
                type="date"
                value={dateRange.end}
                onChange={(e) => {
                  setDatePreset('custom');
                  setDateRange({ ...dateRange, end: e.target.value });
                }}
                className="mt-1"
              />
            </div>
          </div>
          <Button
            onClick={handlePrepareProposals}
            disabled={loading || !selectedPatientId}
            className="w-full"
          >
            {loading
              ? 'Copilot is finding slots...'
              : selectedPatient
              ? `Ask Copilot to propose slots for ${selectedPatient.full_name}`
              : 'Ask Copilot to propose slots'}
          </Button>
        </div>
      </div>

      <div className="border-t pt-6">
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
          <Users className="w-6 h-6" />
          Team Calendars
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          View busy/free status of team members' calendars (privacy-respecting view).
        </p>
        <Button
          variant="outline"
          className="mt-4"
          onClick={async () => {
            if (!user) return;
            try {
              const { data, error } = await supabase.functions.invoke('agent-orchestrator', {
                body: {
                  message: `Show me team calendars for the next week`,
                  context: {
                    userId: user.id,
                    dateRange: {
                      start: new Date().toISOString(),
                      end: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
                    },
                  },
                },
              });

              if (error) throw error;
              toast.success('Team calendar view loaded');
            } catch (error: any) {
              toast.error('Failed to load team calendars');
            }
          }}
        >
          View Team Calendars
        </Button>
      </div>

      {/* Confirmation dialog before sending slot proposals to patient */}
      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Send slot proposals to patient?</DialogTitle>
            {selectedPatient && previewSlots.length > 0 ? (
              <div className="text-sm text-slate-500 dark:text-slate-400 space-y-3 mt-2">
                <p>
                  Copilot has checked your connected calendars and found the following
                  conflict‑free slots for{' '}
                  <span className="font-semibold">{selectedPatient.full_name}</span> in the date
                  range{' '}
                  <span className="font-mono">
                    {dateRange.start} → {dateRange.end}
                  </span>
                  .
                </p>
                <ul className="mt-2 space-y-2 text-sm">
                    {previewSlots.map((slot, idx) => {
                      const isSelected = selectedSlotIndices.has(idx);
                      return (
                        <li
                          key={`${slot.start}-${slot.end}-${idx}`}
                          onClick={() => {
                            const newSelected = new Set(selectedSlotIndices);
                            if (isSelected) {
                              newSelected.delete(idx);
                            } else {
                              newSelected.add(idx);
                            }
                            setSelectedSlotIndices(newSelected);
                          }}
                          className={`flex items-center justify-between rounded-lg px-3 py-2.5 cursor-pointer transition-all ${
                            isSelected
                              ? 'bg-primary/20 dark:bg-primary/30 border-2 border-primary ring-2 ring-primary/20'
                              : 'bg-gray-100 dark:bg-zinc-800 border-2 border-transparent hover:bg-gray-200 dark:hover:bg-zinc-700'
                          }`}
                        >
                          <div className="flex items-center gap-3 flex-1">
                            <div
                              className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                                isSelected
                                  ? 'bg-primary border-primary'
                                  : 'border-gray-400 dark:border-gray-500'
                              }`}
                            >
                              {isSelected && (
                                <svg
                                  className="w-3 h-3 text-white"
                                  fill="none"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth="3"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                >
                                  <path d="M5 13l4 4L19 7" />
                                </svg>
                              )}
                            </div>
                            <span className="font-mono text-xs">
                              {new Date(slot.start).toLocaleDateString('en-GB', {
                                day: '2-digit',
                                month: '2-digit',
                                year: 'numeric',
                              })}{' '}
                              {new Date(slot.start).toLocaleTimeString('en-GB', {
                                hour: '2-digit',
                                minute: '2-digit',
                                second: '2-digit',
                              })}{' '}
                              →{' '}
                              {new Date(slot.end).toLocaleTimeString('en-GB', {
                                hour: '2-digit',
                                minute: '2-digit',
                                second: '2-digit',
                              })}
                            </span>
                          </div>
                          {typeof slot.confidence === 'number' && (
                            <span
                              className={`text-[10px] uppercase font-bold ${
                                isSelected
                                  ? 'text-primary dark:text-primary-foreground'
                                  : 'text-gray-500 dark:text-gray-400'
                              }`}
                            >
                              {Math.round(slot.confidence * 100)}% FIT
                            </span>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                  {selectedSlotIndices.size === 0 && (
                    <p className="text-xs text-amber-600 dark:text-amber-400 mt-2">
                      ⚠️ Please select at least one slot to send to the patient.
                    </p>
                  )}
                  <p className="text-xs text-gray-500">
                    These slots have <span className="font-semibold">not</span> been sent to the
                    patient yet. Review them and confirm below to send via email, WhatsApp (if
                    available), and in‑app notifications.
                  </p>
                  
                  {/* Google Calendar snapshot – therapist's actual calendar */}
                  {previewSlots.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                      <GoogleCalendarSnapshot
                        date={calendarMonth}
                        timeMin={(() => {
                          const d = new Date(dateRange.start);
                          d.setHours(0, 0, 0, 0);
                          return d.toISOString();
                        })()}
                        timeMax={(() => {
                          const d = new Date(dateRange.end);
                          d.setHours(23, 59, 59, 999);
                          return d.toISOString();
                        })()}
                        height={360}
                        className="mt-2"
                      />
                    </div>
                  )}
              </div>
            ) : (
              <DialogDescription>
                Copilot will check your calendars and send proposed slots to the selected patient.
              </DialogDescription>
            )}
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setConfirmOpen(false)}
              disabled={loading}
            >
              Review or change
            </Button>
            <Button
              type="button"
              onClick={async () => {
                setConfirmOpen(false);
                await handleSendProposals();
              }}
              disabled={loading || selectedSlotIndices.size === 0}
            >
              {loading
                ? 'Copilot is sending...'
                : `Confirm & send ${selectedSlotIndices.size} slot${selectedSlotIndices.size !== 1 ? 's' : ''}`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
