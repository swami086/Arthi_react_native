export const dynamic = 'force-dynamic';

import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getTherapistById } from '@/lib/services/therapist-service';
import ConfirmAppointmentClient from './_components/confirm-appointment-client';
import { generateServiceSchema } from '@/lib/schemas';

type Props = {
    params: Promise<{ therapistId: string }>;
    searchParams: Promise<{ date?: string; time?: string; endTime?: string }>;
};

export default async function ConfirmPage({ params, searchParams }: Props) {
    const { therapistId } = await params;
    const { date, time, endTime } = await searchParams;

    const supabase = await createClient();
    const therapist = await getTherapistById(supabase, therapistId);

    if (!therapist) notFound();
    if (!date || !time || !endTime) {
        // Redirect or error
        return <div>Invalid Booking Data</div>;
    }

    const serviceSchema = generateServiceSchema(therapist.full_name || 'Therapist', '1-on-1 Therapistship Session');

    return (
        <div className="container max-w-md mx-auto py-6 px-4">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }}
            />
            <ConfirmAppointmentClient
                therapist={therapist}
                dateStr={date}
                time={time}
                endTime={endTime}
            />
        </div>
    );
}
