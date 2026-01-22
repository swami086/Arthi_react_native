
import Ajv from 'ajv';
import { A2UIAction, ValidationResult } from './types';

// ============================================================================
// Action Whitelists
// ============================================================================

export const ALLOWED_ACTIONS = new Set([
    // Booking actions
    'select_therapist',
    'book_appointment',
    'select_time_slot',
    'cancel_appointment',
    'confirm_appointment',

    // Session actions
    'apply_intervention',
    'open_risk_assessment',
    'flag_for_review',
    'save_soap_note',
    'start_session',
    'end_session',

    // Insights actions
    'view_detailed_insights',
    'export_report',
    'filter_data',
    'change_date_range',

    // Followup actions
    'submit_wellness_check',
    'skip_question',
    'save_draft',

    // Common UI actions
    'click',
    'change',
    'submit',
    'select',
    'toggle',

    // Component-specific legacy actions
    'onClick',
    'onChange',
    'onFocus',
    'onBlur',
    'onValueChange',
    'onCheckedChange',
    'onJoin',
    'onConfirm',
    'onCancel',
    'onDateSelect',
    'onApply',
    'onOpenAssessment',
    'onFlagForReview',
    'onPress'
]);

// ============================================================================
// Payload Schemas
// ============================================================================

const ajv = new Ajv({ allErrors: true, strict: false });

const basePayloadSchema = {
    type: 'object',
    maxProperties: 20,
};

const bookingPayloadSchema = {
    ...basePayloadSchema,
    properties: {
        therapistId: { type: 'string' },
        slotId: { type: 'string' },
        date: { type: 'string' },
        reason: { type: 'string', maxLength: 500 },
    },
};

const sessionPayloadSchema = {
    ...basePayloadSchema,
    properties: {
        sessionId: { type: 'string' },
        note: { type: 'string', maxLength: 5000 },
        interventionId: { type: 'string' },
        riskLevel: { type: 'string', enum: ['low', 'medium', 'high', 'critical'] },
    },
};

const commonPayloadSchema = {
    type: 'object',
    additionalProperties: true, // Allow flexible payloads for generic actions
};

const schemaMap: Record<string, object> = {
    book_appointment: bookingPayloadSchema,
    start_session: sessionPayloadSchema,
    end_session: sessionPayloadSchema,
    default: commonPayloadSchema,
};

// ============================================================================
// Validation Functions
// ============================================================================

/**
 * Checks if a given action ID is present in the global allowed actions whitelist.
 * 
 * @param actionId - The ID of the action to check
 * @returns True if the action is allowed, false otherwise
 */
export function isActionAllowed(actionId: string): boolean {
    return ALLOWED_ACTIONS.has(actionId);
}

/**
 * Validates the structure and content of an action's payload against predefined JSON schemas.
 * 
 * @param actionId - The action ID to determine which schema to use
 * @param payload - The data payload to validate
 * @returns A ValidationResult indicating success or list of errors
 */
export function validateActionPayload(actionId: string, payload: any): ValidationResult {
    const schema = schemaMap[actionId] || schemaMap.default;
    const validate = ajv.compile(schema);
    const valid = validate(payload);

    if (!valid && validate.errors) {
        return {
            valid: false,
            errors: validate.errors.map((e) => `${e.instancePath} ${e.message}`),
        };
    }

    return { valid: true };
}

/**
 * Performs a comprehensive validation of an outbound A2UI action.
 * Checks against the whitelist, payload size limits (10KB), security patterns (XSS),
 * and structural schema compliance.
 * 
 * @param action - The full action object to validate
 * @returns A ValidationResult indicating whether the action is safe to process
 */
export function validateAction(action: A2UIAction): ValidationResult {
    // 1. Check whitelist
    if (!isActionAllowed(action.actionId)) {
        return {
            valid: false,
            errors: [`Action ID '${action.actionId}' is not allowed.`],
        };
    }

    // 2. Validate payload size
    const payloadSize = JSON.stringify(action.payload || {}).length;
    if (payloadSize > 10240) { // 10KB limit
        return {
            valid: false,
            errors: [`Action payload exceeds 10KB limit.`],
        };
    }

    // 3. Check for suspicious patterns in payload strings
    const payloadStr = JSON.stringify(action.payload || {});
    if (/<script|javascript:|data:/i.test(payloadStr)) {
        return {
            valid: false,
            errors: [`Suspicious content detected in action payload.`],
        };
    }

    // 4. Validate payload structure
    if (action.payload) {
        const payloadResult = validateActionPayload(action.actionId, action.payload);
        if (!payloadResult.valid) {
            return payloadResult;
        }
    }

    return { valid: true };
}
