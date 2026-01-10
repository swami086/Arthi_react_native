/**
 * Metadata Sanitizer for DPDP Compliance
 * 
 * This utility ensures that sensitive user data is stripped from metadata
 * before being sent to external services like Rollbar or Analytics.
 * 
 * Compliance: Digital Personal Data Protection Act, 2023 (India)
 */

// Fields that must be redacted
const SENSITIVE_FIELDS = new Set([
    'password',
    'token',
    'access_token',
    'secret',
    'credit_card',
    'cvv',
    'card_number',
    'ssn',
    'pan',
    'aadhaar',
    'navigation', // React Navigation state can be huge/circular
    'route',
]);

const MAX_DEPTH = 5;

/**
* Sanitizes metadata by removing sensitive fields and handling circular references
*/
export function sanitizeMetadata(data: any, depth = 0, seen = new WeakSet()): any {
    // Return primitives as is
    if (data === null || typeof data !== 'object') {
        return data;
    }

    // Handle circular references
    if (seen.has(data)) {
        return '[Circular]';
    }
    seen.add(data);

    // Depth limit
    if (depth >= MAX_DEPTH) {
        return '[Max Depth Reached]';
    }

    // Handle Dates
    if (data instanceof Date) {
        return data.toISOString();
    }

    // Handle React Elements (avoid traversing)
    if (data.$$typeof || data._owner) {
        return '[React Element]';
    }

    // Handle Arrays
    if (Array.isArray(data)) {
        return data.map(item => sanitizeMetadata(item, depth + 1, seen));
    }

    // Handle plain objects
    const sanitized: Record<string, any> = {};
    for (const key in data) {
        if (Object.prototype.hasOwnProperty.call(data, key)) {
            // Redact sensitive keys
            if (SENSITIVE_FIELDS.has(key.toLowerCase())) {
                sanitized[key] = '[REDACTED]';
            } else {
                sanitized[key] = sanitizeMetadata(data[key], depth + 1, seen);
            }
        }
    }

    return sanitized;
}
