import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import {
    resolveJsonPointer,
    resolveDataBinding,
    renderComponent,
    A2UIRenderer
} from '../renderer';
import { hipaaLogger } from '../hipaa-logger';
import { performanceMonitor } from '../performance-monitor';

// Mock dependencies
vi.mock('../component-catalog', () => ({
    getComponent: vi.fn((type) => {
        if (type === 'Button') {
            return {
                reactComponent: ({ children, onClick, ...props }: any) => (
                    <button onClick={onClick} {...props}>{children}</button>
                ),
                allowedActions: ['onClick'],
            };
        }
        if (type === 'Card') {
            return {
                reactComponent: ({ children }: any) => <div>{children}</div>,
            };
        }
        return null;
    }),
    isComponentAllowed: vi.fn(() => true),
    validateComponentProps: vi.fn(() => ({ valid: true })),
}));

vi.mock('../message-validator', () => ({
    validateComponent: vi.fn(() => ({ valid: true })),
}));

vi.mock('../action-validator', () => ({
    validateAction: vi.fn(() => ({ valid: true })),
}));

vi.mock('../hipaa-logger', () => ({
    hipaaLogger: {
        logComponentRender: vi.fn(),
        logDataAccess: vi.fn(),
        logUserAction: vi.fn(),
        logSecurityViolation: vi.fn(),
    },
}));

vi.mock('../performance-monitor', () => ({
    performanceMonitor: {
        trackActionLatency: vi.fn(),
        trackRenderStart: vi.fn(),
        trackRenderEnd: vi.fn(),
    },
}));

vi.mock('@/lib/rollbar-utils', () => ({
    reportError: vi.fn(),
}));

describe('A2UI Renderer', () => {
    describe('resolveJsonPointer', () => {
        const data = {
            moodScore: 85,
            therapists: [
                { name: 'Dr. Smith' },
                { name: 'Dr. Jones' }
            ],
            'extra/path': 'value',
            'tilde~path': 'tilde'
        };

        it('resolves simple paths', () => {
            expect(resolveJsonPointer(data, '/moodScore')).toBe(85);
        });

        it('resolves nested paths', () => {
            expect(resolveJsonPointer(data, '/therapists/0/name')).toBe('Dr. Smith');
            expect(resolveJsonPointer(data, '/therapists/1/name')).toBe('Dr. Jones');
        });

        it('handles missing paths', () => {
            expect(resolveJsonPointer(data, '/missing')).toBeUndefined();
            expect(resolveJsonPointer(data, '/therapists/5')).toBeUndefined();
        });

        it('handles root path', () => {
            expect(resolveJsonPointer(data, '/')).toEqual(data);
            expect(resolveJsonPointer(data, '')).toEqual(data);
        });

        it('handles encoded characters', () => {
            expect(resolveJsonPointer(data, '/extra~1path')).toBe('value');
            expect(resolveJsonPointer(data, '/tilde~0path')).toBe('tilde');
        });

        it('handles invalid indices', () => {
            expect(resolveJsonPointer(data, '/therapists/abc')).toBeUndefined();
            expect(resolveJsonPointer(data, '/therapists/-1')).toBeUndefined();
        });
    });

    describe('resolveDataBinding', () => {
        const dataModel = {
            name: 'John Doe',
            score: 1234.56,
            date: '2023-12-25T10:00:00Z'
        };

        it('resolves binding with valid path', () => {
            const binding = { path: '/name' };
            expect(resolveDataBinding(binding, dataModel)).toBe('John Doe');
        });

        it('applies fallback when path doesn\'t exist', () => {
            const binding = { path: '/missing', fallback: 'Guest' };
            expect(resolveDataBinding(binding, dataModel)).toBe('Guest');
        });

        it('applies string transforms', () => {
            expect(resolveDataBinding({ path: '/name', transform: 'uppercase' }, dataModel)).toBe('JOHN DOE');
            expect(resolveDataBinding({ path: '/name', transform: 'lowercase' }, dataModel)).toBe('john doe');
        });

        it('applies date-format transform', () => {
            const result = resolveDataBinding({ path: '/date', transform: 'date-format' }, dataModel);
            expect(result).toBeDefined();
        });

        it('applies number-format transform', () => {
            const result = resolveDataBinding({ path: '/score', transform: 'number-format' }, dataModel);
            expect(result).toBe('1,234.56');
        });

        it('applies custom function transforms', () => {
            const transform = (val: any) => `Hello ${val}`;
            expect(resolveDataBinding({ path: '/name', transform }, dataModel)).toBe('Hello John Doe');
        });
    });

    describe('A2UIRenderer', () => {
        const mockSurface = {
            surfaceId: 'surf-1',
            userId: 'user-1',
            version: 1,
            dataModel: { title: 'Welcome' },
            components: [
                {
                    id: 'btn-1',
                    type: 'Button',
                    props: { children: 'Click Me', onClick: 'action-1' }
                }
            ]
        };

        const mockOnAction = vi.fn();

        beforeEach(() => {
            vi.clearAllMocks();
        });

        it('renders surface with components', () => {
            render(<A2UIRenderer surface={mockSurface as any} onAction={mockOnAction} />);
            expect(screen.getByText('Click Me')).toBeInTheDocument();
            expect(hipaaLogger.logComponentRender).toHaveBeenCalledWith('surf-1', 'Button', 'user-1');
        });

        it('handles actions correctly', () => {
            render(<A2UIRenderer surface={mockSurface as any} onAction={mockOnAction} />);
            fireEvent.click(screen.getByText('Click Me'));
            expect(mockOnAction).toHaveBeenCalled();
            expect(hipaaLogger.logUserAction).toHaveBeenCalled();
        });

        it('tracks performance metrics', () => {
            render(<A2UIRenderer surface={mockSurface as any} onAction={mockOnAction} />);
            expect(performanceMonitor.trackRenderStart).toHaveBeenCalled();
        });

        it('handles invalid surface structure', () => {
            const { container } = render(<A2UIRenderer surface={{} as any} onAction={mockOnAction} />);
            expect(container.firstChild).toBeNull();
        });
    });
});
