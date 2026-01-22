import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useA2UI } from '../use-a2ui';
import { a2uiCache } from '@/lib/a2ui/cache';
import { createClient } from '@/lib/supabase/client';

// Mock dependencies
vi.mock('@/lib/supabase/client', () => {
    const mockQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        then: vi.fn().mockImplementation(cb => cb({ data: [], error: null }))
    };
    const mockChannel = {
        on: vi.fn().mockReturnThis(),
        subscribe: vi.fn(cb => { if (cb) cb('SUBSCRIBED'); return mockChannel; }),
        send: vi.fn().mockResolvedValue('ok')
    };
    return {
        createClient: vi.fn(() => ({
            from: vi.fn(() => mockQuery),
            channel: vi.fn(() => mockChannel),
            removeChannel: vi.fn()
        }))
    };
});

vi.mock('@/lib/a2ui/cache', () => ({
    a2uiCache: {
        getAllSurfaces: vi.fn().mockResolvedValue([]),
        saveSurface: vi.fn().mockResolvedValue(undefined),
        clearOldSurfaces: vi.fn().mockResolvedValue(undefined),
        deleteSurface: vi.fn().mockResolvedValue(undefined)
    }
}));

vi.mock('@/lib/a2ui/message-validator', () => ({
    validateMessage: vi.fn(() => ({ valid: true })),
    sanitizeMessage: vi.fn((m) => m)
}));

vi.mock('@/lib/a2ui/action-validator', () => ({
    validateAction: vi.fn(() => ({ valid: true }))
}));

describe('useA2UI Hook', () => {
    const options = { userId: 'user-123', agentId: 'agent-1' };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('fetches surfaces on mount', async () => {
        const { result } = renderHook(() => useA2UI(options));

        await waitFor(() => {
            expect(result.current.loading).toBe(false);
        });

        expect(createClient).toHaveBeenCalled();
    });

    it('loads from cache initially', async () => {
        const cachedSurface = { surfaceId: 'surf-1', agentId: 'agent-1', userId: 'user-123' };
        (a2uiCache.getAllSurfaces as any).mockResolvedValue([cachedSurface]);

        // Mock DB fetch to also return this surface to avoid overwrite
        const supabase = createClient();
        (supabase.from('a2ui_surfaces').select('*') as any).then.mockImplementation((cb: any) =>
            cb({
                data: [{
                    surface_id: 'surf-1',
                    user_id: 'user-123',
                    agent_id: 'agent-1',
                    components: [],
                    data_model: {},
                    metadata: {},
                    version: 1,
                    updated_at: new Date().toISOString()
                }],
                error: null
            })
        );

        const { result } = renderHook(() => useA2UI(options));

        await waitFor(() => {
            expect(result.current.surfaces.size).toBe(1);
        }, { timeout: 2000 });

        expect(result.current.surfaces.get('surf-1')).toEqual(expect.objectContaining({ surfaceId: 'surf-1' }));
    });

    it('subscribes to realtime updates', async () => {
        const { result } = renderHook(() => useA2UI(options));

        await waitFor(() => {
            expect(result.current.connected).toBe(true);
        });
    });

    it('sends actions correctly', async () => {
        const { result } = renderHook(() => useA2UI(options));
        const mockAction = {
            surfaceId: 'surf-1',
            actionId: 'click',
            type: 'onClick',
            payload: {},
            timestamp: '2023-01-01T00:00:00Z'
        };

        await result.current.sendAction(mockAction as any);

        await waitFor(() => {
            const supabase = (createClient as any).mock.results[0].value;
            const channel = (supabase.channel as any).mock.results[0].value;
            expect(channel.send).toHaveBeenCalledWith(expect.objectContaining({
                type: 'broadcast',
                event: 'action'
            }));
        });
    });

    it('handles realtime surface updates', async () => {
        const { result } = renderHook(() => useA2UI(options));

        await waitFor(() => expect(result.current.connected).toBe(true));

        const supabase = (createClient as any).mock.results[0].value;
        const channel = (supabase.channel as any).mock.results[0].value;

        // Find the surfaceUpdate handler
        const updateCall = (channel.on as any).mock.calls.find((call: any) =>
            call[0] === 'broadcast' && call[1].event === 'surfaceUpdate'
        );
        const broadcastHandler = updateCall[2];

        // Simulate surfaceUpdate broadcast
        broadcastHandler({
            payload: {
                type: 'surfaceUpdate',
                operation: 'create',
                surfaceId: 'surf-new',
                userId: 'user-123',
                agentId: 'agent-1',
                components: [{ id: 'c1', type: 'Button', props: { children: 'New' } }],
                version: 1
            }
        });

        await waitFor(() => {
            expect(result.current.surfaces.has('surf-new')).toBe(true);
        }, { timeout: 2000 });
    });

    it('handles realtime data model updates', async () => {
        const cachedSurface = {
            surfaceId: 'surf-1',
            agentId: 'agent-1',
            userId: 'user-123',
            dataModel: { count: 0 },
            version: 1
        };
        (a2uiCache.getAllSurfaces as any).mockResolvedValue([cachedSurface]);

        const { result } = renderHook(() => useA2UI(options));
        const supabase = (createClient as any).mock.results[0].value;

        // Mock DB fetch to return the same surface to avoid wipe
        (supabase.from('a2ui_surfaces').select('*') as any).then.mockImplementation((cb: any) =>
            cb({
                data: [{
                    surface_id: 'surf-1',
                    user_id: 'user-123',
                    agent_id: 'agent-1',
                    components: [],
                    data_model: { count: 0 },
                    metadata: {},
                    version: 1,
                    updated_at: new Date().toISOString()
                }],
                error: null
            })
        );

        await waitFor(() => expect(result.current.connected).toBe(true));
        await waitFor(() => expect(result.current.surfaces.size).toBe(1));

        const channel = (supabase.channel as any).mock.results[0].value;

        // Find the dataModelUpdate handler
        const updateCall = (channel.on as any).mock.calls.find((call: any) =>
            call[0] === 'broadcast' && call[1].event === 'dataModelUpdate'
        );
        const broadcastHandler = updateCall[2];

        // Simulate dataModelUpdate
        broadcastHandler({
            payload: {
                type: 'dataModelUpdate',
                surfaceId: 'surf-1',
                updates: {
                    '/count': 1
                },
                version: 2
            }
        });

        await waitFor(() => {
            const surf = result.current.surfaces.get('surf-1');
            expect(surf?.dataModel.count).toBe(1);
            expect(surf?.version).toBe(2);
        });
    });

    it('handles realtime surface deletion', async () => {
        const cachedSurface = { surfaceId: 'surf-delete', agentId: 'agent-1', userId: 'user-123' };
        (a2uiCache.getAllSurfaces as any).mockResolvedValue([cachedSurface]);

        const { result } = renderHook(() => useA2UI(options));
        const supabase = (createClient as any).mock.results[0].value;

        // Mock DB fetch to return the same surface to avoid wipe
        (supabase.from('a2ui_surfaces').select('*') as any).then.mockImplementation((cb: any) =>
            cb({
                data: [{
                    surface_id: 'surf-delete',
                    user_id: 'user-123',
                    agent_id: 'agent-1',
                    components: [],
                    data_model: {},
                    metadata: {},
                    version: 1,
                    updated_at: new Date().toISOString()
                }],
                error: null
            })
        );

        await waitFor(() => expect(result.current.connected).toBe(true));
        await waitFor(() => expect(result.current.surfaces.has('surf-delete')).toBe(true));

        const channel = (supabase.channel as any).mock.results[0].value;

        // Find the deleteSurface handler
        const deleteCall = (channel.on as any).mock.calls.find((call: any) =>
            call[0] === 'broadcast' && call[1].event === 'deleteSurface'
        );
        const broadcastHandler = deleteCall[2];

        // Simulate deleteSurface
        broadcastHandler({
            payload: {
                type: 'deleteSurface',
                surfaceId: 'surf-delete'
            }
        });

        await waitFor(() => {
            expect(result.current.surfaces.has('surf-delete')).toBe(false);
        });
    });
});
