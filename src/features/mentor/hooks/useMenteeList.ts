import { useEffect, useState, useCallback } from 'react';
import { getMenteeList } from '../../../api/mentorService';
import { MenteeWithActivity } from '../../../api/types';
import { useAuth } from '../../auth/hooks/useAuth';
import { supabase } from '../../../api/supabase';

export const useMenteeList = () => {
    const { user } = useAuth();
    const [mentees, setMentees] = useState<MenteeWithActivity[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchMentees = useCallback(async () => {
        if (!user) return;
        try {
            setLoading(true);
            const data = await getMenteeList(user.id);
            setMentees(data);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [user]);

    useEffect(() => {
        fetchMentees();

        const subscription = supabase
            .channel('mentee_list_updates')
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'appointments' },
                () => fetchMentees()
            )
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'messages' },
                () => fetchMentees()
            )
            .subscribe();

        return () => {
            subscription.unsubscribe();
        };
    }, [fetchMentees]);

    return { mentees, loading, error, refetch: fetchMentees };
};
