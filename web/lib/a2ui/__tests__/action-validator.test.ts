import { describe, it, expect } from 'vitest';
import { validateAction, isActionAllowed } from '../action-validator';
import { A2UIAction } from '../types';

describe('Action Validator', () => {
    describe('isActionAllowed', () => {
        it('accepts whitelisted actions', () => {
            expect(isActionAllowed('select_therapist')).toBe(true);
            expect(isActionAllowed('book_appointment')).toBe(true);
            expect(isActionAllowed('click')).toBe(true);
        });

        it('rejects unknown actions', () => {
            expect(isActionAllowed('malicious_action')).toBe(false);
            expect(isActionAllowed('eval')).toBe(false);
        });
    });

    describe('validateAction', () => {
        const validAction: A2UIAction = {
            surfaceId: 'surf-1',
            actionId: 'book_appointment',
            type: 'onClick',
            payload: { therapistId: 't-1', date: '2023-01-01' },
            timestamp: new Date().toISOString()
        };

        it('accepts valid actions', () => {
            expect(validateAction(validAction).valid).toBe(true);
        });

        it('rejects non-whitelisted actions', () => {
            const invalid = { ...validAction, actionId: 'hack' };
            expect(validateAction(invalid).valid).toBe(false);
        });

        it('validates payload structure for specific actions', () => {
            const invalidPayload = {
                ...validAction,
                payload: { therapistId: 123 } // Should be string
            };
            expect(validateAction(invalidPayload).valid).toBe(false);
        });

        it('detects suspicious patterns in payload', () => {
            const malicious = {
                ...validAction,
                payload: { note: '<script>alert(1)</script>' }
            };
            expect(validateAction(malicious).valid).toBe(false);
        });

        it('rejects oversized payloads', () => {
            const largePayload = { ...validAction, payload: { data: 'a'.repeat(20000) } };
            expect(validateAction(largePayload).valid).toBe(false);
        });
    });
});
