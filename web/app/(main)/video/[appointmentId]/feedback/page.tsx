export const dynamic = 'force-dynamic';

import { getAppointmentWithRoom } from '@/app/actions/video';
import FeedbackClient from './_components/feedback-client';
import { notFound, redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

interface PageProps {
    params: Promise<{
        appointmentId: string;
    }>;
}

export default async function FeedbackPage({ params }: PageProps) {
    const { appointmentId } = await params;

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect(`/auth/login?next=/video/${appointmentId}/feedback`);
    }

    const { data: appointment } = await getAppointmentWithRoom(appointmentId);

    if (!appointment) {
        return notFound();
    }

    const isMentor = appointment.mentor_id === user.id;

    return (
        <FeedbackClient
            appointment={appointment}
            user={user}
            role={isMentor ? 'mentor' : 'mentee'}
        />
    );
}
