import React from 'react';
import { render } from '@testing-library/react';
import { A2UIMessage, A2UISurface, A2UIComponent } from '@/lib/a2ui/types';

/**
 * Creates a mock A2UI Surface for testing
 */
export function createMockSurface(overrides: Partial<A2UISurface> = {}): A2UISurface {
    return {
        surfaceId: 'test-surface',
        userId: 'test-user',
        agentId: 'test-agent',
        version: 1,
        components: [],
        dataModel: {},
        metadata: {},
        updatedAt: new Date().toISOString(),
        ...overrides
    };
}

/**
 * Creates a mock A2UI Component for testing
 */
export function createMockComponent(overrides: Partial<A2UIComponent> = {}): A2UIComponent {
    return {
        id: `comp-${Math.random().toString(36).substr(2, 9)}`,
        type: 'Button',
        props: { children: 'Button Text' },
        ...overrides
    };
}

/**
 * Custom render helper that can be extended with providers if needed
 */
export function renderWithA2UI(ui: React.ReactElement, options = {}) {
    return render(ui, { ...options });
}
