'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar, Clock, Users, Link2, X, Check } from 'lucide-react';
import { toast } from 'sonner';

interface CalendarIntegration {
  id: string;
  provider: 'google' | 'outlook';
  is_connected: boolean;
  last_synced_at?: string;
}

export function CalendarManagementPanel() {
  const { user } = useAuth();
  const supabase = createClient();
  const [connectedCalendars, setConnectedCalendars] = useState<CalendarIntegration[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedPatientId, setSelectedPatientId] = useState('');
  const [dateRange, setDateRange] = useState({
    start: new Date().toISOString().split('T')[0],
    end: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  });

  useEffect(() => {
    if (user) {
      fetchConnectedCalendars();
    }
  }, [user]);

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

  const handleProposeSlots = async () => {
    if (!user || !selectedPatientId) {
      toast.error('Please select a patient');
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('agent-orchestrator', {
        body: {
          message: `Propose available slots to patient ${selectedPatientId} for the date range ${dateRange.start} to ${dateRange.end}`,
          context: {
            userId: user.id,
            patientId: selectedPatientId,
            dateRange: {
              start: new Date(dateRange.start).toISOString(),
              end: new Date(dateRange.end).toISOString(),
            },
          },
        },
      });

      if (error) throw error;

      toast.success('Slot proposals sent successfully!');
      setSelectedPatientId('');
    } catch (error: any) {
      console.error('Error proposing slots:', error);
      toast.error('Failed to propose slots');
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
          Propose Slots to Patient
        </h2>
        <div className="space-y-4">
          <div>
            <Label htmlFor="patientId">Patient ID</Label>
            <Input
              id="patientId"
              placeholder="Enter patient UUID"
              value={selectedPatientId}
              onChange={(e) => setSelectedPatientId(e.target.value)}
              className="mt-1"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="startDate">Start Date</Label>
              <Input
                id="startDate"
                type="date"
                value={dateRange.start}
                onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="endDate">End Date</Label>
              <Input
                id="endDate"
                type="date"
                value={dateRange.end}
                onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                className="mt-1"
              />
            </div>
          </div>
          <Button
            onClick={handleProposeSlots}
            disabled={loading || !selectedPatientId}
            className="w-full"
          >
            {loading ? 'Proposing...' : 'Propose Slots'}
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
    </div>
  );
}
