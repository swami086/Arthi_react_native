/**
 * useBookingAgent Hook
 * 
 * Specialized hook for managing the AI booking agent.
 * Handles scheduling, therapist search, and availability checks via A2UI.
 */

import { useCallback, useEffect, useState } from 'react';
import { useA2UI } from './use-a2ui';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';

interface UseBookingAgentOptions {
    userId: string;
    patientId?: string;
}

export function useBookingAgent({ userId, patientId }: UseBookingAgentOptions) {
    const surfaceId = `booking-${userId}`;
    const agentId = 'booking-agent';
    const supabase = createClient();

    const { surfaces, loading, sendAction, connected, refetch } = useA2UI({
        userId,
        agentId,
        surfaceId
    });

    const [isInitializing, setIsInitializing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const surface = surfaces.get(surfaceId);

    const initializeBooking = useCallback(async () => {
        if (isInitializing || surface) return;

        try {
            setIsInitializing(true);
            setError(null);

            const { data, error } = await supabase.functions.invoke('booking-agent-init', {
                body: {
                    patientId,
                    source: 'web'
                }
            });

            if (error) throw error;

            if (data) {
                await refetch();
            }
        } catch (err: any) {
            console.error('[useBookingAgent] Failed to initialize:', err);
            setError(err.message || 'Failed to initialize booking agent');
        } finally {
            setIsInitializing(false);
        }
    }, [patientId, surface, isInitializing, refetch, supabase]);

    useEffect(() => {
        if (!surface && !loading && !isInitializing) {
            initializeBooking();
        }
    }, [surface, loading, isInitializing, initializeBooking]);

    return {
        surface,
        loading: loading || isInitializing,
        connected,
        sendAction: async (action: any) => {
            try {
                const { error } = await supabase.functions.invoke('booking-agent', {
                    body: {
                        action: action.actionId,
                        surfaceId,
                        payload: action.payload
                    }
                });

                if (error) throw error;
            } catch (err) {
                console.error('[useBookingAgent] Action failed:', err);
                toast.error('Failed to execute booking action');
            }
        },
        error,
        retry: initializeBooking
    };
}
