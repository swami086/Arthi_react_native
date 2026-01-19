/**
 * A2UI Message Validator
 * 
 * JSON Schema-based validation for A2UI messages using Ajv.
 * Ensures security by validating all incoming messages and sanitizing potentially dangerous content.
 */

import Ajv, { type JSONSchemaType } from 'ajv';
import addFormats from 'ajv-formats';
import type {
    A2UIMessage,
    A2UIComponent,
    A2UIDataBinding,
    SurfaceUpdateMessage,
    DataModelUpdateMessage,
    DeleteSurfaceMessage,
    ActionMessage,
    ValidationResult,
    MessageValidationResult,
} from './types';

// ============================================================================
// Ajv Setup
// ============================================================================

const ajv = new Ajv({
    allErrors: true,
    strict: false,
    removeAdditional: true, // Remove additional properties not in schema
});

// Add format validators
addFormats(ajv);

// Custom JSON Pointer format validator
ajv.addFormat('json-pointer', {
    type: 'string',
    validate: (data: string) => {
        return /^(\/[^/~]*(~[01][^/~]*)*)*$/.test(data);
    },
});

// ============================================================================
// Message Schemas
// ============================================================================

const surfaceUpdateSchema: JSONSchemaType<SurfaceUpdateMessage> = {
    type: 'object',
    properties: {
        type: { type: 'string', const: 'surfaceUpdate' },
        operation: { type: 'string', enum: ['create', 'update', 'replace', 'delete'] },
        surfaceId: { type: 'string', minLength: 1 },
        userId: { type: 'string', minLength: 1 },
        agentId: { type: 'string', minLength: 1 },
        components: {
            type: 'array',
            items: { type: 'object' },
            nullable: true,
        },
        dataModel: {
            type: 'object',
            nullable: true,
        },
        metadata: {
            type: 'object',
            nullable: true,
        },
        timestamp: {
            type: 'string',
            format: 'date-time',
            nullable: true,
        },
    },
    required: ['type', 'operation', 'surfaceId', 'userId', 'agentId'],
    additionalProperties: false,
};

const dataModelUpdateSchema: JSONSchemaType<DataModelUpdateMessage> = {
    type: 'object',
    properties: {
        type: { type: 'string', const: 'dataModelUpdate' },
        surfaceId: { type: 'string', minLength: 1 },
        updates: { type: 'object' },
        timestamp: {
            type: 'string',
            format: 'date-time',
            nullable: true,
        },
    },
    required: ['type', 'surfaceId', 'updates'],
    additionalProperties: false,
};

const deleteSurfaceSchema: JSONSchemaType<DeleteSurfaceMessage> = {
    type: 'object',
    properties: {
        type: { type: 'string', const: 'deleteSurface' },
        surfaceId: { type: 'string', minLength: 1 },
        timestamp: {
            type: 'string',
            format: 'date-time',
            nullable: true,
        },
    },
    required: ['type', 'surfaceId'],
    additionalProperties: false,
};

const actionMessageSchema: JSONSchemaType<ActionMessage> = {
    type: 'object',
    properties: {
        type: { type: 'string', const: 'action' },
        surfaceId: { type: 'string', minLength: 1 },
        userId: { type: 'string', minLength: 1 },
        actionId: { type: 'string', minLength: 1 },
        actionType: { type: 'string', minLength: 1 },
        payload: { type: 'object', nullable: true },
        metadata: { type: 'object', nullable: true },
        timestamp: {
            type: 'string',
            format: 'date-time',
            nullable: true,
        },
    },
    required: ['type', 'surfaceId', 'userId', 'actionId', 'actionType'],
    additionalProperties: false,
};

// Compile schemas
const validateSurfaceUpdate = ajv.compile(surfaceUpdateSchema);
const validateDataModelUpdate = ajv.compile(dataModelUpdateSchema);
const validateDeleteSurface = ajv.compile(deleteSurfaceSchema);
const validateActionMessage = ajv.compile(actionMessageSchema);

// ============================================================================
// Component Validation
// ============================================================================

/**
 * Validate component structure recursively
 */
export function validateComponent(
    component: any,
    validateProps: (type: string, props: any) => ValidationResult = () => ({ valid: true })
): ValidationResult {
    // Basic structure validation
    if (!component || typeof component !== 'object') {
        return {
            valid: false,
            errors: ['Component must be an object'],
        };
    }

    if (!component.type || typeof component.type !== 'string') {
        return {
            valid: false,
            errors: ['Component must have a string type'],
        };
    }

    if (!component.id || typeof component.id !== 'string') {
        return {
            valid: false,
            errors: ['Component must have a string id'],
        };
    }

    // Validate component ID format (alphanumeric, hyphens, underscores only)
    if (!/^[a-zA-Z0-9_-]+$/.test(component.id)) {
        return {
            valid: false,
            errors: ['Component ID must contain only alphanumeric characters, hyphens, and underscores'],
        };
    }

    // Validate props if present
    if (component.props) {
        const propsValidation = validateProps(component.type, component.props);
        if (!propsValidation.valid) {
            return {
                valid: false,
                errors: [`Props validation failed: ${propsValidation.errors?.join(', ')}`],
            };
        }
    }

    // Validate data bindings if present
    if (component.dataBinding) {
        for (const [key, binding] of Object.entries(component.dataBinding)) {
            const bindingValidation = validateDataBinding(binding as A2UIDataBinding);
            if (!bindingValidation) {
                return {
                    valid: false,
                    errors: [`Invalid data binding for prop '${key}'`],
                };
            }
        }
    }

    // Validate actions if present
    if (component.actions) {
        if (!Array.isArray(component.actions)) {
            return {
                valid: false,
                errors: ['Component actions must be an array'],
            };
        }

        for (const action of component.actions) {
            if (typeof action !== 'string' || !/^[a-zA-Z0-9_-]+$/.test(action)) {
                return {
                    valid: false,
                    errors: ['Action IDs must be alphanumeric strings with hyphens and underscores only'],
                };
            }
        }
    }

    // Recursively validate children
    if (component.children) {
        if (!Array.isArray(component.children)) {
            return {
                valid: false,
                errors: ['Component children must be an array'],
            };
        }

        for (let i = 0; i < component.children.length; i++) {
            const childValidation = validateComponent(component.children[i], validateProps);
            if (!childValidation.valid) {
                return {
                    valid: false,
                    errors: [`Child component at index ${i} is invalid: ${childValidation.errors?.join(', ')}`],
                };
            }
        }
    }

    return { valid: true, data: component };
}

/**
 * Validate data binding configuration
 */
export function validateDataBinding(binding: any): boolean {
    if (!binding || typeof binding !== 'object') {
        return false;
    }

    if (!binding.path || typeof binding.path !== 'string') {
        return false;
    }

    // Validate JSON Pointer format
    if (!/^(\/[^/~]*(~[01][^/~]*)*)*$/.test(binding.path)) {
        return false;
    }

    // Prevent path traversal attacks
    if (binding.path.includes('..') || binding.path.includes('~2e~2e')) {
        return false;
    }

    // Limit path depth to 10 levels
    const pathSegments = binding.path.split('/').filter(Boolean);
    if (pathSegments.length > 10) {
        return false;
    }

    return true;
}

// ============================================================================
// Message Validation
// ============================================================================

/**
 * Main message validation entry point
 */
export function validateMessage(message: any): MessageValidationResult {
    if (!message || typeof message !== 'object') {
        return {
            valid: false,
            errors: ['Message must be an object'],
        };
    }

    if (!message.type || typeof message.type !== 'string') {
        return {
            valid: false,
            errors: ['Message must have a type field'],
        };
    }

    // Sanitize message first
    const sanitized = sanitizeMessage(message);

    // Validate based on message type
    let valid = false;
    let errors: string[] = [];
    let messageType = sanitized.type;

    switch (sanitized.type) {
        case 'surfaceUpdate':
            valid = validateSurfaceUpdate(sanitized);
            if (!valid && validateSurfaceUpdate.errors) {
                errors = validateSurfaceUpdate.errors.map((e) => e.message || 'Validation error');
            }
            break;

        case 'dataModelUpdate':
            valid = validateDataModelUpdate(sanitized);
            if (!valid && validateDataModelUpdate.errors) {
                errors = validateDataModelUpdate.errors.map((e) => e.message || 'Validation error');
            }
            // Validate JSON Pointer paths in updates
            if (valid && sanitized.updates) {
                for (const path of Object.keys(sanitized.updates)) {
                    if (!/^(\/[^/~]*(~[01][^/~]*)*)*$/.test(path)) {
                        valid = false;
                        errors.push(`Invalid JSON Pointer path: ${path}`);
                    }
                }
            }
            break;

        case 'deleteSurface':
            valid = validateDeleteSurface(sanitized);
            if (!valid && validateDeleteSurface.errors) {
                errors = validateDeleteSurface.errors.map((e) => e.message || 'Validation error');
            }
            break;

        case 'action':
            valid = validateActionMessage(sanitized);
            if (!valid && validateActionMessage.errors) {
                errors = validateActionMessage.errors.map((e) => e.message || 'Validation error');
            }
            break;

        default:
            return {
                valid: false,
                errors: [`Unknown message type: ${sanitized.type}`],
            };
    }

    return {
        valid,
        errors: errors.length > 0 ? errors : undefined,
        data: valid ? sanitized : undefined,
        messageType,
    };
}

/**
 * Extract human-readable error messages from validation result
 */
export function getValidationErrors(result: ValidationResult): string[] {
    return result.errors || [];
}

/**
 * Sanitize message to prevent XSS and injection attacks
 */
export function sanitizeMessage(message: any): any {
    if (!message || typeof message !== 'object') {
        return message;
    }

    const sanitized = { ...message };

    // Recursively sanitize all string values
    for (const [key, value] of Object.entries(sanitized)) {
        if (typeof value === 'string') {
            // Remove script tags and event handlers
            sanitized[key] = value
                .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
                .replace(/on\w+\s*=\s*["'][^"']*["']/gi, '')
                .replace(/javascript:/gi, '');
        } else if (typeof value === 'object' && value !== null) {
            sanitized[key] = sanitizeMessage(value);
        }
    }

    return sanitized;
}

/**
 * Validate action ID format
 */
export function validateActionId(actionId: string): boolean {
    return /^[a-zA-Z0-9_-]+$/.test(actionId);
}

/**
 * Validate action type
 */
export function validateActionType(actionType: string): boolean {
    const allowedTypes = [
        'click',
        'change',
        'submit',
        'focus',
        'blur',
        'input',
        'select',
        'toggle',
        'custom',
    ];
    return allowedTypes.includes(actionType);
}
