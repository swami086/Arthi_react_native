export const dynamic = 'force-dynamic';

import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import ProfilePageClient from './_components/profile-page-client';
import { getProfile, getMyTherapists } from '@/app/actions/profile';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'My Profile | SafeSpace',
    description: 'View and manage your SafeSpace profile, therapists, and upcoming sessions.',
};

export default async function ProfilePage() {
    const supabase = await createClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (!user || authError) {
        redirect('/auth/login');
    }

    // Fetch data in parallel
    const [profileRes, therapistsRes, appointmentsRes] = await Promise.all([
        getProfile(user.id),
        getMyTherapists(user.id),
        supabase
            .from('appointments')
            .select(`
        *,
        therapist:profiles!appointments_therapist_id_fkey (
          full_name,
          avatar_url,
          specialization
        )
      `)
            .eq('patient_id', user.id)
            .gte('start_time', new Date().toISOString())
            .order('start_time', { ascending: true })
            .limit(1)
    ]);

    if (profileRes.error) {
        // Handle error or show empty state
    }

    const profile = profileRes.data;
    const therapists = therapistsRes.data || [];
    const upcomingAppointment = appointmentsRes.data?.[0] || null;

    // Calculate stats
    // For total sessions, we could also query completed appointments
    const { count: completedSessions } = await supabase
        .from('appointments')
        .select('*', { count: 'exact', head: true })
        .eq('patient_id', user.id)
        .eq('status', 'completed');

    const stats = {
        totalSessions: completedSessions || 0,
        activeTherapists: therapists.length,
        upcomingSessions: upcomingAppointment ? 1 : 0
    };

    return (
        <ProfilePageClient
            user={user}
            profile={profile}
            upcomingAppointment={upcomingAppointment}
            therapists={therapists}
            stats={stats}
        />
    );
}
