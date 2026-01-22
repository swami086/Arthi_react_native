/**
 * useA2UI Hook
 * 
 * React hook for managing A2UI surfaces with Supabase realtime subscriptions.
 * Enhanced with:
 * - Security: Message validation, Action validation, HIPAA logging
 * - Performance: IndexedDB caching, Incremental updates, Performance monitoring
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
    A2UIComponent
} from '@/lib/a2ui/types';

import { validateMessage, sanitizeMessage } from '@/lib/a2ui/message-validator';
import { validateAction } from '@/lib/a2ui/action-validator';
import { performanceMonitor } from '@/lib/a2ui/performance-monitor';
import { hipaaLogger } from '@/lib/a2ui/hipaa-logger';
import { a2uiCache } from '@/lib/a2ui/cache';

function applyJsonPointerUpdate(obj: any, path: string, value: any): any {
    if (!path || path === '/') return value;
    const segments = path.slice(1).split('/');
    const lastSegment = segments.pop()!;

    return produce(obj, (draft: any) => {
        let current = draft;
        for (const segment of segments) {
            const decoded = segment.replace(/~1/g, '/').replace(/~0/g, '~');
            if (Array.isArray(current)) {
                const idx = parseInt(decoded, 10);
                if (isNaN(idx)) return;
                current = current[idx];
            } else {
                if (!current[decoded]) current[decoded] = {};
                current = current[decoded];
            }
        }
        const decodedLast = lastSegment.replace(/~1/g, '/').replace(/~0/g, '~');
        if (Array.isArray(current)) {
            const idx = parseInt(decodedLast, 10);
            if (!isNaN(idx)) current[idx] = value;
        } else {
            current[decodedLast] = value;
        }
    });
}

// Deep merge utility
function deepMerge(target: any, source: any): any {
    if (typeof target !== 'object' || target === null) return source;
    if (typeof source !== 'object' || source === null) return source;

    const output = Array.isArray(target) ? [...target] : { ...target };

    if (Array.isArray(source)) return source;

    for (const key of Object.keys(source)) {
        if (source[key] instanceof Object && key in target) {
            output[key] = deepMerge(target[key], source[key]);
        } else {
            output[key] = source[key];
        }
    }
    return output;
}

/**
 * Merge component updates for incremental rendering
 * Updates existing components by ID and appends new ones.
 */
function mergeComponents(existing: A2UIComponent[], updates: A2UIComponent[]): A2UIComponent[] {
    const existingMap = new Map(existing.map(c => [c.id, c]));
    const result = [...existing];
    const newItems: A2UIComponent[] = [];

    for (const update of updates) {
        if (existingMap.has(update.id)) {
            const idx = result.findIndex(c => c.id === update.id);
            if (idx !== -1) result[idx] = update;
        } else {
            newItems.push(update);
        }
    }

    return [...result, ...newItems];
}

/**
 * Main React hook for managing A2UI surfaces.
 * Orchestrates Supabase Realtime subscriptions, surface state management, 
 * action dispatching, and IndexedDB caching.
 * 
 * @param options Configuration options for the hook
 * @returns An object containing surface state, loading status, and action handlers
 */
export function useA2UI(options: UseA2UIOptions): UseA2UIReturn {
    const { userId, agentId, surfaceId, enableRealtime = true } = options;

    const [surfaces, setSurfaces] = useState<Map<string, A2UISurface>>(new Map());
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [connected, setConnected] = useState(false);

    const channelRef = useRef<ReturnType<ReturnType<typeof createClient>['channel']> | null>(null);
    const supabaseRef = useRef(createClient());

    const fetchSurfaces = useCallback(async () => {
        // Guard: Don't fetch if userId is empty (would cause UUID error)
        if (!userId || userId.trim() === '') {
            setLoading(false);
            setSurfaces(new Map());
            return;
        }

        try {
            setLoading(true);
            setError(null);

            // 1. Load from cache first for instant UI
            try {
                const cached = await a2uiCache.getAllSurfaces(userId);
                if (cached.length > 0) {
                    const surfaceMap = new Map();
                    cached.forEach(s => {
                        if ((!agentId || s.agentId === agentId) && (!surfaceId || s.surfaceId === surfaceId)) {
                            surfaceMap.set(s.surfaceId, s);
                        }
                    });
                    if (surfaceMap.size > 0) {
                        setSurfaces(surfaceMap);
                        setLoading(false); // Show cached immediately
                    }
                }
            } catch (cacheErr) {
                console.warn('[useA2UI] Cache load failed', cacheErr);
            }

            // 2. Fetch fresh from DB
            const supabase = supabaseRef.current;
            let query = supabase.from('a2ui_surfaces').select('*').eq('user_id', userId);
            if (agentId) query = query.eq('agent_id', agentId);
            if (surfaceId) query = query.eq('surface_id', surfaceId);

            const { data, error: fetchError } = await query;
            if (fetchError) throw fetchError;

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
                        // Update cache
                        await a2uiCache.saveSurface(surface);
                    } catch (err) {
                        console.error('[useA2UI] Parse error:', err);
                    }
                }
            }

            // Clean old cache
            a2uiCache.clearOldSurfaces().catch(e => console.error(e));

            setSurfaces(surfaceMap);
            setLoading(false);
        } catch (err) {
            console.error('[useA2UI] Fetch failed:', err);
            setError(err instanceof Error ? err.message : 'Fetch failed');
            setLoading(false);
        }
    }, [userId, agentId, surfaceId]);

    const handleSurfaceUpdate = useCallback((message: SurfaceUpdateMessage) => {
        const start = performance.now();
        hipaaLogger.logSurfaceUpdate(message);

        setSurfaces((prev) => {
            const newSurfaces = new Map(prev);
            const existing = newSurfaces.get(message.surfaceId);

            let updatedSurface: A2UISurface | undefined;

            switch (message.operation) {
                case 'create':
                case 'replace':
                    updatedSurface = {
                        surfaceId: message.surfaceId,
                        userId: message.userId,
                        agentId: message.agentId,
                        components: message.components || [],
                        dataModel: message.dataModel || {},
                        metadata: message.metadata || {},
                        version: existing ? existing.version + 1 : 1,
                        updatedAt: message.timestamp || new Date().toISOString(),
                    };
                    newSurfaces.set(message.surfaceId, updatedSurface);
                    break;

                case 'update':
                    if (existing) {
                        updatedSurface = produce(existing, (draft) => {
                            if (message.components) {
                                // Incremental component update
                                draft.components = mergeComponents(draft.components, message.components);
                            }
                            if (message.dataModel) {
                                // Deep merge data model
                                draft.dataModel = deepMerge(draft.dataModel, message.dataModel);
                            }
                            if (message.metadata) {
                                draft.metadata = { ...draft.metadata, ...message.metadata };
                            }
                            draft.version += 1;
                            draft.updatedAt = message.timestamp || new Date().toISOString();
                        });
                        newSurfaces.set(message.surfaceId, updatedSurface);
                    }
                    break;
                case 'delete':
                    newSurfaces.delete(message.surfaceId);
                    a2uiCache.deleteSurface(message.surfaceId).catch(console.error);
                    break;
            }

            if (updatedSurface) {
                a2uiCache.saveSurface(updatedSurface).catch(console.error);
            }

            return newSurfaces;
        });

        performanceMonitor.trackMessageProcessing(message.type, performance.now() - start);
    }, []);

    const handleDataModelUpdate = useCallback((message: DataModelUpdateMessage) => {
        const start = performance.now();
        setSurfaces((prev) => {
            const newSurfaces = new Map(prev);
            const existing = newSurfaces.get(message.surfaceId);
            if (!existing) return prev;

            const updated = produce(existing, (draft) => {
                for (const [path, value] of Object.entries(message.updates)) {
                    draft.dataModel = applyJsonPointerUpdate(draft.dataModel, path, value);
                }
                draft.version += 1;
                draft.updatedAt = message.timestamp || new Date().toISOString();
            });

            newSurfaces.set(message.surfaceId, updated);
            a2uiCache.saveSurface(updated).catch(console.error);
            return newSurfaces;
        });
        performanceMonitor.trackMessageProcessing(message.type, performance.now() - start);
    }, []);

    const handleDeleteSurface = useCallback((message: DeleteSurfaceMessage) => {
        setSurfaces((prev) => {
            const newSurfaces = new Map(prev);
            newSurfaces.delete(message.surfaceId);
            return newSurfaces;
        });
        a2uiCache.deleteSurface(message.surfaceId).catch(console.error);
    }, []);

    useEffect(() => {
        if (!enableRealtime) return;
        const supabase = supabaseRef.current;
        const channelName = `a2ui:${userId}`;
        const channel = supabase.channel(channelName);

        channel
            .on('broadcast', { event: 'surfaceUpdate' }, ({ payload }) => {
                let safePayload = sanitizeMessage(payload);
                const validation = validateMessage(safePayload);
                if (!validation.valid) {
                    console.error('[useA2UI] Invalid surfaceUpdate:', validation.errors);
                    return;
                }
                handleSurfaceUpdate(safePayload as SurfaceUpdateMessage);
            })
            .on('broadcast', { event: 'dataModelUpdate' }, ({ payload }) => {
                let safePayload = sanitizeMessage(payload);
                const validation = validateMessage(safePayload);
                if (!validation.valid) return;
                handleDataModelUpdate(safePayload as DataModelUpdateMessage);
            })
            .on('broadcast', { event: 'deleteSurface' }, ({ payload }) => {
                const validation = validateMessage(payload);
                if (!validation.valid) return;
                handleDeleteSurface(payload as DeleteSurfaceMessage);
            })
            .subscribe((status) => {
                if (status === 'SUBSCRIBED') setConnected(true);
                else setConnected(false);
            });

        channelRef.current = channel;
        return () => {
            if (channelRef.current) supabase.removeChannel(channelRef.current);
        };
    }, [userId, enableRealtime, handleSurfaceUpdate, handleDataModelUpdate, handleDeleteSurface]);

    useEffect(() => {
        fetchSurfaces();
    }, [fetchSurfaces]);

    const sendAction = useCallback(async (action: A2UIAction) => {
        // Validation
        const val = validateAction(action);
        if (!val.valid) {
            console.error('Blocked invalid action:', val.errors);
            toast.error('Action blocked by security policy');
            return;
        }

        try {
            const channel = channelRef.current;
            if (!channel) throw new Error('Realtime disconnected');

            // Log
            hipaaLogger.logUserAction(action, userId);

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

            await channel.send({
                type: 'broadcast',
                event: 'action',
                payload: message,
            });
        } catch (err) {
            console.error('Send failed:', err);
            toast.error('Failed to send action');
            reportError(err, 'use_a2ui.send_action', { action });
        }
    }, [userId]);

    return {
        surfaces,
        loading,
        error,
        sendAction,
        refetch: fetchSurfaces,
        connected,
    };
}
