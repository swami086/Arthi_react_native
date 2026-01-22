/**
 * useInsightsAgent Hook
 * 
 * Specialized hook for managing the AI clinical insights agent.
 * Handles patient data analysis, pattern identification, and progress tracking.
 */

import { useCallback, useEffect, useState } from 'react';
import { useA2UI } from './use-a2ui';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';

interface UseInsightsAgentOptions {
    userId: string;
    patientId: string;
}

export function useInsightsAgent({ userId, patientId }: UseInsightsAgentOptions) {
    const surfaceId = `insights-${patientId}`;
    const agentId = 'insights-agent';
    const supabase = createClient();

    const { surfaces, loading, sendAction, connected, refetch } = useA2UI({
        userId,
        agentId,
        surfaceId
    });

    const [isInitializing, setIsInitializing] = useState(false);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const surface = surfaces.get(surfaceId);

    const initializeInsights = useCallback(async () => {
        if (isInitializing || surface) return;

        try {
            setIsInitializing(true);
            setError(null);

            const { data, error } = await supabase.functions.invoke('insights-agent-init', {
                body: { patientId }
            });

            if (error) throw error;

            if (data) {
                await refetch();
            }
        } catch (err: any) {
            console.error('[useInsightsAgent] Failed to initialize:', err);
            setError(err.message || 'Failed to initialize insights agent');
        } finally {
            setIsInitializing(false);
        }
    }, [patientId, surface, isInitializing, refetch, supabase]);

    const refreshInsights = useCallback(async () => {
        if (isAnalyzing) return;

        try {
            setIsAnalyzing(true);
            const { error } = await supabase.functions.invoke('insights-agent', {
                body: {
                    action: 'generate_insights',
                    surfaceId,
                    payload: { patientId }
                }
            });

            if (error) throw error;
            toast.success('Insights updated');
        } catch (err) {
            console.error('[useInsightsAgent] Analysis failed:', err);
            toast.error('Failed to refresh insights');
        } finally {
            setIsAnalyzing(false);
        }
    }, [patientId, surfaceId, isAnalyzing, supabase]);

    useEffect(() => {
        if (!surface && !loading && !isInitializing) {
            initializeInsights();
        }
    }, [surface, loading, isInitializing, initializeInsights]);

    return {
        surface,
        loading: loading || isInitializing,
        isAnalyzing,
        refreshInsights,
        connected,
        sendAction: async (action: any) => {
            try {
                const { error } = await supabase.functions.invoke('insights-agent', {
                    body: {
                        action: action.actionId,
                        surfaceId,
                        payload: action.payload
                    }
                });

                if (error) throw error;
            } catch (err) {
                console.error('[useInsightsAgent] Action failed:', err);
                toast.error('Failed to execute insights action');
            }
        },
        error,
        retry: initializeInsights
    };
}
