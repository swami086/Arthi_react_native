import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { reportError, reportInfo, extractTraceContext, startTimer, endTimer } from '../_shared/rollbar.ts';

serve(async (req) => {
    const { traceId, spanId } = extractTraceContext(req);
    startTimer('backend-test-operation');

    try {
        const body = await req.json().catch(() => ({}));
        const { message, simulate_error } = body;

        await reportInfo(`Backend processing started: ${message || 'No message'}`, 'rollbar-test:start', {
            received_body: body
        }, traceId, spanId);

        if (simulate_error) {
            throw new Error(`Simulated Backend Error: ${message}`);
        }

        await endTimer('backend-test-operation', 'rollbar-test:end', {
            status: 'success'
        }, traceId, spanId);

        return new Response(JSON.stringify({
            success: true,
            trace_id: traceId,
            span_id: spanId
        }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (error: any) {
        await reportError(error, 'rollbar-test:error', {
            trace_id_check: traceId,
            span_id_check: spanId
        }, traceId, spanId);

        await endTimer('backend-test-operation', 'rollbar-test:end', {
            status: 'error'
        }, traceId, spanId);

        return new Response(JSON.stringify({
            reported: true,
            error: error.message,
            trace_id: traceId,
            span_id: spanId
        }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
});
