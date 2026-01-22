export const dynamic = 'force-dynamic';

import { createClient } from '@/lib/supabase/server';
import { Metadata } from 'next';
import { reportError } from '@/lib/rollbar-utils';
import TherapistHomeClient from './_components/TherapistHomeClient';

export const metadata: Metadata = {
    title: 'Therapist Dashboard | SafeSpace',
    description: 'Manage your patients, sessions, and referrals.',
};

export default async function TherapistHomePage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return null; // handled by layout/middleware

    // 1. Fetch Practice Context
    const { data: profile } = await supabase
        .from('profiles')
        .select('practice_id')
        .eq('user_id', user.id)
        .single();
    const practiceId = profile?.practice_id;

    // 2. Fetch Stats (RPC)
    let stats = null;
    try {
        const { data } = await (supabase as any).rpc('get_therapist_stats', {
            therapist_user_id: user.id
        });
        stats = data;
    } catch (error) {
        console.error('Error fetching therapist stats:', error);
    }

    // 3. Fetch Upcoming Appointments (Limit 3)
    let appointments: any[] = [];
    try {
        let query = supabase
            .from('appointments')
            .select(`
                id,
                start_time,
                status,
                patient:patient_id(full_name, avatar_url)
            `)
            .eq('therapist_id', user.id)
            .eq('status', 'scheduled')
            .gte('start_time', new Date().toISOString());

        if (practiceId) {
            query = query.eq('practice_id', practiceId);
        }

        const { data } = await query
            .order('start_time', { ascending: true })
            .limit(3);
        appointments = data || [];
    } catch (error) {
        console.error('Error fetching appointments:', error);
    }

    // 4. Fetch Recent Conversations (Limit 3)
    let conversations: any[] = [];
    try {
        let query = supabase
            .from('messages')
            .select(`
                id,
                created_at,
                content,
                sender:sender_id(full_name)
            `)
            .eq('receiver_id', user.id); // Changed from recipient_id to receiver_id

        if (practiceId) {
            query = query.eq('practice_id', practiceId);
        }

        const { data } = await query
            .order('created_at', { ascending: false })
            .limit(5);
        conversations = data || [];
    } catch (error) {
        console.error('Error fetching conversations:', error);
    }

    // Formatting stats if rpc returns snake_case, client expects camelCase
    // Cast stats to any to avoid TS errors if types aren't generated
    const typedStats = stats as any;
    const formattedStats = typedStats ? {
        totalPatients: typedStats.total_patients || 0,
        activeSessions: typedStats.active_sessions || 0,
        totalHours: typedStats.total_hours || 0,
        rating: typedStats.rating || 5.0,
        patientsTrend: typedStats.patients_trend || 0,
        sessionsTrend: typedStats.sessions_trend || 0
    } : null;

    return (
        <TherapistHomeClient
            user={user}
            initialStats={formattedStats}
            initialAppointments={appointments || []}
            initialConversations={conversations || []}
        />
    );
}
