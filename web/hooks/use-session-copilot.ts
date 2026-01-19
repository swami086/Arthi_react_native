/**
 * useSessionCopilot Hook
 * 
 * Specialized hook for managing the therapy session copilot sidebar.
 * Wraps useA2UI with session-specific initialization and analysis logic.
 */

import { useCallback, useEffect, useState } from 'react';
import { useA2UI } from './use-a2ui';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';

interface UseSessionCopilotOptions {
    userId: string;
    appointmentId: string;
    transcriptId?: string;
}

export function useSessionCopilot({ userId, appointmentId, transcriptId }: UseSessionCopilotOptions) {
    const surfaceId = `session-copilot-${appointmentId}`;
    const agentId = 'session-agent';

    const { surfaces, loading, sendAction, connected, refetch } = useA2UI({
        userId,
        agentId,
        surfaceId
    });

    const [isInitializing, setIsInitializing] = useState(false);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const surface = surfaces.get(surfaceId);

    // Initialize surface if it doesn't exist
    const initializeSurface = useCallback(async () => {
        if (isInitializing || surface) return;

        try {
            setIsInitializing(true);
            setError(null);
            const supabase = createClient();
            const { data, error: initError } = await supabase.functions.invoke('session-agent-init', {
                body: { appointmentId, transcriptId }
            });

            if (initError) throw initError;
            if (data?.success) {
                await refetch();
            }
        } catch (err: any) {
            console.error('[useSessionCopilot] Failed to initialize:', err);
            setError(err.message || 'Failed to initialize session agent');
        } finally {
            setIsInitializing(false);
        }
    }, [appointmentId, transcriptId, surface, isInitializing, refetch]);

    // Trigger analysis
    const refreshAnalysis = useCallback(async () => {
        if (!transcriptId || isAnalyzing) return;

        try {
            setIsAnalyzing(true);
            const supabase = createClient();

            // We use the edge function directly via action or direct invoke
            // The plan says "Trigger analyze_transcript action"
            const { error } = await supabase.functions.invoke('session-agent', {
                body: {
                    action: 'analyze_transcript',
                    surfaceId,
                    payload: { transcriptId, appointmentId }
                }
            });

            if (error) throw error;
            toast.success('Session analysis updated');
        } catch (err) {
            console.error('[useSessionCopilot] Analysis failed:', err);
            toast.error('Failed to refresh analysis');
        } finally {
            setIsAnalyzing(false);
        }
    }, [appointmentId, transcriptId, surfaceId, isAnalyzing]);

    // Initialize on mount or when transcript becomes available
    useEffect(() => {
        if (!surface && !loading && !isInitializing) {
            initializeSurface();
        }
    }, [surface, loading, isInitializing, initializeSurface]);

    return {
        surface,
        loading: loading || isInitializing,
        isAnalyzing,
        refreshAnalysis,
        connected,
        sendAction: async (action: any) => {
            try {
                const supabase = createClient();
                const { error: actionError } = await supabase.functions.invoke('session-agent', {
                    body: {
                        action: action.actionId,
                        surfaceId,
                        payload: action.payload
                    }
                });
                if (actionError) throw actionError;
            } catch (err) {
                console.error('[useSessionCopilot] Action failed:', err);
                toast.error('Failed to execute action');
            }
        },
        error,
        retry: initializeSurface
    };
}
