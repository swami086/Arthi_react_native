import { createClient } from '@/lib/supabase/server';
import TherapistHomeClient from './_components/TherapistHomeClient';
import { startOfDay, endOfDay } from 'date-fns';

export default async function TherapistHomePage() {
    const supabase = await createClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
        return <div>Unauthorized</div>;
    }

    // Initialize default values
    let initialStats = {
        totalPatients: 0,
        activeSessions: 0,
        totalHours: 0,
        rating: 5.0,
        patientsTrend: 0,
        sessionsTrend: 0
    };
    let initialAppointments: any[] = [];
    let initialConversations: any[] = [];

    try {
        // Fetch Counts in Parallel
        const [patientsCount, sessionsCount, todayAppointments, recentMessages] = await Promise.all([
            // Total Patients
            supabase
                .from('therapist_patient_relationships')
                .select('*', { count: 'exact', head: true })
                .eq('therapist_id', user.id)
                .eq('status', 'active'),

            // Total Sessions (All time)
            supabase
                .from('appointments')
                .select('*', { count: 'exact', head: true })
                .eq('therapist_id', user.id)
                .eq('status', 'completed'),

            // Today's Appointments
            supabase
                .from('appointments')
                .select('*, patient:profiles!appointments_patient_id_fkey(*)')
                .eq('therapist_id', user.id)
                .gte('start_time', startOfDay(new Date()).toISOString())
                .lte('start_time', endOfDay(new Date()).toISOString())
                .order('start_time', { ascending: true }),

            // Recent Messages from patients
            supabase
                .from('messages')
                .select('*, sender:profiles!messages_sender_id_fkey(*)')
                .eq('receiver_id', user.id)
                .order('created_at', { ascending: false })
                .limit(5)
        ]);

        initialStats = {
            totalPatients: patientsCount.count || 0,
            activeSessions: sessionsCount.count || 0, // Simplified as all-time total for now
            totalHours: (sessionsCount.count || 0) * 1, // Placeholder: assuming 1 hour per session
            rating: 5.0, // Hardcoded for now
            patientsTrend: 5, // Hardcoded trend
            sessionsTrend: 12 // Hardcoded trend
        };

        initialAppointments = todayAppointments.data || [];
        initialConversations = recentMessages.data || [];

    } catch (error) {
        console.error('Error fetching therapist home data:', error);
        // Fallback to defaults already initialized
    }

    return (
        <TherapistHomeClient
            user={user}
            initialStats={initialStats}
            initialAppointments={initialAppointments}
            initialConversations={initialConversations}
        />
    );
}
