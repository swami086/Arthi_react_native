export const dynamic = 'force-dynamic';

import { getAppointmentWithRoom } from '@/app/actions/video';
import WaitingRoomClient from './_components/waiting-room-client';
import { notFound, redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

interface PageProps {
    params: Promise<{
        appointmentId: string;
    }>;
}

export default async function WaitingRoomPage({ params }: PageProps) {
    const { appointmentId } = await params;

    // Auth check
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect(`/auth/login?next=/video/${appointmentId}/waiting`);
    }

    const result = await getAppointmentWithRoom(appointmentId);

    if (!result.success || !result.data) {
        return notFound();
    }

    const appointment = result.data;

    // Access control
    const isMentor = appointment.mentor_id === user.id;
    const isMentee = appointment.mentee_id === user.id;

    if (!isMentor && !isMentee) {
        // Unauthorized
        redirect('/appointments');
    }

    return (
        <WaitingRoomClient
            appointment={appointment}
            user={user}
            role={isMentor ? 'mentor' : 'mentee'}
        />
    );
}
