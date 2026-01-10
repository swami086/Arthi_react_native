'use client';

import { useState, useCallback, useEffect } from 'react';
import { getMyMentors } from '@/app/actions/profile';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';

export function useMyMentors(userId?: string) {
    const [mentors, setMentors] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const supabase = createClient();

    const fetchMentors = useCallback(async () => {
        if (!userId) {
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            const { data, error: fetchError } = await getMyMentors(userId);
            if (fetchError) throw new Error(fetchError);
            setMentors(data || []);
        } catch (err: any) {
            setError(err.message);
            toast.error('Failed to load mentors');
        } finally {
            setLoading(false);
        }
    }, [userId]);

    useEffect(() => {
        fetchMentors();

        if (!userId) return;

        // Set up real-time subscription
        const channel = supabase
            .channel(`mentor_relationships_${userId}`)
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'mentor_mentee_relationships',
                    filter: `mentee_id=eq.${userId}`,
                },
                () => {
                    fetchMentors();
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [userId, fetchMentors, supabase]);

    return {
        mentors,
        loading,
        error,
        refetch: fetchMentors,
    };
}
