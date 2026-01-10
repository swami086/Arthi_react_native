import { SupabaseClient } from '@supabase/supabase-js';
import { reportError } from '@/lib/rollbar-utils';

export async function getPatientStats(supabase: SupabaseClient, userId: string) {
    try {
        // Total sessions (completed appointments)
        const { count: totalSessions } = await supabase
            .from('appointments')
            .select('*', { count: 'exact', head: true })
            .eq('patient_id', userId)
            .eq('status', 'completed');

        // Active therapists
        const { count: activeTherapists } = await supabase
            .from('therapist_patient_relationships')
            .select('*', { count: 'exact', head: true })
            .eq('patient_id', userId)
            .eq('status', 'active');

        // This month's sessions
        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        startOfMonth.setHours(0, 0, 0, 0);

        const { count: monthSessions } = await supabase
            .from('appointments')
            .select('*', { count: 'exact', head: true })
            .eq('patient_id', userId)
            .gte('start_time', startOfMonth.toISOString());

        return {
            totalSessions: totalSessions || 0,
            activeTherapists: activeTherapists || 0,
            monthSessions: monthSessions || 0,
            completionRate: totalSessions ? 100 : 0, // Simplified for now
        };
    } catch (error) {
        reportError(error, 'stats-service.getPatientStats', { userId });
        return {
            totalSessions: 0,
            activeTherapists: 0,
            monthSessions: 0,
            completionRate: 0,
        };
    }
}

export async function getRecentActivity(supabase: SupabaseClient, userId: string) {
    try {
        // Upcoming appointments
        const { data: appointments } = await supabase
            .from('appointments')
            .select(`
                *,
                therapists:therapist_id (
                    profiles:id (full_name, avatar_url)
                )
            `)
            .eq('patient_id', userId)
            .gte('start_time', new Date().toISOString())
            .order('start_time', { ascending: true })
            .limit(5);

        return appointments || [];
    } catch (error) {
        reportError(error, 'stats-service.getRecentActivity', { userId });
        return [];
    }
}
