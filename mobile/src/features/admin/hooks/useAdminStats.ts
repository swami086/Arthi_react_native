import { useState, useEffect } from 'react';
import { getAdminStats } from '../../../api/adminService';
import { AdminStats } from '../../../api/types';

export const useAdminStats = () => {
    const [stats, setStats] = useState<AdminStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchStats = async () => {
        try {
            setLoading(true);
            const data = await getAdminStats();
            setStats(data);
            setError(null);
        } catch (err: any) {
            setError(err.message || 'Failed to fetch admin stats');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStats();
    }, []);

    return { stats, loading, error, refetch: fetchStats };
};
