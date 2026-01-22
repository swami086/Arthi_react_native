
import DOMPurify from 'dompurify';
import { A2UIMessage, MessageValidationResult, A2UIComponent } from './types';
import { validateComponentProps } from './component-catalog';

// ============================================================================
// Validation Logic
// ============================================================================

/**
 * Validates a single component structure and props.
 * Enhanced to use component catalog prop validation and recursive child validation.
 * 
 * @param component The component object to validate
 * @returns A MessageValidationResult containing boolean validity and error messages
 */
export function validateComponent(component: any): MessageValidationResult {
    if (!component || typeof component !== 'object') {
        return { valid: false, errors: ['Component must be an object'] };
    }

    if (typeof component.type !== 'string' || !component.type) {
        return { valid: false, errors: ['Component must have a valid type'] };
    }

    if (typeof component.id !== 'string' || !component.id) {
        return { valid: false, errors: ['Component must have a valid id'] };
    }

    // Validate props using catalog schema if available
    if (component.props) {
        const propValidation = validateComponentProps(component.type, component.props);
        if (!propValidation.valid) {
            return {
                valid: false,
                errors: propValidation.errors?.map(e => `[${component.type}]: ${e}`)
            };
        }
    }

    // Recursive validation for children
    if (Array.isArray(component.children)) {
        for (const child of component.children) {
            const childResult = validateComponent(child);
            if (!childResult.valid) {
                return childResult;
            }
        }
    }

    return { valid: true };
}

/**
 * Validates the entire component tree structure to prevent recursion depth issues
 * and duplicate component IDs.
 * 
 * @param components Array of root components in the surface
 * @returns A MessageValidationResult
 */
export function validateComponentTree(components: A2UIComponent[]): MessageValidationResult {
    const seenIds = new Set<string>();
    const stack = components.map(c => ({ component: c, depth: 0 }));

    while (stack.length > 0) {
        const { component, depth } = stack.pop()!;

        if (depth > 20) {
            return { valid: false, errors: ['Component tree depth exceeds 20 levels'] };
        }

        if (seenIds.has(component.id)) {
            return { valid: false, errors: [`Duplicate component ID: ${component.id}`] };
        }
        seenIds.add(component.id);

        const result = validateComponent(component);
        if (!result.valid) return result;

        if (component.children) {
            stack.push(...component.children.map(c => ({ component: c, depth: depth + 1 })));
        }
    }
    return { valid: true };
}

/**
 * Validates the data model structure for circular references and size limits.
 * 
 * @param dataModel The data model object
 * @returns A MessageValidationResult
 */
export function validateDataModel(dataModel: any): MessageValidationResult {
    if (!dataModel || typeof dataModel !== 'object') {
        return { valid: false, errors: ['Data model must be an object'] };
    }

    // Circular reference check
    try {
        JSON.stringify(dataModel);
    } catch {
        return { valid: false, errors: ['Data model contains circular references'] };
    }

    // Size check (max 1MB)
    if (JSON.stringify(dataModel).length > 1024 * 1024) {
        return { valid: false, errors: ['Data model exceeds 1MB limit'] };
    }

    return { valid: true };
}

/**
 * Main entry point for validating inbound A2UI messages over Supabase Realtime.
 * 
 * @param message The raw message object
 * @returns A MessageValidationResult
 */
export function validateMessage(message: any): MessageValidationResult {
    if (!message || typeof message !== 'object') {
        return { valid: false, errors: ['Message must be an JSON object'] };
    }

    if (!message.type || typeof message.type !== 'string') {
        return { valid: false, errors: ['Message must have a valid type string'] };
    }

    const result: MessageValidationResult = {
        valid: true,
        messageType: message.type
    };

    switch (message.type) {
        case 'surfaceUpdate':
            if (!message.surfaceId) {
                return { valid: false, errors: ['surfaceUpdate requires surfaceId'] };
            }
            if (!message.components && !message.dataModel) {
                return { valid: false, errors: ['surfaceUpdate requires components or dataModel'] };
            }

            if (message.components) {
                if (!Array.isArray(message.components)) {
                    return { valid: false, errors: ['components must be an array'] };
                }
                const treeResult = validateComponentTree(message.components);
                if (!treeResult.valid) return treeResult;
            }

            if (message.dataModel) {
                const dataResult = validateDataModel(message.dataModel);
                if (!dataResult.valid) return dataResult;
            }
            break;

        case 'dataModelUpdate':
            if (!message.surfaceId) return { valid: false, errors: ['dataModelUpdate requires surfaceId'] };
            if (!message.updates || typeof message.updates !== 'object') {
                return { valid: false, errors: ['dataModelUpdate requires updates object'] };
            }
            break;

        case 'deleteSurface':
            if (!message.surfaceId) return { valid: false, errors: ['deleteSurface requires surfaceId'] };
            break;

        case 'action':
            // Actions are usually outbound, but if we receive one (e.g. echo), validate basics
            if (!message.actionId) return { valid: false, errors: ['action requires actionId'] };
            break;

        default:
            // Unknown types are allowed but warned? For strictness we could fail.
            // Allowing for forward compatibility.
            break;
    }

    return result;
}

// ============================================================================
// Sanitization Logic
// ============================================================================

/**
 * Sanitizes message content to prevent XSS by stripping all HTML tags from strings.
 * Uses DOMPurify for robust sanitization.
 * 
 * @param message The data object (message or component) to sanitize
 * @returns A new object with sanitized string values
 */
export function sanitizeMessage(message: any): any {
    if (!message || typeof message !== 'object') {
        if (typeof message === 'string') {
            return DOMPurify.sanitize(message, {
                ALLOWED_TAGS: [],
                ALLOWED_ATTR: [],
                KEEP_CONTENT: true,
            });
        }
        return message;
    }

    if (Array.isArray(message)) {
        return message.map(item => sanitizeMessage(item));
    }

    const sanitized: any = {};

    for (const [key, value] of Object.entries(message)) {
        if (typeof value === 'string') {
            // Sanitize string values using DOMPurify
            // We strip ALL tags and attributes for safely rendering text, 
            // unless we specifically want to allow some HTML (mostly we don't for A2UI)
            sanitized[key] = DOMPurify.sanitize(value, {
                ALLOWED_TAGS: [], // No HTML allowed in JSON strings by default
                ALLOWED_ATTR: [],
                KEEP_CONTENT: true,
            });
        } else if (typeof value === 'object' && value !== null) {
            sanitized[key] = sanitizeMessage(value);
        } else {
            sanitized[key] = value;
        }
    }

    return sanitized;
}
