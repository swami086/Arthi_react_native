import { useEffect, useState, useCallback } from 'react';
import { getMentorStats } from '../../../api/mentorService';
import { MentorStats } from '../../../api/types';
import { useAuth } from '../../auth/hooks/useAuth';

export const useMentorStats = () => {
    const { user } = useAuth();
    const [stats, setStats] = useState<MentorStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchStats = useCallback(async () => {
        if (!user) return;
        try {
            setLoading(true);
            const data = await getMentorStats(user.id);
            if (data) {
                setStats(data);
            }
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [user]);

    useEffect(() => {
        fetchStats();
    }, [fetchStats]);

    return { stats, loading, error, refetch: fetchStats };
};
