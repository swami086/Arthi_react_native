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
        const { roomName } = await req.json();

        const response = await fetch(\`https://api.daily.co/v1/rooms/\${roomName}\`, {
            method: 'DELETE',
            headers: {
                'Authorization': \`Bearer \${DAILY_API_KEY}\`,
            },
        });

        const data = await response.json();

        if (!response.ok && response.status !== 404) {
            throw new Error(data.message || 'Failed to delete room');
        }

        reportInfo('Video room deleted', 'delete-video-room', { roomName }, traceId, spanId);

        return new Response(JSON.stringify({ success: true }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    } catch (error: any) {
        await reportError(error, 'delete-video-room', { trace_id: traceId }, traceId, spanId);
        return new Response(JSON.stringify({ error: error.message, trace_id: traceId }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    }
});
