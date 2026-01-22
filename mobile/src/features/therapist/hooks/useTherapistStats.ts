import { useEffect, useState, useCallback } from 'react';
import { getTherapistStats } from '../../../api/therapistService';
import { TherapistStats } from '../../../api/types';
import { useAuth } from '../../auth/hooks/useAuth';

export const useTherapistStats = () => {
    const { user, profile } = useAuth();
    const [stats, setStats] = useState<TherapistStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchStats = useCallback(async () => {
        if (!user || !profile?.practice_id) return;
        try {
            setLoading(true);
            const data = await getTherapistStats(user.id, profile.practice_id);
            if (data) {
                setStats(data);
            }
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [user, profile?.practice_id]);

    useEffect(() => {
        fetchStats();
    }, [fetchStats]);

    return { stats, loading, error, refetch: fetchStats };
};
