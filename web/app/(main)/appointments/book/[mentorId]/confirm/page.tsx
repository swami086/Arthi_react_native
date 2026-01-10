export const dynamic = 'force-dynamic';

import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getMentorById } from '@/lib/services/mentor-service';
import ConfirmAppointmentClient from './_components/confirm-appointment-client';
import { generateServiceSchema } from '@/lib/schemas';

type Props = {
    params: Promise<{ mentorId: string }>;
    searchParams: Promise<{ date?: string; time?: string; endTime?: string }>;
};

export default async function ConfirmPage({ params, searchParams }: Props) {
    const { mentorId } = await params;
    const { date, time, endTime } = await searchParams;

    const supabase = await createClient();
    const mentor = await getMentorById(supabase, mentorId);

    if (!mentor) notFound();
    if (!date || !time || !endTime) {
        // Redirect or error
        return <div>Invalid Booking Data</div>;
    }

    const serviceSchema = generateServiceSchema(mentor.full_name || 'Mentor', '1-on-1 Mentorship Session');

    return (
        <div className="container max-w-md mx-auto py-6 px-4">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }}
            />
            <ConfirmAppointmentClient
                mentor={mentor}
                dateStr={date}
                time={time}
                endTime={endTime}
            />
        </div>
    );
}
