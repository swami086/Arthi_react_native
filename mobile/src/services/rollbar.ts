import React, { useEffect, useRef } from 'react';
import { AppState, AppStateStatus } from 'react-native';
// @ts-ignore
import { Client, Configuration } from 'rollbar-react-native';
// @ts-ignore
import { ROLLBAR_ACCESS_TOKEN, ROLLBAR_ENVIRONMENT, TRACE_SAMPLE_RATE, EXPO_PUBLIC_CODE_VERSION } from '@env';

// Basic UUID-like generator for browser/mobile environment
const generateUUID = () => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
};

// Persistent trace ID for the session, can be cleared/reset if needed
let currentTraceId = generateUUID();
let currentSpanId: string | null = null;
let spanStack: string[] = [];

const MAX_TIMERS = 1000;
const TIMER_TTL = 60000; // 1 minute
const MAX_SPAN_DEPTH = 20;

export const getTraceId = () => currentTraceId;
export const getSpanId = () => currentSpanId;

export const resetTraceId = () => {
    currentTraceId = generateUUID();
    currentSpanId = null;
    spanStack = [];
    clearAllTimers();
    return currentTraceId;
};

const timers = new Map<string, { startTime: number, timeoutId: any }>();

export const clearAllTimers = () => {
    timers.forEach(t => clearTimeout(t.timeoutId));
    timers.clear();
};

export const startTimer = (name: string) => {
    // Cleanup if too many timers
    if (timers.size >= MAX_TIMERS) {
        const oldestKey = timers.keys().next().value;
        if (oldestKey) {
            const timer = timers.get(oldestKey);
            if (timer) clearTimeout(timer.timeoutId);
            timers.delete(oldestKey);
        }
    }

    // Auto-cleanup after TTL
    const timeoutId = setTimeout(() => {
        const current = timers.get(name);
        if (current && current.timeoutId === timeoutId) {
            timers.delete(name);
            reportWarning(`Timer "${name}" auto-cleaned after ${TIMER_TTL}ms`, 'TimerCleanup');
        }
    }, TIMER_TTL);

    timers.set(name, { startTime: Date.now(), timeoutId });
};

export const endTimer = (name: string, context?: string, metadata?: Record<string, any>) => {
    const timerData = timers.get(name);
    if (!timerData) return;

    const { startTime, timeoutId } = timerData;
    clearTimeout(timeoutId);

    const duration = Date.now() - startTime;
    timers.delete(name);

    reportInfo(`Timer: ${name} took ${duration}ms`, context || 'Performance', {
        ...metadata,
        duration_ms: duration,
        timer_name: name
    });
};

const SAMPLE_RATE = parseFloat(TRACE_SAMPLE_RATE || '1.0');
export const shouldTrace = () => Math.random() <= SAMPLE_RATE;

export const generateSpanId = () => {
    return Math.random().toString(36).substring(2, 10);
};

export const startSpan = (name: string) => {
    if (spanStack.length >= MAX_SPAN_DEPTH) {
        reportWarning(`Span stack overflow prevented for span "${name}"`, 'DistributedTracing');
        return 'overflow-span-id';
    }

    const spanId = generateSpanId();
    if (currentSpanId) {
        spanStack.push(currentSpanId);
    }
    currentSpanId = spanId;
    return spanId;
};

export const endSpan = () => {
    currentSpanId = spanStack.pop() || null;
};

export const withRollbarTrace = (headers: Record<string, string> = {}) => {
    const traceHeaders: Record<string, string> = {
        ...headers,
        'X-Rollbar-Trace-Id': currentTraceId
    };
    if (currentSpanId) {
        traceHeaders['X-Rollbar-Span-Id'] = currentSpanId;
    }
    return traceHeaders;
};

export const withRollbarSpan = (spanName: string, headers: Record<string, string> = {}) => {
    startSpan(spanName);
    return withRollbarTrace(headers);
};

const rollbarConfig = {
    accessToken: ROLLBAR_ACCESS_TOKEN,
    captureUncaught: true,
    captureUnhandledRejections: true,
    logLevel: 'debug',

    // ADD THESE:
    autoInstrument: true,  // Enable automatic telemetry
    maxTelemetryEvents: 50,
    includeItemsInTelemetry: true,
    scrubTelemetryInputs: true,  // Privacy compliance
    captureEmail: true,  // If privacy policy allows
    captureUsername: true,

    payload: {
        environment: ROLLBAR_ENVIRONMENT || (__DEV__ ? 'development' : 'production'),
        client: {
            javascript: {
                source_map_enabled: true,
                code_version: EXPO_PUBLIC_CODE_VERSION || (__DEV__ ? 'development' : 'unknown'),
            },
        },
    },
    enabled: !!ROLLBAR_ACCESS_TOKEN,
    captureIp: false,
    scrubFields: ['password', 'token', 'access_token', 'secret', 'credit_card', 'cvv', 'card_number'],

    checkIgnore: function (isUncaught, args, payload) {
        const error = args[0];

        // Ignore known third-party errors
        if (error?.message?.includes('Network request failed')) {
            return true;  // User offline, not actionable
        }

        // Ignore development-only errors
        if (__DEV__ && error?.message?.includes('HMR')) {
            return true;
        }

        return false;
    },

    ignoredMessages: [
        'Network request failed',
        /ResizeObserver loop/i,
        'Non-Error promise rejection captured',
    ],
};

// @ts-ignore
const rollbar: any = new Client(rollbarConfig);

const sanitizeMetadata = (metadata: any, depth = 0, seen = new WeakSet()): any => {
    if (!metadata) return metadata;
    if (depth > 5) return '[Truncated]';

    // Primitive types pass through
    if (metadata === null || metadata === undefined) return metadata;
    if (typeof metadata !== 'object') return metadata;

    // Handle dates
    if (metadata instanceof Date) return metadata.toISOString();

    // Check circular references
    if (seen.has(metadata)) return '[Circular]';
    seen.add(metadata);

    // Handle Arrays
    if (Array.isArray(metadata)) {
        try {
            return metadata.map(item => sanitizeMetadata(item, depth + 1, seen));
        } catch (e) {
            return '[Array Error]';
        }
    }

    // Handle React Elements (avoid traversing Virtual DOM)
    if (React.isValidElement(metadata)) {
        return '[ReactElement]';
    }

    // Handle non-plain objects (e.g. Navigation proxies, synthetic events, class instances)
    // We only want to deeply traverse plain objects.
    const constructorName = metadata.constructor?.name;

    // Filter dangerous objects immediately
    if (constructorName && (
        constructorName.includes('Navigation') ||
        constructorName.includes('Route') ||
        constructorName === 'SyntheticEvent'
    )) {
        return `[${constructorName}]`;
    }

    if (constructorName && constructorName !== 'Object') {
        return `[Instance of ${constructorName}]`;
    }

    // Handle Plain Objects
    const sanitized: any = {};
    try {
        // Use Object.keys to iterate own properties
        const keys = Object.keys(metadata);

        for (const key of keys) {
            // Strip sensitive or dangerous keys immediately
            if (key === 'navigation' || key === 'route' || key === '_reactInternalFiber' || key === 'stateNode' || key === 'dispatch' || key === 'password' || key === 'token' || key === 'secret') {
                sanitized[key] = '[Stripped]';
                continue;
            }

            try {
                // Defensive property access
                const value = metadata[key];
                sanitized[key] = sanitizeMetadata(value, depth + 1, seen);
            } catch (propError) {
                sanitized[key] = '[Access Error]';
            }
        }
    } catch (iterError) {
        return '[Unserializable Object]';
    }

    return sanitized;
};

export const reportError = (error: any, context?: string, metadata?: Record<string, any>) => {
    try {
        let err = error;
        const safeMetadata = sanitizeMetadata(metadata);

        // Supabase errors are often plain objects with a 'message' property
        if (error && typeof error === 'object' && !error.name && !error.stack && error.message) {
            err = new Error(error.message);
            // Attach original error details to the new Error object for context
            (err as any).originalError = error;
            if (error.code) (err as any).code = error.code;
        } else if (typeof error === 'string') {
            err = new Error(error);
        }

        if (__DEV__) {
            console.error(`[Error] ${context || 'Unknown'}:`, error);
        }

        if (rollbarConfig.enabled) {
            rollbar.error(err, {
                context,
                ...safeMetadata,
                trace_id: currentTraceId,
                span_id: currentSpanId,
                trace_chain: [...spanStack, currentSpanId].filter(Boolean),
                timestamp: Date.now()
            });
        }
    } catch (e) {
        console.error('[Rollbar Service] Fatal error in reportError:', e);
    }
};

export const reportInfo = (message: string, context?: string, metadata?: object) => {
    try {
        const safeMetadata = sanitizeMetadata(metadata);
        if (__DEV__) {
            console.log(`[Info] ${context || 'Unknown'}:`, message);
        }
        if (rollbarConfig.enabled) {
            rollbar.info(message, {
                context,
                ...safeMetadata,
                trace_id: currentTraceId,
                span_id: currentSpanId,
                trace_chain: [...spanStack, currentSpanId].filter(Boolean),
                timestamp: Date.now()
            });
        }
    } catch (e) {
        console.error('[Rollbar Service] Fatal error in reportInfo:', e);
    }
};

export const reportWarning = (message: string, context?: string, metadata?: object) => {
    try {
        const safeMetadata = sanitizeMetadata(metadata);
        if (__DEV__) {
            console.warn(`[Warning] ${context || 'Unknown'}:`, message);
        }
        if (rollbarConfig.enabled) {
            rollbar.warning(message, {
                context,
                ...safeMetadata,
                trace_id: currentTraceId,
                span_id: currentSpanId,
                trace_chain: [...spanStack, currentSpanId].filter(Boolean),
                timestamp: Date.now()
            });
        }
    } catch (e) {
        console.error('[Rollbar Service] Fatal error in reportWarning:', e);
    }
};

export const addBreadcrumb = (message: string, category: string, level: 'info' | 'warning' | 'error' = 'info', metadata?: any) => {
    if (rollbarConfig.enabled) {
        rollbar.info(`[${category}] ${message}`, { ...sanitizeMetadata(metadata), breadcrumb: true });
    }
};

export const setRollbarUser = (userId: string, email?: string, username?: string, metadata?: object) => {
    if (!rollbarConfig.enabled) return;

    rollbar.setPerson(userId, email, username);
};

export const clearRollbarUser = () => {
    if (!rollbarConfig.enabled) return;

    rollbar.setPerson({});
};

// Lifecycle Management for App
export const registerRollbarLifecycle = () => {
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
        if (nextAppState === 'background' || nextAppState === 'inactive') {
            // App going to background/termination
            clearAllTimers();
            resetTraceId();

            // Check for unclosed spans
            if (spanStack.length > 0) {
                reportWarning(`${spanStack.length} unclosed spans detected on background`, 'Lifecycle');
            }
        }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => {
        subscription.remove();
    };
};


// HOC for performance tracking
export const withRollbarPerformance = (WrappedComponent: any, screenName: string) => {
    return (props: any) => {
        const spanId = startSpan(`screen.view.${screenName}`);
        startTimer(`screen_render_${screenName}`);

        // Use an effect to end the timer once the component mounts
        // This measures the initial render time
        const hasRendered = useRef(false);
        useEffect(() => {
            if (!hasRendered.current) {
                endTimer(`screen_render_${screenName}`, screenName);
                hasRendered.current = true;
            }
            return () => {
                endSpan();
            };
        }, []);

        return React.createElement(WrappedComponent, props);
    };
};

export default rollbar;
