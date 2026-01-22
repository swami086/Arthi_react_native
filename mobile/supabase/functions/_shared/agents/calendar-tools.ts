// @ts-nocheck
import { CalendarService, TimeSlot } from '../calendar-integrations/calendar-service.ts';
import { reportError, reportInfo } from '../rollbar.ts';

export const calendarTools = [
  {
    name: 'check_availability',
    description: 'Check therapist availability for a date range. Returns free time slots.',
    inputSchema: {
      type: 'object',
      properties: {
        therapist_id: { type: 'string', description: 'Therapist user ID' },
        date_range: {
          type: 'object',
          properties: {
            start: { type: 'string', format: 'date-time', description: 'Start of date range (ISO 8601)' },
            end: { type: 'string', format: 'date-time', description: 'End of date range (ISO 8601)' },
          },
          required: ['start', 'end'],
        },
        duration_minutes: { type: 'number', description: 'Duration of appointment in minutes', default: 60 },
      },
      required: ['therapist_id', 'date_range', 'duration_minutes'],
    },
  },
  {
    name: 'propose_slots',
    description: 'Propose optimal meeting slots to patient. Creates slot proposals that expire in 48 hours.',
    inputSchema: {
      type: 'object',
      properties: {
        patient_id: { type: 'string', description: 'Patient user ID' },
        therapist_id: { type: 'string', description: 'Therapist user ID' },
        proposed_slots: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              start: { type: 'string', format: 'date-time' },
              end: { type: 'string', format: 'date-time' },
              confidence: { type: 'number', minimum: 0, maximum: 1 },
            },
            required: ['start', 'end'],
          },
          minItems: 1,
          maxItems: 5,
        },
      },
      required: ['patient_id', 'therapist_id', 'proposed_slots'],
    },
  },
  {
    name: 'disconnect_calendar',
    description: 'Disconnect a calendar integration (Google or Outlook). Does not delete tokens, just marks as disconnected.',
    inputSchema: {
      type: 'object',
      properties: {
        therapist_id: { type: 'string', description: 'Therapist user ID' },
        provider: { type: 'string', enum: ['google', 'outlook'], description: 'Calendar provider' },
      },
      required: ['therapist_id', 'provider'],
    },
  },
  {
    name: 'get_team_calendars',
    description: 'Get busy/free view of team calendars within the same practice. Respects privacy settings.',
    inputSchema: {
      type: 'object',
      properties: {
        therapist_id: { type: 'string', description: 'Therapist user ID requesting team view' },
        date_range: {
          type: 'object',
          properties: {
            start: { type: 'string', format: 'date-time' },
            end: { type: 'string', format: 'date-time' },
          },
          required: ['start', 'end'],
        },
      },
      required: ['therapist_id', 'date_range'],
    },
  },
  {
    name: 'sync_calendar',
    description: 'Manually trigger calendar sync for a therapist. Usually runs automatically every 6 hours.',
    inputSchema: {
      type: 'object',
      properties: {
        therapist_id: { type: 'string', description: 'Therapist user ID' },
      },
      required: ['therapist_id'],
    },
  },
];

export async function executeCalendarTool(
  toolName: string,
  args: any,
  supabase: any,
  calendarService: CalendarService
): Promise<any> {
  reportInfo(`Executing calendar tool: ${toolName}`, 'calendar:tool', { toolName, args });

  try {
    switch (toolName) {
      case 'check_availability': {
        const { therapist_id, date_range, duration_minutes } = args;
        const slots = await calendarService.checkAvailability(
          therapist_id,
          {
            start: new Date(date_range.start),
            end: new Date(date_range.end),
          },
          duration_minutes || 60
        );

        return {
          success: true,
          slots: slots.map(slot => ({
            start: slot.start.toISOString(),
            end: slot.end.toISOString(),
            confidence: slot.confidence || 1.0,
          })),
          count: slots.length,
        };
      }

      case 'propose_slots': {
        const { patient_id, therapist_id, proposed_slots } = args;

        // Validate slots
        if (!proposed_slots || proposed_slots.length === 0) {
          throw new Error('At least one slot must be proposed');
        }

        if (proposed_slots.length > 5) {
          throw new Error('Maximum 5 slots can be proposed at once');
        }

        // Create slot proposal
        const { data, error } = await supabase
          .from('slot_proposals')
          .insert({
            patient_id,
            therapist_id,
            proposed_slots: proposed_slots.map((slot: any) => ({
              start: slot.start,
              end: slot.end,
              confidence: slot.confidence || 0.8,
            })),
            status: 'pending',
            expires_at: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(), // 48 hours
          })
          .select()
          .single();

        if (error) {
          reportError(error, 'executeCalendarTool.propose_slots', { patient_id, therapist_id });
          throw error;
        }

        return {
          success: true,
          proposal_id: data.id,
          slots_count: proposed_slots.length,
          expires_at: data.expires_at,
        };
      }

      case 'disconnect_calendar': {
        const { therapist_id, provider } = args;
        await calendarService.disconnectCalendar(therapist_id, provider);

        return {
          success: true,
          message: `${provider} calendar disconnected successfully`,
        };
      }

      case 'get_team_calendars': {
        const { therapist_id, date_range } = args;
        const teamCalendars = await calendarService.getTeamCalendars(
          therapist_id,
          {
            start: new Date(date_range.start),
            end: new Date(date_range.end),
          }
        );

        // Format for response
        const formatted = Object.entries(teamCalendars).map(([therapistId, events]) => ({
          therapist_id: therapistId,
          events: events.map(e => ({
            start: e.start.toISOString(),
            end: e.end.toISOString(),
            is_busy: e.isBusy,
            source: e.source,
          })),
          event_count: events.length,
        }));

        return {
          success: true,
          team_calendars: formatted,
          total_therapists: formatted.length,
        };
      }

      case 'sync_calendar': {
        const { therapist_id } = args;
        await calendarService.syncTherapistCalendars(therapist_id);

        return {
          success: true,
          message: 'Calendar sync completed',
        };
      }

      default:
        throw new Error(`Unknown calendar tool: ${toolName}`);
    }
  } catch (error: any) {
    reportError(error, 'executeCalendarTool', { toolName, args });
    return {
      success: false,
      error: error.message || 'Tool execution failed',
    };
  }
}
