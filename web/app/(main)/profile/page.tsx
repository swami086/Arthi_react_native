export const dynamic = 'force-dynamic';

import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import ProfilePageClient from './_components/profile-page-client';
import { getProfile, getMyMentors } from '@/app/actions/profile';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'My Profile | SafeSpace',
    description: 'View and manage your SafeSpace profile, mentors, and upcoming sessions.',
};

export default async function ProfilePage() {
    const supabase = await createClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (!user || authError) {
        redirect('/auth/login');
    }

    // Fetch data in parallel
    const [profileRes, mentorsRes, appointmentsRes] = await Promise.all([
        getProfile(user.id),
        getMyMentors(user.id),
        supabase
            .from('appointments')
            .select(`
        *,
        mentor:profiles!appointments_mentor_id_fkey (
          full_name,
          avatar_url,
          specialization
        )
      `)
            .eq('mentee_id', user.id)
            .gte('start_time', new Date().toISOString())
            .order('start_time', { ascending: true })
            .limit(1)
    ]);

    if (profileRes.error) {
        // Handle error or show empty state
    }

    const profile = profileRes.data;
    const mentors = mentorsRes.data || [];
    const upcomingAppointment = appointmentsRes.data?.[0] || null;

    // Calculate stats
    // For total sessions, we could also query completed appointments
    const { count: completedSessions } = await supabase
        .from('appointments')
        .select('*', { count: 'exact', head: true })
        .eq('mentee_id', user.id)
        .eq('status', 'completed');

    const stats = {
        totalSessions: completedSessions || 0,
        activeMentors: mentors.length,
        upcomingSessions: upcomingAppointment ? 1 : 0
    };

    return (
        <ProfilePageClient
            user={user}
            profile={profile}
            upcomingAppointment={upcomingAppointment}
            mentors={mentors}
            stats={stats}
        />
    );
}
