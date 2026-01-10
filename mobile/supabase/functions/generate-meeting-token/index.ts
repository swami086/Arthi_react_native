import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { reportError, reportInfo, extractTraceContext } from '../_shared/rollbar.ts';
import { corsHeaders } from '../_shared/cors.ts';

const DAILY_API_KEY = Deno.env.get('DAILY_API_KEY')!;

serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders });
    }

    const { traceId, spanId } = extractTraceContext(req);

    try {
        const { roomName, userId, isOwner } = await req.json();

        const response = await fetch('https://api.daily.co/v1/meeting-tokens', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${DAILY_API_KEY}`,
            },
            body: JSON.stringify({
                properties: {
                    room_name: roomName,
                    is_owner: isOwner || false,
                    user_id: userId,
                    exp: Math.floor(Date.now() / 1000) + (60 * 60), // 1 hour
                },
            }),
        });

        const tokenData = await response.json();

        if (!response.ok) {
            throw new Error(tokenData.message || 'Failed to generate token');
        }

        reportInfo('Meeting token generated', 'generate-meeting-token', { roomName }, traceId, spanId);

        return new Response(JSON.stringify({ token: tokenData.token }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    } catch (error: any) {
        await reportError(error, 'generate-meeting-token', { trace_id: traceId }, traceId, spanId);
        return new Response(JSON.stringify({ error: error.message, trace_id: traceId }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    }
});
