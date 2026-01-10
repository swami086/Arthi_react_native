import { useState, useEffect, useCallback } from 'react';
import { getAdminDashboardData } from '../_actions/adminActions';
import { AdminStats } from '@/types/admin';
import { reportError } from '@/lib/rollbar-utils';

export function useAdminStats() {
    const [stats, setStats] = useState<AdminStats | null>(null);
    const [recentActions, setRecentActions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchData = useCallback(async (isRefresh = false) => {
        try {
            if (isRefresh) setRefreshing(true);
            else setLoading(true);

            const res = await getAdminDashboardData();
            if (res.success && res.data) {
                setStats(res.data.stats);
                setRecentActions(res.data.recentActions);
            } else {
                setError(res.error || 'Failed to fetch dashboard data');
            }
        } catch (err: any) {
            setError(err.message);
            reportError(err, 'useAdminStats');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    return { stats, recentActions, loading, refreshing, error, refetch: () => fetchData(true) };
}
