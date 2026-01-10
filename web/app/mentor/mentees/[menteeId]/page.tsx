export const dynamic = 'force-dynamic';

import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import MenteeDetailClient from './_components/MenteeDetailClient';

interface Props {
    params: Promise<{
        menteeId: string;
    }>;
}

export async function generateMetadata({ params }: Props) {
    const { menteeId } = await params;
    const supabase = await createClient();
    const { data: rawData } = await supabase.from('profiles' as any).select('full_name').eq('id', menteeId).single();
    const data = rawData as any;

    return {
        title: `${data?.full_name || 'Mentee'} - Profile | SafeSpace`
    };
}

export default async function MenteeDetailPage({ params }: Props) {
    const { menteeId } = await params;
    const supabase = await createClient();

    // 1. Fetch Mentee Profile
    const { data: mentee, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', menteeId)
        .single();

    if (profileError || !mentee) {
        notFound();
    }

    // 2. Fetch Goals
    const { data: goals } = await supabase
        .from('mentee_goals')
        .select('*')
        .eq('mentee_id', menteeId)
        .order('created_at', { ascending: false });

    // 3. Fetch Notes (check RLS policies if filtering is needed per mentor, usually RLS handles it)
    const { data: notes } = await supabase
        .from('mentor_notes')
        .select('*')
        .eq('mentee_id', menteeId)
        .order('created_at', { ascending: false });

    // 4. Fetch Sessions (Session History)
    const { data: sessions } = await supabase
        .from('appointments' as any)
        .select('*')
        .eq('mentee_id', menteeId)
        .order('start_time', { ascending: false });

    return (
        <MenteeDetailClient
            mentee={mentee}
            initialGoals={goals || []}
            initialNotes={notes || []}
            initialSessions={sessions || []}
        />
    );
}
