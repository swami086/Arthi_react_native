export const dynamic = 'force-dynamic';

import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import SessionsPageClient from './_components/SessionsPageClient';

export const metadata = {
    title: 'My Sessions | SafeSpace Therapist',
    description: 'View your upcoming and past therapy sessions.',
};

export default async function TherapistSessionsPage() {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect('/login');

    const { data: profile } = await supabase
        .from('profiles')
        .select('practice_id')
        .eq('user_id', user.id)
        .single();

    const { data: appointments } = await supabase
        .from('appointments' as any)
        .select(`
            *,
            patient:profiles!patient_id(*)
        `)
        .eq('therapist_id', user.id)
        .eq('practice_id', profile?.practice_id)
        .order('start_time', { ascending: true });

    const upcoming = appointments?.filter((a: any) => new Date(a.start_time) > new Date()) || [];
    const past = appointments?.filter((a: any) => new Date(a.start_time) <= new Date()) || [];

    return (
        <SessionsPageClient
            appointments={appointments ?? []}
            upcoming={upcoming}
            past={past}
        />
    );
}

