/**
 * A2UI React Renderer
 * 
 * Main rendering engine for A2UI components with:
 * - Recursive component rendering
 * - JSON Pointer data binding resolution
 * - Action handling and validation
 * - Error boundaries
 * - Security validation
 * - DomPurify sanitization
 * - Performance monitoring
 */

'use client';

import React, { useEffect } from 'react';
import { reportError } from '@/lib/rollbar-utils';
import type {
    A2UIComponent,
    A2UISurface,
    A2UIAction,
    A2UIDataBinding,
    A2UIRendererProps,
    ErrorBoundaryState,
} from './types';
import {
    getComponent,
    isComponentAllowed,
    validateComponentProps,
} from './component-catalog';
import { validateComponent } from './message-validator';
import { validateAction } from './action-validator';
import { performanceMonitor } from './performance-monitor';
import { hipaaLogger } from './hipaa-logger';
import DOMPurify from 'dompurify';

// ============================================================================
// Data Binding Resolution
// ============================================================================

/**
 * Resolves a RFC 6901 JSON Pointer against a data object.
 * Supports array indices and tilde escape sequences (~0, ~1).
 * 
 * @param dataModel The data object to query
 * @param path The JSON pointer string (e.g., "/user/name", "/items/0")
 * @returns The resolved value or undefined if the path doesn't exist
 */
function resolveJsonPointer(dataModel: any, path: string): any {
    if (!path || path === '/') {
        return dataModel;
    }

    const segments = path.slice(1).split('/');
    let current = dataModel;

    for (const segment of segments) {
        const decodedSegment = segment.replace(/~1/g, '/').replace(/~0/g, '~');

        if (current === null || current === undefined) {
            return undefined;
        }

        if (Array.isArray(current)) {
            const index = parseInt(decodedSegment, 10);
            if (isNaN(index) || index < 0 || index >= current.length) {
                return undefined;
            }
            current = current[index];
        } else if (typeof current === 'object') {
            current = current[decodedSegment];
        } else {
            return undefined;
        }
    }

    return current;
}

const transforms: Record<string, (value: any) => any> = {
    uppercase: (value: any) => String(value).toUpperCase(),
    lowercase: (value: any) => String(value).toLowerCase(),
    'date-format': (value: any) => {
        try {
            return new Date(value).toLocaleDateString();
        } catch {
            return value;
        }
    },
    'number-format': (value: any) => {
        const num = Number(value);
        return isNaN(num) ? value : num.toLocaleString();
    },
    truncate: (value: any) => {
        const str = String(value);
        return str.length > 50 ? str.slice(0, 47) + '...' : str;
    },
};

/**
 * Resolves a data binding by retrieving the value from the data model and applying transfers.
 * 
 * @param binding The data binding configuration
 * @param dataModel The source data model
 * @returns The resolved and potentially transformed value
 */
export function resolveDataBinding(
    binding: A2UIDataBinding,
    dataModel: any
): any {
    const value = resolveJsonPointer(dataModel, binding.path);

    if (value === undefined && binding.fallback !== undefined) {
        return binding.fallback;
    }

    // Apply strict sanitization to bound string values
    let finalValue = value;
    if (typeof finalValue === 'string') {
        finalValue = DOMPurify.sanitize(finalValue, { ALLOWED_TAGS: [], ALLOWED_ATTR: [] });
    }

    if (binding.transform) {
        if (typeof binding.transform === 'function') {
            return binding.transform(finalValue);
        } else if (typeof binding.transform === 'string' && transforms[binding.transform]) {
            return transforms[binding.transform](finalValue);
        }
    }

    return finalValue;
}

// ============================================================================
// Action Rate Limiting
// ============================================================================

interface RateLimitState {
    count: number;
    resetTime: number;
}

const actionRateLimits = new Map<string, RateLimitState>();
const MAX_ACTIONS_PER_SECOND = 10;
const RATE_LIMIT_WINDOW_MS = 1000;

function checkRateLimit(surfaceId: string): boolean {
    const now = Date.now();
    const state = actionRateLimits.get(surfaceId);

    if (!state || now > state.resetTime) {
        actionRateLimits.set(surfaceId, {
            count: 1,
            resetTime: now + RATE_LIMIT_WINDOW_MS,
        });
        return true;
    }

    if (state.count >= MAX_ACTIONS_PER_SECOND) {
        return false;
    }

    state.count++;
    return true;
}

// ============================================================================
// Component Renderer
// ============================================================================

interface RendererContext {
    surface: A2UISurface;
    onAction: (action: A2UIAction) => void;
    debug: boolean;
}

/**
 * Recursively renders A2UI component tree into React components.
 * Handles validation, security, HIPAA logging, data binding, and action wrapping.
 * 
 * @param component The A2UI component definition to render
 * @param context The renderer context containing surface state and action handlers
 * @param depth Current recursion depth to prevent stack overflow
 * @returns A React node representing the component and its children
 */
function renderComponent(
    component: A2UIComponent,
    context: RendererContext,
    depth: number = 0
): React.ReactNode {
    // Determine start time for HIPAA/Perf metrics? 
    // Usually tracking react renders individually is too granular, tracking surface render end in root.

    // Log HIPAA render (sampled or aggregated in real use)
    hipaaLogger.logComponentRender(context.surface.surfaceId, component.type, context.surface.userId);

    // Prevent infinite recursion
    if (depth > 20) {
        console.error('[A2UI] Maximum component depth exceeded');
        return null;
    }

    const validation = validateComponent(component);
    if (!validation.valid) {
        console.error('[A2UI] Component validation failed:', validation.errors);
        hipaaLogger.logSecurityViolation('component_validation_failed', { component, errors: validation.errors });
        if (context.debug) {
            return (
                <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                    <p className="text-red-600 dark:text-red-400 font-bold text-sm">Component Validation Error</p>
                    <ul className="mt-2 text-xs text-red-500 dark:text-red-300 list-disc list-inside">
                        {validation.errors?.map((error, i) => <li key={i}>{error}</li>)}
                    </ul>
                </div>
            );
        }
        return null;
    }

    if (!isComponentAllowed(component.type)) {
        console.error('[A2UI] Component type not allowed:', component.type);
        const error = new Error(`Unauthorized component type: ${component.type}`);
        reportError(error, 'a2ui.security_violation', { componentType: component.type, surfaceId: context.surface.surfaceId });
        hipaaLogger.logSecurityViolation('unauthorized_component', { componentType: component.type, surfaceId: context.surface.surfaceId });
        return null;
    }

    const definition = getComponent(component.type);
    if (!definition) {
        return null;
    }

    const resolvedProps = { ...component.props };
    if (component.dataBinding) {
        for (const [propName, binding] of Object.entries(component.dataBinding)) {
            resolvedProps[propName] = resolveDataBinding(binding, context.surface.dataModel);
            // Log sensitive data access for HIPAA compliance
            hipaaLogger.logDataAccess(context.surface.surfaceId, binding.path, context.surface.userId);
        }
    }

    const wrappedProps = { ...resolvedProps };
    if (definition.allowedActions) {
        for (const actionType of definition.allowedActions) {
            const actionId = resolvedProps[actionType];
            if (actionId && typeof actionId === 'string') {
                wrappedProps[actionType] = (...args: any[]) => {
                    const startAction = performance.now();

                    if (!checkRateLimit(context.surface.surfaceId)) {
                        console.warn('[A2UI] Rate limit exceeded');
                        return;
                    }

                    const payloadMerged = {
                        ...(component.actionPayload || {}),
                        ...(args[0] || {}),
                    };

                    const action: A2UIAction = {
                        surfaceId: context.surface.surfaceId,
                        actionId,
                        type: actionType,
                        payload: payloadMerged,
                        metadata: {
                            componentId: component.id,
                            componentType: component.type,
                        },
                        timestamp: new Date().toISOString(),
                    };

                    // Action Validation
                    const actionValidation = validateAction(action);
                    if (!actionValidation.valid) {
                        console.error('[A2UI] Action validation failed:', actionValidation.errors);
                        hipaaLogger.logSecurityViolation('invalid_action', { action, errors: actionValidation.errors });
                        return; // Block invalid action
                    }

                    // HIPAA Log
                    hipaaLogger.logUserAction(action, context.surface.userId);

                    // Execute
                    context.onAction(action);

                    // Track Latency
                    const duration = performance.now() - startAction;
                    performanceMonitor.trackActionLatency(actionId, duration);
                };
            }
        }
    }

    let children: React.ReactNode = null;
    if (component.children && component.children.length > 0) {
        children = component.children.map((child) => renderComponent(child, context, depth + 1));
    } else if (resolvedProps.children) {
        children = resolvedProps.children;
    }

    const ReactComponent = definition.reactComponent;
    return (
        <div
            key={component.id}
            className={component.props?.containerClassName || ''}
            data-component-type={component.type}
            data-component-id={component.id}
        >
            <ReactComponent {...wrappedProps}>
                {children}
            </ReactComponent>
        </div>
    );
}

// ============================================================================
// Error Boundary
// ============================================================================

/**
 * Error boundary for A2UI components with automatic retry logic.
 * Reports errors to Rollbar and provides a user-friendly fallback.
 */
class A2UIErrorBoundary extends React.Component<
    { children: React.ReactNode; surfaceId: string },
    ErrorBoundaryState & { retryCount: number }
> {
    constructor(props: { children: React.ReactNode; surfaceId: string }) {
        super(props);
        this.state = { hasError: false, retryCount: 0 };
    }

    static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        reportError(error, 'a2ui.render_error', {
            surfaceId: this.props.surfaceId,
            componentStack: errorInfo.componentStack,
        });
    }

    handleRetry = () => {
        if (this.state.retryCount < 3) {
            this.setState(prev => ({ hasError: false, error: undefined, retryCount: prev.retryCount + 1 }));
        }
    }

    render() {
        if (this.state.hasError) {
            const canRetry = this.state.retryCount < 3;
            return (
                <div className="p-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl">
                    <h3 className="text-red-600 dark:text-red-400 font-bold text-lg mb-2">Rendering Error</h3>
                    <p className="text-red-500 dark:text-red-300 text-sm">
                        {canRetry ? "A temporary error occurred." : "Persistent error occurred. Please contact support."}
                    </p>

                    {canRetry && (
                        <button
                            onClick={this.handleRetry}
                            className="mt-4 px-4 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg text-sm font-medium transition-colors"
                        >
                            Retry ({3 - this.state.retryCount} left)
                        </button>
                    )}

                    {this.state.error && (
                        <details className="mt-4">
                            <summary className="text-red-600 dark:text-red-400 text-xs font-bold cursor-pointer">Error Details</summary>
                            <pre className="mt-2 p-3 bg-red-100 dark:bg-red-900/40 rounded-lg text-xs text-red-700 dark:text-red-300 overflow-auto">
                                {this.state.error.message}
                            </pre>
                        </details>
                    )}
                </div>
            );
        }
        return this.props.children;
    }
}

// ============================================================================
// Main Renderer Component
// ============================================================================

/**
 * Main A2UI Renderer component.
 * Measures render performance, applies error boundaries, and orchestrates recursive rendering.
 */
export const A2UIRenderer: React.FC<A2UIRendererProps> = ({
    surface,
    onAction,
    className,
    debug = false,
}) => {
    // Start measuring render time
    performanceMonitor.trackRenderStart(surface.surfaceId);

    // Track render completion
    useEffect(() => {
        performanceMonitor.trackRenderEnd(surface.surfaceId);
    }, [surface.surfaceId, surface.version]); // Track per version update

    const context: RendererContext = {
        surface,
        onAction,
        debug,
    };

    if (!surface || !surface.components || !Array.isArray(surface.components)) {
        console.error('[A2UI] Invalid surface structure');
        return null;
    }

    return (
        <A2UIErrorBoundary surfaceId={surface.surfaceId}>
            <div className={className} data-surface-id={surface.surfaceId}>
                {surface.components.map((component) => renderComponent(component, context))}
            </div>
        </A2UIErrorBoundary>
    );
};

export { resolveJsonPointer, renderComponent };
