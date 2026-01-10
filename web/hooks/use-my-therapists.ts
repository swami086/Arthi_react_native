'use client';

import { useState, useCallback, useEffect } from 'react';
import { getMyTherapists } from '@/app/actions/profile';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';

export function useMyTherapists(userId?: string) {
    const [therapists, setTherapists] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const supabase = createClient();

    const fetchTherapists = useCallback(async () => {
        if (!userId) {
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            const { data, error: fetchError } = await getMyTherapists(userId);
            if (fetchError) throw new Error(fetchError);
            setTherapists(data || []);
        } catch (err: any) {
            setError(err.message);
            toast.error('Failed to load therapists');
        } finally {
            setLoading(false);
        }
    }, [userId]);

    useEffect(() => {
        fetchTherapists();

        if (!userId) return;

        // Set up real-time subscription
        const channel = supabase
            .channel(`therapist_relationships_${userId}`)
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'therapist_patient_relationships',
                    filter: `patient_id=eq.${userId}`,
                },
                () => {
                    fetchTherapists();
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [userId, fetchTherapists, supabase]);

    return {
        therapists,
        loading,
        error,
        refetch: fetchTherapists,
    };
}
