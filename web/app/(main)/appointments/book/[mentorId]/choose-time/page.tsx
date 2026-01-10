export const dynamic = 'force-dynamic';

import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getTherapistById } from '@/lib/services/therapist-service';
import ChooseTimeClient from './_components/choose-time-client';
import { generateServiceSchema } from '@/lib/schemas';

// Next.js 15 recommendation: params and searchParams are Promises
type Props = {
    params: Promise<{ therapistId: string }>;
    searchParams: Promise<{ date?: string; time?: string; endTime?: string }>;
};

export default async function ChooseTimePage({ params, searchParams }: Props) {
    const { therapistId } = await params;
    const { date, time, endTime } = await searchParams;

    const supabase = await createClient();
    const therapist = await getTherapistById(supabase, therapistId);

    if (!therapist) {
        notFound();
    }

    if (!date) {
        // Redirect or show error if date missing?
        // Ideally redirect to Step 1
        return (
            <div className="container p-4">
                <p>Date not selected. Please go back.</p>
            </div>
        );
    }

    const serviceSchema = generateServiceSchema(therapist.full_name || 'Therapist', '1-on-1 Therapistship Session');

    // Pass resolved params to client
    return (
        <div className="container max-w-md mx-auto py-6 px-4">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }}
            />
            <ChooseTimeClient
                therapist={therapist}
                dateStr={date}
                initialTime={time}
                initialEndTime={endTime}
            />
        </div>
    );
}
