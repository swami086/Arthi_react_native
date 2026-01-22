/**
 * A2UI Infrastructure - Main Export
 * 
 * Central export point for all A2UI functionality.
 */

// Types
export type {
    A2UIComponent,
    A2UISurface,
    A2UIAction,
    A2UIDataBinding,
    A2UIMessage,
    SurfaceUpdateMessage,
    DataModelUpdateMessage,
    DeleteSurfaceMessage,
    ActionMessage,
    ComponentDefinition,
    ComponentCatalog,
    PropSchema,
    ValidationResult,
    MessageValidationResult,
    UseA2UIOptions,
    UseA2UIReturn,
    A2UIRendererProps,
    DataTransformFunction,
    SurfaceOperation,
} from './types';

// Renderer
export { A2UIRenderer, resolveJsonPointer, resolveDataBinding } from './renderer';

// Component Catalog
export {
    componentCatalog,
    getComponent,
    isComponentAllowed,
    validateComponentProps,
    getAllComponentTypes,
    getComponentsByCategory,
    getCategories,
} from './component-catalog';

// Message Validator
export {
    validateMessage,
    validateComponent,
    validateComponentTree,
    validateDataModel,
    sanitizeMessage,
} from './message-validator';

// Hook
export { useA2UI } from '../../hooks/use-a2ui';
