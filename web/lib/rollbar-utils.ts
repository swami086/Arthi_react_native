// import { AsyncLocalStorage } from 'async_hooks'; // Removed incompatible import
import rollbar from './rollbar';
import { sanitizeMetadata } from './metadata-sanitizer';

/**
 * Enhanced Rollbar Utilities for distributed tracing and structured logging.
 */

interface TraceContext {
    traceId: string;
    spanId: string | null;
    spanStack: Array<{ spanId: string | null, name: string }>;
    timers: Map<string, { startTime: number, timeoutId: NodeJS.Timeout }>;
}

// Global context for SSR (server-side)
let traceContext: any;

if (typeof window === 'undefined') {
    try {
        // Dynamic require to avoid bundling issues in browser
        const { AsyncLocalStorage } = require('async_hooks');
        traceContext = new AsyncLocalStorage();
    } catch (e) {
        // Fallback for environments where async_hooks might fail
        traceContext = {
            getStore: () => null,
            run: (_: any, cb: () => any) => cb()
        };
    }
} else {
    // Browser Mock
    traceContext = {
        getStore: () => null,
        run: (_: any, cb: () => any) => cb()
    };
}

// Fallback state for Client-side (browser)
let clientTraceId: string | null = null;
let clientSpanId: string | null = null;
let clientSpanStack: Array<{ spanId: string | null, name: string }> = [];
const clientTimers = new Map<string, { startTime: number, timeoutId: any }>();

const MAX_TIMERS = 1000;
const TIMER_TTL = 60000; // 1 minute
const MAX_SPAN_DEPTH = 20;

// UUID generator for trace IDs
export const generateUUID = () => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
};

// Helper: Get current context (Server or Client)
const getContext = () => {
    const store = traceContext.getStore();
    if (store) return store;

    // Client-side fallback
    if (typeof window !== 'undefined') {
        if (!clientTraceId && (window as any)._rollbarTraceId) {
            clientTraceId = (window as any)._rollbarTraceId;
        }
        return {
            traceId: clientTraceId || '', // Handle null in getTraceId
            spanId: clientSpanId,
            spanStack: clientSpanStack,
            timers: clientTimers
        };
    }

    // Default safe fallback for non-request server context
    return {
        traceId: '',
        spanId: null,
        spanStack: [],
        timers: new Map()
    };
};

export const runWithTraceContext = <T>(callback: () => T, traceId?: string): T => {
    const context: TraceContext = {
        traceId: traceId || generateUUID(),
        spanId: null,
        spanStack: [],
        timers: new Map()
    };
    return traceContext.run(context, callback);
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
            person: { id: null } as any,
        },
    });
};

export const addBreadcrumb = (message: string, category: string, level: 'info' | 'warning' | 'error' | 'debug' = 'info', metadata?: any) => {
    rollbar.info(`[${category}] ${message}`, sanitizeMetadata(metadata));
};

export const reportError = (error: any, context?: string, metadata?: any) => {
    const ctx = getContext();
    rollbar.error(error, {
        context,
        trace_id: getTraceId(),
        span_id: ctx.spanId,
        span_stack: ctx.spanStack.map((s: { name: string }) => s.name),
        ...sanitizeMetadata(metadata)
    });
};
// ...


export const reportWarning = (message: string, context?: string, metadata?: any) => {
    const ctx = getContext();
    rollbar.warning(message, {
        context,
        trace_id: getTraceId(),
        span_id: ctx.spanId,
        ...sanitizeMetadata(metadata)
    });
};

export const reportInfo = (message: string, context?: string, metadata?: any) => {
    const ctx = getContext();
    rollbar.info(message, {
        context,
        trace_id: getTraceId(),
        span_id: ctx.spanId,
        ...sanitizeMetadata(metadata)
    });
};

/**
 * Tracing utilities
 */
const SAMPLE_RATE = parseFloat(process.env.TRACE_SAMPLE_RATE || '1.0');

export const shouldTrace = () => {
    return Math.random() <= SAMPLE_RATE;
};

export const getTraceId = () => {
    const store = traceContext.getStore();
    if (store) return store.traceId;

    if (typeof window !== 'undefined') {
        if (!clientTraceId) {
            clientTraceId = (window as any)._rollbarTraceId || generateUUID();
            (window as any)._rollbarTraceId = clientTraceId;
        }
        return clientTraceId;
    }

    return clientTraceId || generateUUID();
};

export const resetTraceId = () => {
    const newId = generateUUID();
    const store = traceContext.getStore();

    if (store) {
        // Cannot easily reset store properties in ALC, but we can try if shared ref
        // ALC store is usually immutable or we shouldn't mutate it if we want propagation? 
        // We will mutate the object reference since we created it in runWithTraceContext
        store.traceId = newId;
        store.spanId = null;
        store.spanStack = [];
        store.timers.clear(); // Need to clear timers properly?
        return newId;
    }

    if (typeof window !== 'undefined') {
        clientTraceId = newId;
        (window as any)._rollbarTraceId = clientTraceId;
        clientSpanId = null;
        clientSpanStack = [];
        // Clear timers
        clientTimers.forEach(t => clearTimeout(t.timeoutId));
        clientTimers.clear();
    }
    return newId;
};

export const startSpan = (name: string, metadata?: any) => {
    const ctx = getContext();

    // 1. Stack Depth Validation
    if (ctx.spanStack.length >= MAX_SPAN_DEPTH) {
        reportWarning(`Span stack overflow prevented for span "${name}"`, 'DistributedTracing');
        return 'overflow-span-id';
    }

    const spanId = generateUUID().substring(0, 8);

    // 2. Fix Loop: Store parent span info properly
    // Push current context (which is the parent for the new span) to stack
    ctx.spanStack.push({ spanId: ctx.spanId, name });

    // Update current context to new span
    if (traceContext.getStore()) {
        const store = traceContext.getStore()!;
        store.spanId = spanId;
    } else {
        clientSpanId = spanId;
    }

    return spanId;
};

export const endSpan = () => {
    const ctx = getContext();

    // Validation
    if (ctx.spanStack.length === 0) {
        return;
    }

    const parent = ctx.spanStack.pop();
    const newSpanId = parent ? parent.spanId : null;

    if (traceContext.getStore()) {
        const store = traceContext.getStore()!;
        store.spanId = newSpanId;
    } else {
        clientSpanId = newSpanId;
    }
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
    const ctx = getContext();
    return {
        'X-Rollbar-Trace-Id': getTraceId(),
        'X-Rollbar-Span-Id': ctx.spanId || '',
        'X-Rollbar-Span-Stack': JSON.stringify(ctx.spanStack.map((s: { name: string }) => s.name)) // Only send names
    };
};

/**
 * Performance tracking helper
 */
export const startTimer = (name: string) => {
    const ctx = getContext();

    // Timer Cleanup / Limit
    if (ctx.timers.size >= MAX_TIMERS) {
        // Delete oldest (Map iterates in insertion order)
        const oldestKey = ctx.timers.keys().next().value;
        if (oldestKey) {
            const timer = ctx.timers.get(oldestKey);
            if (timer) clearTimeout(timer.timeoutId);
            ctx.timers.delete(oldestKey);
        }
    }

    const timeoutId = setTimeout(() => {
        const current = ctx.timers.get(name);
        if (current && current.timeoutId === timeoutId) { // Verify it's the same timer instance
            ctx.timers.delete(name);
            reportWarning(`Timer "${name}" auto-cleaned after ${TIMER_TTL}ms`, 'TimerCleanup');
        }
    }, TIMER_TTL);

    // Use unref if in Node environment to prevent preventing process exit
    if (typeof timeoutId === 'object' && timeoutId && 'unref' in timeoutId) {
        (timeoutId as any).unref();
    }

    ctx.timers.set(name, { startTime: performance.now(), timeoutId });
    startSpan(name);
};

export const endTimer = (name: string, context?: string, metadata?: any) => {
    endSpan();
    const ctx = getContext();
    const timerData = ctx.timers.get(name);

    if (timerData) {
        const { startTime, timeoutId } = timerData;
        clearTimeout(timeoutId);

        const duration = performance.now() - startTime;
        ctx.timers.delete(name);

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
