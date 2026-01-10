import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { reportError, reportInfo, extractTraceContext } from '../_shared/rollbar.ts';
import { corsHeaders } from '../_shared/cors.ts';

const DAILY_API_KEY = Deno.env.get('DAILY_API_KEY')!;

serve(async (req) => {
    // Handle CORS
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders });
    }

    const { traceId, spanId } = extractTraceContext(req);
    try {
        const { appointmentId } = await req.json();

        // Create Daily.co room
        const response = await fetch('https://api.daily.co/v1/rooms', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${DAILY_API_KEY}`,
            },
            body: JSON.stringify({
                name: `safespace-${appointmentId}`,
                privacy: 'private',
                properties: {
                    enable_recording: 'cloud',
                    enable_chat: false,
                    enable_screenshare: false,
                    max_participants: 2,
                    exp: Math.floor(Date.now() / 1000) + (60 * 60 * 2), // 2 hours
                },
            }),
        });

        const room = await response.json();

        // Check response ok
        if (!response.ok) {
            throw new Error(room.message || 'Failed to create room');
        }

        const { createClient } = await import('https://esm.sh/@supabase/supabase-js@2');
        const supabase = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        );

        // Store in database
        const { error: dbError } = await supabase
            .from('video_rooms')
            .insert({
                appointment_id: appointmentId,
                room_name: room.name,
                room_url: room.url,
                daily_room_id: room.id,
                provider: 'daily',
                status: 'created',
                recording_enabled: true,
                duration_minutes: 60
            });

        if (dbError) throw dbError;

        reportInfo('Daily.co room created', 'create-video-room', {
            appointmentId,
            roomName: room.name
        }, traceId, spanId);

        return new Response(JSON.stringify({ videoRoom: room }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    } catch (error: any) {
        await reportError(error, 'create-video-room', {
            trace_id: traceId,
            span_id: spanId
        }, traceId, spanId);

        return new Response(JSON.stringify({
            error: 'Internal server error',
            trace_id: traceId
        }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    }
});
