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

    // Initialize surface if it doesn't exist
    const initializeSurface = useCallback(async () => {
        // Guard: Don't initialize if appointmentId is empty
        if (!appointmentId || appointmentId.trim() === '') {
            return;
        }

        if (isInitializing || surface) return;

        try {
            setIsInitializing(true);
            setError(null);

            // Get auth session for fetch call
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                throw new Error('Not authenticated');
            }

            // Use fetch directly to get better error messages
            const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
            const response = await fetch(`${supabaseUrl}/functions/v1/session-agent-init`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session.access_token}`,
                    'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
                },
                body: JSON.stringify({
                    appointmentId,
                    transcriptId
                })
            });

            const data = await response.json();

            if (!response.ok) {
                // Extract error message from response
                const errorMsg = data?.error || data?.message || `Edge Function returned ${response.status}`;
                throw new Error(errorMsg);
            }

            // Check if the response itself contains an error
            if (data && typeof data === 'object' && 'error' in data) {
                const errorMsg = typeof data.error === 'string' ? data.error : 'Edge Function returned an error';
                throw new Error(errorMsg);
            }

            if (data) {
                await refetch();
            }
        } catch (err: any) {
            console.error('[useSessionCopilot] Failed to initialize:', err);
            // Extract error message from various error formats
            let errorMessage = 'Failed to initialize session agent';
            if (err?.message) {
                errorMessage = err.message;
            } else if (typeof err === 'string') {
                errorMessage = err;
            } else if (err?.error?.message) {
                errorMessage = err.error.message;
            } else if (err?.context?.message) {
                errorMessage = err.context.message;
            }
            setError(errorMessage);
        } finally {
            setIsInitializing(false);
        }
    }, [appointmentId, transcriptId, surface, isInitializing, refetch, supabase]);

    // Trigger analysis
    const refreshAnalysis = useCallback(async () => {
        if (!transcriptId || isAnalyzing) return;

        try {
            setIsAnalyzing(true);

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
    }, [appointmentId, transcriptId, surfaceId, isAnalyzing, supabase]);

    // Initialize on mount or when transcript becomes available
    useEffect(() => {
        if (!surface && !loading && !isInitializing && !error) {
            initializeSurface();
        }
    }, [surface, loading, isInitializing, error, initializeSurface]);

    return {
        surface,
        loading: loading || isInitializing,
        isAnalyzing,
        refreshAnalysis,
        connected,
        sendAction: async (action: any) => {
            try {
                const { error } = await supabase.functions.invoke('session-agent', {
                    body: {
                        action: action.actionId,
                        surfaceId,
                        payload: action.payload
                    }
                });

                if (error) throw error;

            } catch (err) {
                console.error('[useSessionCopilot] Action failed:', err);
                toast.error('Failed to execute action');
            }
        },
        error,
        retry: initializeSurface
    };
}
