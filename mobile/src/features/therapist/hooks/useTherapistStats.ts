import { useEffect, useState, useCallback } from 'react';
import { getTherapistStats } from '../../../api/therapistService';
import { TherapistStats } from '../../../api/types';
import { useAuth } from '../../auth/hooks/useAuth';

export const useTherapistStats = () => {
    const { user } = useAuth();
    const [stats, setStats] = useState<TherapistStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchStats = useCallback(async () => {
        if (!user) return;
        try {
            setLoading(true);
            const data = await getTherapistStats(user.id);
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
