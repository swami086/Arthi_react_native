
import { createClient } from '@/lib/supabase/client';
import { useState, useCallback, useEffect } from 'react';
import { reportError } from '@/lib/rollbar-utils';

export interface TherapistStats {
    totalPatients: number;
    activeSessions: number;
    totalHours: number;
    rating: number;
    patientsTrend: number; // percentage
    sessionsTrend: number;
}

export function useTherapistStats() {
    const supabase = createClient();
    const [stats, setStats] = useState<TherapistStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchStats = useCallback(async () => {
        try {
            setLoading(true);
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            // RPC call to get_therapist_stats
            // Assuming the RPC exists as per plan references. 
            // If strictly following "Observations", it says "The system uses Supabase RPC functions (get_therapist_stats)".
            const { data, error } = await (supabase as any).rpc('get_therapist_stats', {
                therapist_user_id: user.id
            });

            if (error) throw error;

            // Map generic response to typed stats
            // Fallback for demo/dev if RPC not fully implemented or returns null
            setStats({
                totalPatients: data?.total_patients || 0,
                activeSessions: data?.active_sessions || 0,
                totalHours: data?.total_hours || 0,
                rating: data?.rating || 5.0,
                patientsTrend: data?.patients_trend || 0,
                sessionsTrend: data?.sessions_trend || 0
            });

        } catch (err: any) {
            console.error('Error fetching therapist stats:', err);
            setError(err.message);
            reportError(err, 'useTherapistStats');
        } finally {
            setLoading(false);
        }
    }, [supabase]);

    useEffect(() => {
        fetchStats();

        // Optional: Realtime subscription for stats updates could go here if stats rely on tables
        // typically stats are aggregated so realtime might be heavy, but can subscribe to 'appointments'
        // and refetch stats.
        const channel = supabase.channel('therapist-stats-updates')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'appointments' }, () => {
                fetchStats();
            })
            .on('postgres_changes', { event: '*', schema: 'public', table: 'therapist_patient_relationships' }, () => {
                fetchStats();
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [fetchStats, supabase]);

    return { stats, loading, error, refetch: fetchStats };
}
