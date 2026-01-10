// @ts-nocheck
import Rollbar from 'https://esm.sh/rollbar@2.26.5';

const rollbar = new Rollbar({
    accessToken: Deno.env.get('ROLLBAR_SERVER_ACCESS_TOKEN') || '',
    environment: Deno.env.get('ROLLBAR_ENVIRONMENT') || 'production',
    captureUncaught: true,
    captureUnhandledRejections: true,
    payload: {
        server: {
            host: 'supabase-edge-functions',
        },
    },
});

export { rollbar };

export const reportError = (
    error: any,
    context?: string,
    metadata?: Record<string, any>,
    traceId?: string,
    spanId?: string
) => {
    rollbar.error(error, {
        context,
        ...metadata,
        trace_id: traceId,
        span_id: spanId,
        timestamp: Date.now(),
    });
};

export const reportInfo = (
    message: string,
    context?: string,
    metadata?: Record<string, any>,
    traceId?: string,
    spanId?: string
) => {
    rollbar.info(message, {
        context,
        ...metadata,
        trace_id: traceId,
        span_id: spanId,
        timestamp: Date.now(),
    });
};

export const startTimer = (name: string) => {
    return Date.now();
};

export const endTimer = (
    startTime: number,
    name: string,
    context?: string,
    metadata?: Record<string, any>,
    traceId?: string,
    spanId?: string
) => {
    const duration = Date.now() - startTime;
    reportInfo(`Timer: ${name} took ${duration}ms`, context, {
        ...metadata,
        duration_ms: duration,
        timer_name: name,
    }, traceId, spanId);
};

export const extractTraceContext = (req: Request) => {
    const headers = req.headers;
    return {
        traceId: headers.get('X-Rollbar-Trace-Id') || crypto.randomUUID(),
        spanId: headers.get('X-Rollbar-Span-Id') || Math.random().toString(36).substring(2, 10),
    };
};
