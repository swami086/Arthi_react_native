// Import Rollbar for Deno
import Rollbar from 'npm:rollbar@2.26.5';

const rollbar = new Rollbar({
    accessToken: Deno.env.get('ROLLBAR_SERVER_ACCESS_TOKEN') || '',
    environment: Deno.env.get('ROLLBAR_ENVIRONMENT') || 'production',
    captureUncaught: false, // Handle manually in Deno
    captureUnhandledRejections: false,
    enabled: !!Deno.env.get('ROLLBAR_SERVER_ACCESS_TOKEN'),
    payload: {
        server: {
            root: 'supabase-functions',
        },
    },
});

const timers = new Map<string, number>();

export const startTimer = (name: string) => {
    timers.set(name, Date.now());
};

export const endTimer = (name: string, context?: string, metadata?: Record<string, any>, traceId?: string, spanId?: string): Promise<void> => {
    const start = timers.get(name);
    if (!start) return Promise.resolve();
    const duration = Date.now() - start;
    timers.delete(name);

    return reportInfo(`Timer: ${name} took ${duration}ms`, context || 'Performance', {
        ...metadata,
        duration_ms: duration,
        timer_name: name
    }, traceId, spanId);
};

const SAMPLE_RATE = parseFloat(Deno.env.get('TRACE_SAMPLE_RATE') || '1.0');
export const shouldTrace = () => Math.random() <= SAMPLE_RATE;


// Helper to extract trace context from request headers
export const extractTraceContext = (req: Request) => {
    return {
        traceId: req.headers.get('X-Rollbar-Trace-Id') || undefined,
        spanId: req.headers.get('X-Rollbar-Span-Id') || undefined
    };
};

export const getTraceId = (req: Request): string | undefined => {
    return req.headers.get('X-Rollbar-Trace-Id') || undefined;
};

export const getSpanId = (req: Request): string | undefined => {
    return req.headers.get('X-Rollbar-Span-Id') || undefined;
};

export const reportError = (error: any, context?: string, metadata?: Record<string, any>, traceId?: string, spanId?: string): Promise<void> => {
    console.error(`[Error] ${context || 'Unknown'}:`, error);
    if (rollbar.options.enabled) {
        return new Promise((resolve) => {
            const payload = {
                context,
                timestamp: Date.now(),
                ...(traceId && { trace_id: traceId }),
                ...(spanId && { span_id: spanId }),
                ...metadata
            };
            rollbar.error(error, payload, (err) => {
                if (err) console.error("Rollbar reporting failed:", err);
                resolve();
            });
        });
    }
    return Promise.resolve();
};

export const reportInfo = (message: string, context?: string, metadata?: Record<string, any>, traceId?: string, spanId?: string): Promise<void> => {
    console.log(`[Info] ${context || 'Unknown'}:`, message);
    if (rollbar.options.enabled) {
        return new Promise((resolve) => {
            rollbar.info(message, {
                context,
                timestamp: Date.now(),
                ...(traceId && { trace_id: traceId }),
                ...(spanId && { span_id: spanId }),
                ...metadata
            }, (err) => {
                if (err) console.error("Rollbar reporting failed:", err);
                resolve();
            });
        });
    }
    return Promise.resolve();
};

export const reportWarning = (message: string, context?: string, metadata?: Record<string, any>, traceId?: string, spanId?: string): Promise<void> => {
    console.warn(`[Warning] ${context || 'Unknown'}:`, message);
    if (rollbar.options.enabled) {
        return new Promise((resolve) => {
            rollbar.warning(message, {
                context,
                timestamp: Date.now(),
                ...(traceId && { trace_id: traceId }),
                ...(spanId && { span_id: spanId }),
                ...metadata
            }, (err) => {
                if (err) console.error("Rollbar reporting failed:", err);
                resolve();
            });
        });
    }
    return Promise.resolve();
};

export default rollbar;
