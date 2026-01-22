/**
 * useFollowupAgent Hook
 * 
 * Specialized hook for managing post-session AI follow-ups.
 * Handles wellness checks, mood tracking, and homework verification.
 */

import { useCallback, useEffect, useState } from 'react';
import { useA2UI } from './use-a2ui';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';

interface UseFollowupAgentOptions {
    userId: string;
    patientId: string;
}

export function useFollowupAgent({ userId, patientId }: UseFollowupAgentOptions) {
    const surfaceId = `followup-${patientId}`;
    const agentId = 'followup-agent';
    const supabase = createClient();

    const { surfaces, loading, sendAction, connected, refetch } = useA2UI({
        userId,
        agentId,
        surfaceId
    });

    const [isInitializing, setIsInitializing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const surface = surfaces.get(surfaceId);

    const initializeFollowup = useCallback(async () => {
        if (isInitializing || surface) return;

        try {
            setIsInitializing(true);
            setError(null);

            const { data, error } = await supabase.functions.invoke('followup-agent-init', {
                body: { patientId }
            });

            if (error) throw error;

            if (data) {
                await refetch();
            }
        } catch (err: any) {
            console.error('[useFollowupAgent] Failed to initialize:', err);
            setError(err.message || 'Failed to initialize followup agent');
        } finally {
            setIsInitializing(false);
        }
    }, [patientId, surface, isInitializing, refetch, supabase]);

    useEffect(() => {
        if (!surface && !loading && !isInitializing) {
            initializeFollowup();
        }
    }, [surface, loading, isInitializing, initializeFollowup]);

    return {
        surface,
        loading: loading || isInitializing,
        connected,
        sendAction: async (action: any) => {
            try {
                const { error } = await supabase.functions.invoke('followup-agent', {
                    body: {
                        action: action.actionId,
                        surfaceId,
                        payload: action.payload
                    }
                });

                if (error) throw error;
            } catch (err) {
                console.error('[useFollowupAgent] Action failed:', err);
                toast.error('Failed to execute followup action');
            }
        },
        error,
        retry: initializeFollowup
    };
}
