export const dynamic = 'force-dynamic';

import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import TranscriptViewerClient from './_components/transcript-viewer-client';

interface PageProps {
    params: Promise<{
        id: string; // appointment_id
    }>;
}

export default async function TranscriptPage({ params }: PageProps) {
    const supabase = await createClient();
    const { id } = await params;

    const [
        { data: recordingResult },
        { data: profileResult }
    ] = await Promise.all([
        supabase.from('session_recordings').select('id').eq('appointment_id', id).maybeSingle(),
        supabase.auth.getUser().then(async ({ data: { user } }) => {
            if (!user) return { data: null };
            return supabase.from('profiles').select('full_name').eq('id', user.id).single();
        })
    ]);

    const recording = recordingResult as any;
    const profile = profileResult as any;

    if (!recording) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-6">
                <h2 className="text-xl font-semibold mb-2">No Recording Found</h2>
                <p className="text-gray-500">This session has not been recorded or processed yet.</p>
            </div>
        );
    }

    return (
        <TranscriptViewerClient
            recordingId={recording.id}
            appointmentId={id}
            mentorName={profile?.full_name || 'Mentor'}
        />
    );
}
