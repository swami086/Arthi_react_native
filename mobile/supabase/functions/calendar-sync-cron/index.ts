// @ts-nocheck
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { CalendarService } from '../_shared/calendar-integrations/calendar-service.ts';
import { reportError, reportInfo, extractTraceContext } from '../_shared/rollbar.ts';
import { corsHeaders } from '../_shared/cors.ts';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

serve(async (req) => {
    // Handle CORS
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders });
    }

    const { traceId, spanId } = extractTraceContext(req);
    const startTime = Date.now();

    reportInfo('Calendar sync cron started', 'calendar-sync-cron:start', { traceId });

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const calendarService = new CalendarService(supabase);

    let calendarsSynced = 0;
    let calendarsFailed = 0;
    const errors: any[] = [];

    try {
        // Get all therapists with connected calendars
        const { data: therapists, error: fetchError } = await supabase
            .from('profiles')
            .select('user_id')
            .eq('role', 'therapist');

        if (fetchError) {
            throw fetchError;
        }

        if (!therapists || therapists.length === 0) {
            reportInfo('No therapists found', 'calendar-sync-cron:no-therapists', { traceId });
            return new Response(
                JSON.stringify({
                    success: true,
                    message: 'No therapists found',
                    calendarsSynced: 0,
                    calendarsFailed: 0,
                }),
                {
                    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                }
            );
        }

        // Sync calendars for each therapist
        for (const therapist of therapists) {
            try {
                reportInfo(`Syncing calendars for therapist ${therapist.user_id}`, 'calendar-sync-cron:sync', {
                    therapistId: therapist.user_id,
                    traceId,
                });

                await calendarService.syncTherapistCalendars(therapist.user_id);
                calendarsSynced++;

                reportInfo(`Successfully synced calendars for therapist ${therapist.user_id}`, 'calendar-sync-cron:success', {
                    therapistId: therapist.user_id,
                    traceId,
                });
            } catch (error: any) {
                calendarsFailed++;
                errors.push({
                    therapistId: therapist.user_id,
                    error: error.message || 'Unknown error',
                });

                reportError(error, 'calendar-sync-cron:sync-error', {
                    therapistId: therapist.user_id,
                    traceId,
                });

                // Continue with other therapists even if one fails
            }
        }

        // Cleanup expired events
        try {
            const { error: cleanupError } = await supabase.rpc('cleanup_expired_calendar_events');
            if (cleanupError) {
                reportError(cleanupError, 'calendar-sync-cron:cleanup-events', { traceId });
            }
        } catch (error: any) {
            reportError(error, 'calendar-sync-cron:cleanup-events', { traceId });
        }

        // Cleanup expired slot proposals
        try {
            const { error: cleanupError } = await supabase.rpc('cleanup_expired_slot_proposals');
            if (cleanupError) {
                reportError(cleanupError, 'calendar-sync-cron:cleanup-proposals', { traceId });
            }
        } catch (error: any) {
            reportError(error, 'calendar-sync-cron:cleanup-proposals', { traceId });
        }

        const duration = Date.now() - startTime;

        reportInfo('Calendar sync cron completed', 'calendar-sync-cron:complete', {
            traceId,
            duration,
            calendarsSynced,
            calendarsFailed,
        });

        return new Response(
            JSON.stringify({
                success: true,
                calendarsSynced,
                calendarsFailed,
                errors: errors.length > 0 ? errors : undefined,
                duration,
            }),
            {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            }
        );
    } catch (error: any) {
        const duration = Date.now() - startTime;

        reportError(error, 'calendar-sync-cron:fatal', {
            traceId,
            duration,
        });

        return new Response(
            JSON.stringify({
                success: false,
                error: error.message || 'Calendar sync cron failed',
                calendarsSynced,
                calendarsFailed,
                duration,
            }),
            {
                status: 500,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            }
        );
    }
});
