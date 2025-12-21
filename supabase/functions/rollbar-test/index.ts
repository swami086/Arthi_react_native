import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { reportError } from '../_shared/rollbar.ts';

serve(async (req) => {
    try {
        const { message } = await req.json().catch(() => ({ message: 'Manual Trigger' }));
        console.log("Triggering test error:", message);
        throw new Error(`Manual Backend Test: ${message}`);
    } catch (error: any) {
        await reportError(error, 'rollbar-test-function');
        return new Response(JSON.stringify({ reported: true, error: error.message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
});
