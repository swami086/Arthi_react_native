export const dynamic = 'force-dynamic';

import { createClient } from '@/lib/supabase/server';
import { notFound, redirect } from 'next/navigation';
import SoapEditorClient from './_components/soap-editor-client';

export default async function SoapNotePage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect('/login');

    // Fetch Therapist Profile
    const { data: profileResult } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('user_id', user.id)
        .single();
    const profile = profileResult as any;

    // Fetch Recording to get transcript_id
    const { data: recordingResult } = await supabase
        .from('session_recordings')
        .select('transcript_id, id')
        .eq('appointment_id', id)
        .maybeSingle();
    const recording = recordingResult as any;

    // Fetch Appointment to get Patient Reference
    const { data: appointmentResult } = await supabase
        .from('appointments')
        .select('patient:patient_id(full_name)')
        .eq('id', id)
        .single();
    const appointment = appointmentResult as any;

    if (!recording) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen">
                <h1 className="text-2xl font-bold mb-4">No Recording Found</h1>
                <p>Please record a session first generated a transcript.</p>
            </div>
        );
    }

    if (!recording.transcript_id) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen">
                <h1 className="text-2xl font-bold mb-4">Processing Transcript...</h1>
                <p>The transcript is not ready yet. Please check back in a few moments.</p>
            </div>
        );
    }

    // Safely extract patient name (assuming it's an object from the join, or strictly typed)
    // Supabase JS often returns array or object depending on relation.
    // Based on previous code in other pages, it seems like object.
    const patientName = Array.isArray(appointment?.patient)
        ? appointment?.patient[0]?.full_name
        : (appointment?.patient as any)?.full_name || 'Patient';

    return (
        <SoapEditorClient
            appointmentId={id}
            transcriptId={recording.transcript_id}
            userId={user.id}
            therapistName={profile?.full_name || 'Therapist'}
            patientName={patientName}
        />
    );
}
