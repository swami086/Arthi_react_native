import rollbar from './rollbar';
import { sanitizeMetadata } from './metadata-sanitizer';

/**
 * Enhanced Rollbar Utilities for distributed tracing and structured logging.
 */

// Span Stack for distributed tracing
let spanStack: string[] = [];
let currentSpanId: string | null = null;

// UUID generator for trace IDs
export const generateUUID = () => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
};

export const setRollbarUser = (id: string, email?: string, username?: string, metadata?: any) => {
    rollbar.configure({
        payload: {
            person: {
                id,
                email,
                username,
                ...sanitizeMetadata(metadata),
            },
        },
    });
};

export const clearRollbarUser = () => {
    rollbar.configure({
        payload: {
            person: null,
        },
    });
};

export const addBreadcrumb = (message: string, category: string, level: 'info' | 'warning' | 'error' | 'debug' = 'info', metadata?: any) => {
    rollbar.info(`[${category}] ${message}`, sanitizeMetadata(metadata));
};

export const reportError = (error: any, context?: string, metadata?: any) => {
    rollbar.error(error, {
        context,
        trace_id: getTraceId(),
        span_id: currentSpanId,
        span_stack: spanStack,
        ...sanitizeMetadata(metadata)
    });
};

export const reportWarning = (message: string, context?: string, metadata?: any) => {
    rollbar.warning(message, {
        context,
        trace_id: getTraceId(),
        span_id: currentSpanId,
        ...sanitizeMetadata(metadata)
    });
};

export const reportInfo = (message: string, context?: string, metadata?: any) => {
    rollbar.info(message, {
        context,
        trace_id: getTraceId(),
        span_id: currentSpanId,
        ...sanitizeMetadata(metadata)
    });
};

/**
 * Tracing utilities
 */
let currentTraceId = typeof window !== 'undefined' ? (window as any)._rollbarTraceId : null;
const SAMPLE_RATE = parseFloat(process.env.TRACE_SAMPLE_RATE || '1.0');

export const shouldTrace = () => {
    return Math.random() <= SAMPLE_RATE;
};

export const getTraceId = () => {
    if (!currentTraceId) {
        currentTraceId = generateUUID();
        if (typeof window !== 'undefined') {
            (window as any)._rollbarTraceId = currentTraceId;
        }
    }
    return currentTraceId;
};

export const resetTraceId = () => {
    currentTraceId = generateUUID();
    if (typeof window !== 'undefined') {
        (window as any)._rollbarTraceId = currentTraceId;
    }
    spanStack = [];
    currentSpanId = null;
    return currentTraceId;
};

export const startSpan = (name: string, metadata?: any) => {
    const spanId = generateUUID().substring(0, 8);
    spanStack.push(name);
    currentSpanId = spanId;
    return spanId;
};

export const endSpan = () => {
    spanStack.pop();
    currentSpanId = spanStack.length > 0 ? 'parent-' + spanStack[spanStack.length - 1] : null;
};

export const withRollbarSpan = <T>(name: string, operation: () => T): T => {
    startSpan(name);
    try {
        return operation();
    } finally {
        endSpan();
    }
};

export const withRollbarTrace = () => {
    return {
        'X-Rollbar-Trace-Id': getTraceId(),
        'X-Rollbar-Span-Id': currentSpanId || '',
        'X-Rollbar-Span-Stack': JSON.stringify(spanStack)
    };
};

/**
 * Performance tracking helper
 */
const timers = new Map<string, number>();

export const startTimer = (name: string) => {
    timers.set(name, performance.now());
    startSpan(name);
};

export const endTimer = (name: string, context?: string, metadata?: any) => {
    endSpan();
    const startTime = timers.get(name);
    if (startTime) {
        const duration = performance.now() - startTime;
        timers.delete(name);
        rollbar.info(`[Performance] ${name} took ${duration.toFixed(2)}ms`, {
            duration,
            context,
            trace_id: getTraceId(),
            ...sanitizeMetadata(metadata)
        });
        return duration;
    }
    return null;
};
