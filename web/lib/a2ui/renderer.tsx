/**
 * A2UI React Renderer
 * 
 * Main rendering engine for A2UI components with:
 * - Recursive component rendering
 * - JSON Pointer data binding resolution
 * - Action handling and validation
 * - Error boundaries
 * - Security validation
 */

'use client';

import React from 'react';
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

// ============================================================================
// Data Binding Resolution
// ============================================================================

/**
 * Resolve JSON Pointer path in data model
 * 
 * @example
 * resolveJsonPointer({ data: { moodScore: 8 } }, '/data/moodScore') // returns 8
 * resolveJsonPointer({ therapists: [{ name: 'Dr. Smith' }] }, '/therapists/0/name') // returns 'Dr. Smith'
 */
function resolveJsonPointer(dataModel: any, path: string): any {
    if (!path || path === '/') {
        return dataModel;
    }

    // Remove leading slash and split by /
    const segments = path.slice(1).split('/');
    let current = dataModel;

    for (const segment of segments) {
        // Decode JSON Pointer escape sequences
        const decodedSegment = segment.replace(/~1/g, '/').replace(/~0/g, '~');

        if (current === null || current === undefined) {
            return undefined;
        }

        // Handle array indices
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

/**
 * Built-in transform functions
 */
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
 * Resolve data binding with optional transform
 */
export function resolveDataBinding(
    binding: A2UIDataBinding,
    dataModel: any
): any {
    const value = resolveJsonPointer(dataModel, binding.path);

    if (value === undefined && binding.fallback !== undefined) {
        return binding.fallback;
    }

    if (binding.transform) {
        if (typeof binding.transform === 'function') {
            return binding.transform(value);
        } else if (typeof binding.transform === 'string' && transforms[binding.transform]) {
            return transforms[binding.transform](value);
        }
    }

    return value;
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
 * Render a single A2UI component recursively
 */
function renderComponent(
    component: A2UIComponent,
    context: RendererContext,
    depth: number = 0
): React.ReactNode {
    // Prevent infinite recursion
    if (depth > 20) {
        console.error('[A2UI] Maximum component depth exceeded');
        return null;
    }

    // Validate component structure
    const validation = validateComponent(component, validateComponentProps);
    if (!validation.valid) {
        console.error('[A2UI] Component validation failed:', validation.errors);
        if (context.debug) {
            return (
                <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                    <p className="text-red-600 dark:text-red-400 font-bold text-sm">
                        Component Validation Error
                    </p>
                    <ul className="mt-2 text-xs text-red-500 dark:text-red-300 list-disc list-inside">
                        {validation.errors?.map((error, i) => (
                            <li key={i}>{error}</li>
                        ))}
                    </ul>
                </div>
            );
        }
        return null;
    }

    // Check if component type is whitelisted
    if (!isComponentAllowed(component.type)) {
        console.error('[A2UI] Component type not allowed:', component.type);
        reportError(
            new Error(`Unauthorized component type: ${component.type}`),
            'a2ui.security_violation',
            { componentType: component.type, surfaceId: context.surface.surfaceId }
        );
        return null;
    }

    // Get component definition
    const definition = getComponent(component.type);
    if (!definition) {
        console.error('[A2UI] Component definition not found:', component.type);
        return null;
    }

    // Resolve data bindings
    const resolvedProps = { ...component.props };
    if (component.dataBinding) {
        for (const [propName, binding] of Object.entries(component.dataBinding)) {
            resolvedProps[propName] = resolveDataBinding(binding, context.surface.dataModel);
        }
    }

    // Wrap action handlers
    const wrappedProps = { ...resolvedProps };
    if (definition.allowedActions) {
        for (const actionType of definition.allowedActions) {
            const actionId = resolvedProps[actionType];
            if (actionId && typeof actionId === 'string') {
                wrappedProps[actionType] = (...args: any[]) => {
                    // Rate limiting
                    if (!checkRateLimit(context.surface.surfaceId)) {
                        console.warn('[A2UI] Rate limit exceeded for surface:', context.surface.surfaceId);
                        return;
                    }

                    // Create action object
                    const action: A2UIAction = {
                        surfaceId: context.surface.surfaceId,
                        actionId,
                        type: actionType,
                        payload: {
                            ...(component.actionPayload || {}),
                            ...(args[0] || {}),
                        },
                        metadata: {
                            componentId: component.id,
                            componentType: component.type,
                        },
                        timestamp: new Date().toISOString(),
                    };

                    // Trigger action callback
                    context.onAction(action);
                };
            }
        }
    }

    // Render children recursively
    let children: React.ReactNode = null;
    if (component.children && component.children.length > 0) {
        children = component.children.map((child, index) =>
            renderComponent(child, context, depth + 1)
        );
    } else if (resolvedProps.children) {
        children = resolvedProps.children;
    }

    // Create React element
    const ReactComponent = definition.reactComponent;
    return (
        <ReactComponent key={component.id} {...wrappedProps}>
            {children}
        </ReactComponent>
    );
}

// ============================================================================
// Error Boundary
// ============================================================================

class A2UIErrorBoundary extends React.Component<
    { children: React.ReactNode; surfaceId: string },
    ErrorBoundaryState
> {
    constructor(props: { children: React.ReactNode; surfaceId: string }) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(error: Error): ErrorBoundaryState {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        reportError(error, 'a2ui.render_error', {
            surfaceId: this.props.surfaceId,
            componentStack: errorInfo.componentStack,
        });
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="p-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl">
                    <h3 className="text-red-600 dark:text-red-400 font-bold text-lg mb-2">
                        Rendering Error
                    </h3>
                    <p className="text-red-500 dark:text-red-300 text-sm">
                        An error occurred while rendering this surface. Please try refreshing.
                    </p>
                    {this.state.error && (
                        <details className="mt-4">
                            <summary className="text-red-600 dark:text-red-400 text-xs font-bold cursor-pointer">
                                Error Details
                            </summary>
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
 * A2UI Renderer Component
 * 
 * Renders A2UI surfaces with validation, data binding, and action handling
 */
export const A2UIRenderer: React.FC<A2UIRendererProps> = ({
    surface,
    onAction,
    className,
    debug = false,
}) => {
    const context: RendererContext = {
        surface,
        onAction,
        debug,
    };

    // Validate surface structure
    if (!surface || !surface.components || !Array.isArray(surface.components)) {
        console.error('[A2UI] Invalid surface structure');
        return (
            <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                <p className="text-yellow-600 dark:text-yellow-400 font-bold text-sm">
                    Invalid Surface
                </p>
                <p className="text-yellow-500 dark:text-yellow-300 text-xs mt-1">
                    The surface structure is invalid or missing components.
                </p>
            </div>
        );
    }

    return (
        <A2UIErrorBoundary surfaceId={surface.surfaceId}>
            <div className={className} data-surface-id={surface.surfaceId}>
                {surface.components.map((component) =>
                    renderComponent(component, context)
                )}
            </div>
        </A2UIErrorBoundary>
    );
};

A2UIRenderer.displayName = 'A2UIRenderer';

// Export helper functions for testing
export { resolveJsonPointer, renderComponent };
