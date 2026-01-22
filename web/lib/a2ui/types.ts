/**
 * A2UI Type Definitions
 * 
 * Comprehensive TypeScript interfaces for the A2UI (Agent-to-UI) infrastructure.
 * Supports dynamic UI rendering, data binding, and bidirectional agent-UI communication.
 */

// ============================================================================
// Core A2UI Component Types
// ============================================================================

/**
 * Transform function for data binding values
 */
export type DataTransformFunction = (value: any) => any;

/**
 * JSON Pointer-based data binding configuration
 * 
 * @example
 * { path: '/data/moodScore', fallback: 0 }
 * { path: '/therapists/0/name', transform: 'uppercase' }
 */
export interface A2UIDataBinding {
    /** JSON Pointer path (RFC 6901) - e.g., '/data/moodScore' */
    path: string;
    /** Optional fallback value when path doesn't exist */
    fallback?: any;
    /** Optional transform to apply to resolved value */
    transform?: string | DataTransformFunction;
}

/**
 * User action triggered from UI components
 */
export interface A2UIAction {
    /** Unique surface identifier this action belongs to */
    surfaceId: string;
    /** Unique identifier for this action */
    actionId: string;
    /** Type of action (e.g., 'click', 'change', 'submit') */
    type: string;
    /** Action payload data */
    payload?: any;
    /** Additional metadata */
    metadata?: Record<string, any>;
    /** Timestamp when action was triggered */
    timestamp?: string;
}

/**
 * Base interface for all A2UI components
 */
export interface A2UIComponent {
    /** Component type identifier (must match catalog entry) */
    type: string;
    /** Unique component ID within the surface */
    id: string;
    /** Component props (validated against catalog schema) */
    props?: Record<string, any>;
    /** Child components for recursive rendering */
    children?: A2UIComponent[];
    /** Data binding configuration for dynamic props */
    dataBinding?: Record<string, A2UIDataBinding>;
    /** Allowed actions for this component */
    actions?: string[];
    /** Component metadata */
    metadata?: Record<string, any>;
    /** Static payload to merge into actions triggered by this component */
    actionPayload?: Record<string, any>;
}

/**
 * Container for A2UI components with data model
 */
export interface A2UISurface {
    /** Unique surface identifier */
    surfaceId: string;
    /** User ID this surface belongs to */
    userId: string;
    /** Agent ID that created/manages this surface */
    agentId: string;
    /** Root components to render */
    components: A2UIComponent[];
    /** Data model for binding resolution */
    dataModel: Record<string, any>;
    /** Surface metadata */
    metadata?: Record<string, any>;
    /** Surface version for optimistic updates */
    version: number;
    /** Creation timestamp */
    createdAt?: string;
    /** Last update timestamp */
    updatedAt?: string;
}

// ============================================================================
// Message Types for Agent-UI Communication
// ============================================================================

/**
 * Surface update operations
 */
export type SurfaceOperation = 'create' | 'update' | 'replace' | 'delete' | 'patch';

/**
 * Agent-to-UI surface update message
 */
export interface SurfaceUpdateMessage {
    type: 'surfaceUpdate';
    /** Operation to perform */
    operation: SurfaceOperation;
    /** Target surface ID */
    surfaceId: string;
    /** User ID (for validation) */
    userId: string;
    /** Agent ID (for validation) */
    agentId: string;
    /** Components to create/update */
    components?: A2UIComponent[];
    /** Data model to create/update */
    dataModel?: Record<string, any>;
    /** Surface metadata */
    metadata?: Record<string, any>;
    /** Message timestamp */
    timestamp?: string;
}

/**
 * Partial data model update using JSON Pointer paths
 * 
 * @example
 * {
 *   type: 'dataModelUpdate',
 *   surfaceId: 'surface-123',
 *   updates: {
 *     '/data/moodScore': 8,
 *     '/therapists/0/isOnline': true
 *   }
 * }
 */
export interface DataModelUpdateMessage {
    type: 'dataModelUpdate';
    /** Target surface ID */
    surfaceId: string;
    /** JSON Pointer paths with new values */
    updates: Record<string, any>;
    /** Message timestamp */
    timestamp?: string;
}

/**
 * Surface deletion message
 */
export interface DeleteSurfaceMessage {
    type: 'deleteSurface';
    /** Surface ID to delete */
    surfaceId: string;
    /** Message timestamp */
    timestamp?: string;
}

/**
 * UI-to-Agent action message
 */
export interface ActionMessage {
    type: 'action';
    /** Source surface ID */
    surfaceId: string;
    /** User ID (for validation) */
    userId: string;
    /** Action identifier */
    actionId: string;
    /** Action type */
    actionType: string;
    /** Action payload */
    payload?: any;
    /** Action metadata */
    metadata?: Record<string, any>;
    /** Message timestamp */
    timestamp?: string;
}

/**
 * Union type for all A2UI messages
 */
export type A2UIMessage =
    | SurfaceUpdateMessage
    | DataModelUpdateMessage
    | DeleteSurfaceMessage
    | ActionMessage;

// ============================================================================
// Component Catalog Types
// ============================================================================

/**
 * JSON Schema for component prop validation
 */
export interface PropSchema {
    type: string;
    properties?: Record<string, any>;
    required?: string[];
    additionalProperties?: boolean;
    [key: string]: any;
}

/**
 * Component definition in the catalog
 */
export interface ComponentDefinition {
    /** Component type identifier */
    componentType: string;
    /** React component to render */
    reactComponent: React.ComponentType<any>;
    /** JSON Schema for prop validation */
    propSchema: PropSchema;
    /** Allowed action types for this component */
    allowedActions?: string[];
    /** Component description */
    description?: string;
    /** Component category */
    category?: string;
}

/**
 * Component catalog mapping
 */
export type ComponentCatalog = Record<string, ComponentDefinition>;

// ============================================================================
// Validation Types
// ============================================================================

/**
 * Validation result
 */
export interface ValidationResult {
    /** Whether validation passed */
    valid: boolean;
    /** Validation errors */
    errors?: string[];
    /** Validated data (sanitized) */
    data?: any;
}

/**
 * Message validation result with type information
 */
export interface MessageValidationResult extends ValidationResult {
    /** Detected message type */
    messageType?: string;
}

// ============================================================================
// Hook Types
// ============================================================================

/**
 * Options for useA2UI hook
 */
export interface UseA2UIOptions {
    /** User ID to filter surfaces */
    userId: string;
    /** Optional agent ID to filter surfaces */
    agentId?: string;
    /** Optional specific surface ID to load */
    surfaceId?: string;
    /** Enable realtime subscriptions */
    enableRealtime?: boolean;
}

/**
 * Return type for useA2UI hook
 */
export interface UseA2UIReturn {
    /** Map of surfaces by surfaceId */
    surfaces: Map<string, A2UISurface>;
    /** Loading state */
    loading: boolean;
    /** Error message if any */
    error: string | null;
    /** Send action to agent */
    sendAction: (action: A2UIAction) => Promise<void>;
    /** Refetch surfaces from database */
    refetch: () => Promise<void>;
    /** Connection status */
    connected: boolean;
}

// ============================================================================
// Renderer Types
// ============================================================================

/**
 * Props for A2UIRenderer component
 */
export interface A2UIRendererProps {
    /** Surface to render */
    surface: A2UISurface;
    /** Action callback */
    onAction: (action: A2UIAction) => void;
    /** Optional className for container */
    className?: string;
    /** Enable debug mode */
    debug?: boolean;
}

/**
 * Error boundary state
 */
export interface ErrorBoundaryState {
    hasError: boolean;
    error?: Error;
    errorInfo?: React.ErrorInfo;
}
