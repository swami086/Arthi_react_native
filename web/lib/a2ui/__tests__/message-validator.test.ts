import { describe, it, expect, vi } from 'vitest';
import {
    validateComponent,
    validateComponentTree,
    validateDataModel,
    validateMessage,
    sanitizeMessage
} from '../message-validator';

// Mock dependencies
vi.mock('../component-catalog', () => ({
    validateComponentProps: vi.fn((type) => {
        if (type === 'Invalid') return { valid: false, errors: ['Invalid props'] };
        return { valid: true };
    }),
}));

describe('Message Validator', () => {
    describe('validateComponent', () => {
        it('accepts valid component structure', () => {
            const component = { type: 'Button', id: '1', props: {} };
            expect(validateComponent(component).valid).toBe(true);
        });

        it('rejects missing type field', () => {
            const component = { id: '1', props: {} };
            expect(validateComponent(component).valid).toBe(false);
        });

        it('rejects missing id field', () => {
            const component = { type: 'Button', props: {} };
            expect(validateComponent(component).valid).toBe(false);
        });

        it('recursively validates children', () => {
            const component = {
                type: 'Card',
                id: '1',
                children: [{ type: 'Button', id: '2' }]
            };
            expect(validateComponent(component).valid).toBe(true);

            const invalid = {
                type: 'Card',
                id: '1',
                children: [{ id: '2' }]
            };
            expect(validateComponent(invalid).valid).toBe(false);
        });
    });

    describe('validateComponentTree', () => {
        it('detects duplicate component IDs', () => {
            const tree = [
                { id: '1', type: 'Card', children: [{ id: '1', type: 'Button' }] }
            ];
            expect(validateComponentTree(tree as any).valid).toBe(false);
        });

        it('rejects deep trees', () => {
            let current: any = { id: '1', type: 'Card' };
            const tree = [current];
            for (let i = 2; i <= 22; i++) {
                current.children = [{ id: String(i), type: 'Card' }];
                current = current.children[0];
            }
            expect(validateComponentTree(tree as any).valid).toBe(false);
        });
    });

    describe('validateDataModel', () => {
        it('rejects circular references', () => {
            const model: any = { a: 1 };
            model.self = model;
            expect(validateDataModel(model).valid).toBe(false);
        });

        it('rejects large data models', () => {
            const largeString = 'a'.repeat(1024 * 1024 + 1);
            expect(validateDataModel({ data: largeString }).valid).toBe(false);
        });
    });

    describe('validateMessage', () => {
        it('rejects non-object payloads', () => {
            expect(validateMessage(null).valid).toBe(false);
            expect(validateMessage('invalid').valid).toBe(false);
            expect(validateMessage(123).valid).toBe(false);
        });

        it('rejects messages missing type', () => {
            expect(validateMessage({ surfaceId: '1' }).valid).toBe(false);
        });

        it('validates surfaceUpdate messages', () => {
            expect(validateMessage({ type: 'surfaceUpdate', surfaceId: '1', components: [] }).valid).toBe(true);
            expect(validateMessage({ type: 'surfaceUpdate', surfaceId: '1' }).valid).toBe(false);
            expect(validateMessage({ type: 'surfaceUpdate' }).valid).toBe(false);
        });

        it('validates dataModelUpdate messages', () => {
            expect(validateMessage({ type: 'dataModelUpdate', surfaceId: '1', updates: {} }).valid).toBe(true);
            expect(validateMessage({ type: 'dataModelUpdate', surfaceId: '1' }).valid).toBe(false);
        });

        it('validates deleteSurface messages', () => {
            expect(validateMessage({ type: 'deleteSurface', surfaceId: '1' }).valid).toBe(true);
            expect(validateMessage({ type: 'deleteSurface' }).valid).toBe(false);
        });

        it('validates action messages', () => {
            expect(validateMessage({ type: 'action', actionId: 'a1' }).valid).toBe(true);
            expect(validateMessage({ type: 'action' }).valid).toBe(false);
        });
    });

    describe('sanitizeMessage', () => {
        it('strips HTML tags from strings', () => {
            const input = { text: '<script>alert("xss")</script>Hello' };
            const output = sanitizeMessage(input);
            expect(output.text).toBe('Hello');
        });

        it('sanitizes recursively', () => {
            const input = {
                outer: '<img src=x onerror=alert(1)>',
                inner: { text: '<b>Bold</b>' }
            };
            const output = sanitizeMessage(input);
            expect(output.outer).toBe('');
            expect(output.inner.text).toBe('Bold');
        });

        it('preserves non-string values', () => {
            const input = { count: 123, active: true, items: [1, 2, 3] };
            expect(sanitizeMessage(input)).toEqual(input);
        });
    });
});
