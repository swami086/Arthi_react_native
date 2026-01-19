/**
 * useA2UI Hook
 * 
 * React hook for managing A2UI surfaces with Supabase realtime subscriptions.
 * Handles:
 * - Initial surface fetching from database
 * - Realtime updates via Supabase channels
 * - Bidirectional agent-UI communication
 * - Surface state management with immer
 */

'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { produce } from 'immer';
import { toast } from 'sonner';
import { createClient } from '@/lib/supabase/client';
import { reportError } from '@/lib/rollbar-utils';
import type {
    A2UISurface,
    A2UIAction,
    UseA2UIOptions,
    UseA2UIReturn,
    SurfaceUpdateMessage,
    DataModelUpdateMessage,
    DeleteSurfaceMessage,
    ActionMessage,
} from '@/lib/a2ui/types';
import { validateMessage } from '@/lib/a2ui/message-validator';

/**
 * Apply JSON Pointer update to object using immer
 */
function applyJsonPointerUpdate(obj: any, path: string, value: any): any {
    if (!path || path === '/') {
        return value;
    }

    const segments = path.slice(1).split('/');
    const lastSegment = segments.pop()!;

    return produce(obj, (draft: any) => {
        let current = draft;

        for (const segment of segments) {
            const decodedSegment = segment.replace(/~1/g, '/').replace(/~0/g, '~');

            if (Array.isArray(current)) {
                const index = parseInt(decodedSegment, 10);
                if (isNaN(index)) return;
                current = current[index];
            } else {
                if (!current[decodedSegment]) {
                    current[decodedSegment] = {};
                }
                current = current[decodedSegment];
            }
        }

        const decodedLastSegment = lastSegment.replace(/~1/g, '/').replace(/~0/g, '~');
        if (Array.isArray(current)) {
            const index = parseInt(decodedLastSegment, 10);
            if (!isNaN(index)) {
                current[index] = value;
            }
        } else {
            current[decodedLastSegment] = value;
        }
    });
}

/**
 * useA2UI Hook
 */
export function useA2UI(options: UseA2UIOptions): UseA2UIReturn {
    const { userId, agentId, surfaceId, enableRealtime = true } = options;

    const [surfaces, setSurfaces] = useState<Map<string, A2UISurface>>(new Map());
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [connected, setConnected] = useState(false);

    const channelRef = useRef<ReturnType<ReturnType<typeof createClient>['channel']> | null>(null);
    const supabaseRef = useRef(createClient());

    // ============================================================================
    // Fetch Surfaces from Database
    // ============================================================================

    const fetchSurfaces = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            const supabase = supabaseRef.current;

            // Build query
            let query = supabase
                .from('a2ui_surfaces')
                .select('*')
                .eq('user_id', userId);

            if (agentId) {
                query = query.eq('agent_id', agentId);
            }

            if (surfaceId) {
                query = query.eq('surface_id', surfaceId);
            }

            const { data, error: fetchError } = await query;

            if (fetchError) {
                throw fetchError;
            }

            // Validate and store surfaces
            const surfaceMap = new Map<string, A2UISurface>();

            if (data) {
                for (const row of data) {
                    try {
                        const surface: A2UISurface = {
                            surfaceId: row.surface_id,
                            userId: row.user_id,
                            agentId: row.agent_id,
                            components: row.components || [],
                            dataModel: row.data_model || {},
                            metadata: row.metadata || {},
                            version: row.version || 1,
                            createdAt: row.created_at,
                            updatedAt: row.updated_at,
                        };

                        surfaceMap.set(surface.surfaceId, surface);
                    } catch (err) {
                        console.error('[useA2UI] Failed to parse surface:', err);
                        reportError(err, 'use_a2ui.parse_surface', { surfaceId: row.surface_id });
                    }
                }
            }

            setSurfaces(surfaceMap);
            setLoading(false);
        } catch (err) {
            console.error('[useA2UI] Failed to fetch surfaces:', err);
            setError(err instanceof Error ? err.message : 'Failed to fetch surfaces');
            reportError(err, 'use_a2ui.fetch_surfaces', { userId, agentId, surfaceId });
            setLoading(false);
        }
    }, [userId, agentId, surfaceId]);

    // ============================================================================
    // Message Handlers
    // ============================================================================

    const handleSurfaceUpdate = useCallback((message: SurfaceUpdateMessage) => {
        setSurfaces((prev) => {
            const newSurfaces = new Map(prev);
            const existing = newSurfaces.get(message.surfaceId);

            switch (message.operation) {
                case 'create':
                case 'replace':
                    newSurfaces.set(message.surfaceId, {
                        surfaceId: message.surfaceId,
                        userId: message.userId,
                        agentId: message.agentId,
                        components: message.components || [],
                        dataModel: message.dataModel || {},
                        metadata: message.metadata || {},
                        version: existing ? existing.version + 1 : 1,
                        updatedAt: message.timestamp || new Date().toISOString(),
                    });
                    break;

                case 'update':
                    if (existing) {
                        const updated = produce(existing, (draft) => {
                            if (message.components) {
                                draft.components = message.components;
                            }
                            if (message.dataModel) {
                                draft.dataModel = { ...draft.dataModel, ...message.dataModel };
                            }
                            if (message.metadata) {
                                draft.metadata = { ...draft.metadata, ...message.metadata };
                            }
                            draft.version += 1;
                            draft.updatedAt = message.timestamp || new Date().toISOString();
                        });
                        newSurfaces.set(message.surfaceId, updated);
                    }
                    break;

                case 'delete':
                    newSurfaces.delete(message.surfaceId);
                    break;
            }

            return newSurfaces;
        });
    }, []);

    const handleDataModelUpdate = useCallback((message: DataModelUpdateMessage) => {
        setSurfaces((prev) => {
            const newSurfaces = new Map(prev);
            const existing = newSurfaces.get(message.surfaceId);

            if (!existing) {
                console.warn('[useA2UI] Received data model update for unknown surface:', message.surfaceId);
                return prev;
            }

            const updated = produce(existing, (draft) => {
                for (const [path, value] of Object.entries(message.updates)) {
                    draft.dataModel = applyJsonPointerUpdate(draft.dataModel, path, value);
                }
                draft.version += 1;
                draft.updatedAt = message.timestamp || new Date().toISOString();
            });

            newSurfaces.set(message.surfaceId, updated);
            return newSurfaces;
        });
    }, []);

    const handleDeleteSurface = useCallback((message: DeleteSurfaceMessage) => {
        setSurfaces((prev) => {
            const newSurfaces = new Map(prev);
            newSurfaces.delete(message.surfaceId);
            return newSurfaces;
        });
    }, []);

    // ============================================================================
    // Realtime Subscription
    // ============================================================================

    useEffect(() => {
        if (!enableRealtime) return;

        const supabase = supabaseRef.current;
        const channelName = `a2ui:${userId}`;

        const channel = supabase.channel(channelName);

        // Subscribe to broadcast events
        channel
            .on('broadcast', { event: 'surfaceUpdate' }, ({ payload }) => {
                const validation = validateMessage(payload);
                if (!validation.valid) {
                    console.error('[useA2UI] Invalid surfaceUpdate message:', validation.errors);
                    reportError(
                        new Error('Invalid surfaceUpdate message'),
                        'use_a2ui.invalid_message',
                        { errors: validation.errors, payload }
                    );
                    return;
                }

                handleSurfaceUpdate(payload as SurfaceUpdateMessage);
            })
            .on('broadcast', { event: 'dataModelUpdate' }, ({ payload }) => {
                const validation = validateMessage(payload);
                if (!validation.valid) {
                    console.error('[useA2UI] Invalid dataModelUpdate message:', validation.errors);
                    return;
                }

                handleDataModelUpdate(payload as DataModelUpdateMessage);
            })
            .on('broadcast', { event: 'deleteSurface' }, ({ payload }) => {
                const validation = validateMessage(payload);
                if (!validation.valid) {
                    console.error('[useA2UI] Invalid deleteSurface message:', validation.errors);
                    return;
                }

                handleDeleteSurface(payload as DeleteSurfaceMessage);
            })
            .subscribe((status) => {
                if (status === 'SUBSCRIBED') {
                    setConnected(true);
                    console.log('[useA2UI] Connected to channel:', channelName);
                } else if (status === 'CLOSED') {
                    setConnected(false);
                    console.log('[useA2UI] Disconnected from channel:', channelName);
                } else if (status === 'CHANNEL_ERROR') {
                    setConnected(false);
                    console.error('[useA2UI] Channel error:', channelName);
                    toast.error('Lost connection to realtime updates');
                }
            });

        channelRef.current = channel;

        return () => {
            if (channelRef.current) {
                supabase.removeChannel(channelRef.current);
                channelRef.current = null;
                setConnected(false);
            }
        };
    }, [userId, enableRealtime, handleSurfaceUpdate, handleDataModelUpdate, handleDeleteSurface]);

    // ============================================================================
    // Initial Fetch
    // ============================================================================

    useEffect(() => {
        fetchSurfaces();
    }, [fetchSurfaces]);

    // ============================================================================
    // Send Action
    // ============================================================================

    const sendAction = useCallback(
        async (action: A2UIAction) => {
            try {
                const supabase = supabaseRef.current;
                const channel = channelRef.current;

                if (!channel) {
                    throw new Error('Realtime channel not initialized');
                }

                const message: ActionMessage = {
                    type: 'action',
                    surfaceId: action.surfaceId,
                    userId,
                    actionId: action.actionId,
                    actionType: action.type,
                    payload: action.payload,
                    metadata: action.metadata,
                    timestamp: action.timestamp || new Date().toISOString(),
                };

                // Validate message
                const validation = validateMessage(message);
                if (!validation.valid) {
                    throw new Error(`Invalid action message: ${validation.errors?.join(', ')}`);
                }

                // Broadcast action
                await channel.send({
                    type: 'broadcast',
                    event: 'action',
                    payload: message,
                });
            } catch (err) {
                console.error('[useA2UI] Failed to send action:', err);
                toast.error('Failed to send action');
                reportError(err, 'use_a2ui.send_action', { action });
                throw err;
            }
        },
        [userId]
    );

    // ============================================================================
    // Return Hook Interface
    // ============================================================================

    return {
        surfaces,
        loading,
        error,
        sendAction,
        refetch: fetchSurfaces,
        connected,
    };
}
