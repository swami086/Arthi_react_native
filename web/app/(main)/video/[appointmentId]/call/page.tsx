export const dynamic = 'force-dynamic';

import { getAppointmentWithRoom, getDailyRoomToken } from '@/app/actions/video';
import VideoCallClient from './_components/video-call-client';
import { notFound, redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

interface PageProps {
    params: Promise<{
        appointmentId: string;
    }>;
}

export default async function VideoCallPage({ params }: PageProps) {
    const { appointmentId } = await params;

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect(`/auth/login?next=/video/${appointmentId}/call`);
    }

    const { data: appointment } = await getAppointmentWithRoom(appointmentId);

    if (!appointment || !appointment.video_room) {
        // Must go through waiting room first to create room
        redirect(`/video/${appointmentId}/waiting`);
    }

    const isMentor = appointment.mentor_id === user.id;

    // Generate token server-side for security
    const { token } = await getDailyRoomToken(
        appointment.video_room.room_name,
        user.id,
        isMentor ? 'mentor' : 'mentee'
    );

    if (!token) {
        // Handle error gracefully
        throw new Error('Could not generate meeting token');
    }

    return (
        <VideoCallClient
            roomUrl={appointment.video_room.room_url}
            token={token}
            appointment={appointment}
            user={user}
        />
    );
}
