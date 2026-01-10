export const dynamic = 'force-dynamic';

import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import RecordingClient from './_components/recording-client';

interface RecordingPageProps {
    params: Promise<{
        id: string;
    }>;
}

export default async function RecordingPage({ params }: RecordingPageProps) {
    const { id } = await params;
    const supabase = await createClient();

    // 1. Verify User
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        redirect('/login');
    }

    // 2. Fetch Appointment & Verify Access
    const { data: appointmentData, error } = await supabase
        .from('appointments' as any)
        .select('*')
        .eq('id', id)
        .single();

    // Cast to explicit type or any
    const appointment = appointmentData as any;

    if (error || !appointment) {
        redirect('/therapist/appointments');
    }

    // Only allow therapist to record
    if (appointment.therapist_id !== user.id) {
        redirect('/therapist/dashboard');
    }

    // 3. Check for existing recording
    const { data: existingRecording } = await supabase
        .from('session_recordings' as any)
        .select('*')
        .eq('appointment_id', id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

    return (
        <div className="min-h-screen bg-background-light dark:bg-[#0e181b]">
            <RecordingClient
                appointment={appointment}
                user={user}
                existingRecording={existingRecording}
            />
        </div>
    );
}
