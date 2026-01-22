export const dynamic = 'force-dynamic';

import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import PatientDetailClient from './_components/PatientDetailClient';

interface Props {
    params: Promise<{
        patientId: string;
    }>;
}

export async function generateMetadata({ params }: Props) {
    const { patientId } = await params;
    const supabase = await createClient();
    const { data: rawData } = await supabase.from('profiles').select('full_name').eq('user_id', patientId).single();
    const data = rawData as any;

    return {
        title: `${data?.full_name || 'Patient'} - Profile | SafeSpace`
    };
}

export default async function PatientDetailPage({ params }: Props) {
    const { patientId } = await params;
    const supabase = await createClient();

    // 1. Fetch Patient Profile
    const { data: patient, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', patientId)
        .single();

    if (profileError || !patient) {
        notFound();
    }

    // 2. Fetch Goals
    const { data: goals } = await supabase
        .from('patient_goals')
        .select('*')
        .eq('patient_id', patientId)
        .order('created_at', { ascending: false });

    // 3. Fetch Notes (check RLS policies if filtering is needed per therapist, usually RLS handles it)
    const { data: notes } = await supabase
        .from('therapist_notes')
        .select('*')
        .eq('patient_id', patientId)
        .order('created_at', { ascending: false });

    // 4. Fetch Sessions (Session History)
    const { data: sessions } = await supabase
        .from('appointments' as any)
        .select('*')
        .eq('patient_id', patientId)
        .order('start_time', { ascending: false });

    return (
        <PatientDetailClient
            patient={patient}
            initialGoals={goals || []}
            initialNotes={notes || []}
            initialSessions={sessions || []}
        />
    );
}
