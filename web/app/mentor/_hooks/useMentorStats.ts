
import { createClient } from '@/lib/supabase/client';
import { useState, useCallback, useEffect } from 'react';
import { reportError } from '@/lib/rollbar-utils';

export interface MentorStats {
    totalMentees: number;
    activeSessions: number;
    totalHours: number;
    rating: number;
    menteesTrend: number; // percentage
    sessionsTrend: number;
}

export function useMentorStats() {
    const supabase = createClient();
    const [stats, setStats] = useState<MentorStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchStats = useCallback(async () => {
        try {
            setLoading(true);
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            // RPC call to get_mentor_stats
            // Assuming the RPC exists as per plan references. 
            // If strictly following "Observations", it says "The system uses Supabase RPC functions (get_mentor_stats)".
            const { data, error } = await (supabase as any).rpc('get_mentor_stats', {
                mentor_uuid: user.id
            });

            if (error) throw error;

            // Map generic response to typed stats
            // Fallback for demo/dev if RPC not fully implemented or returns null
            setStats({
                totalMentees: data?.total_mentees || 0,
                activeSessions: data?.active_sessions || 0,
                totalHours: data?.total_hours || 0,
                rating: data?.rating || 5.0,
                menteesTrend: data?.mentees_trend || 0,
                sessionsTrend: data?.sessions_trend || 0
            });

        } catch (err: any) {
            console.error('Error fetching mentor stats:', err);
            setError(err.message);
            reportError(err, 'useMentorStats');
        } finally {
            setLoading(false);
        }
    }, [supabase]);

    useEffect(() => {
        fetchStats();

        // Optional: Realtime subscription for stats updates could go here if stats rely on tables
        // typically stats are aggregated so realtime might be heavy, but can subscribe to 'appointments'
        // and refetch stats.
        const channel = supabase.channel('mentor-stats-updates')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'appointments' }, () => {
                fetchStats();
            })
            .on('postgres_changes', { event: '*', schema: 'public', table: 'mentor_mentee_relationships' }, () => {
                fetchStats();
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [fetchStats, supabase]);

    return { stats, loading, error, refetch: fetchStats };
}
