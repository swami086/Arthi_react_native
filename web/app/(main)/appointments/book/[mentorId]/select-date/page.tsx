export const dynamic = 'force-dynamic';

import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getTherapistById } from '@/lib/services/therapist-service';
import SelectDateClient from './_components/select-date-client';
import { generateMetadata as generateSeoMetadata } from '@/lib/metadata';
import { generateServiceSchema } from '@/lib/schemas';
import Loading from '../../../loading';

export async function generateMetadata({ params }: { params: Promise<{ therapistId: string }> }) {
    const { therapistId } = await params;
    const supabase = await createClient();
    try {
        const therapist = await getTherapistById(supabase, therapistId);
        if (!therapist) return generateSeoMetadata({ title: 'Therapist Not Found', description: 'Therapist not found', path: `/appointments/book/${therapistId}/select-date` });

        return generateSeoMetadata({
            title: `Book Session with ${therapist.full_name}`,
            description: `Schedule a 1-on-1 therapistship session with ${therapist.full_name} on SafeSpace.`,
            path: `/appointments/book/${therapistId}/select-date`,
        });
    } catch (e) {
        return generateSeoMetadata({
            title: 'Book Appointment',
            description: 'Book a therapistship session on SafeSpace',
            path: `/appointments/book/${therapistId}/select-date`
        });
    }
}

export default async function SelectDatePage({ params }: { params: Promise<{ therapistId: string }> }) {
    const { therapistId } = await params;
    const supabase = await createClient();
    const therapist = await getTherapistById(supabase, therapistId);

    if (!therapist) {
        notFound();
    }

    const serviceSchema = generateServiceSchema(therapist.full_name || 'Therapist', '1-on-1 Therapistship Session');

    return (
        <div className="container max-w-md mx-auto py-6 px-4">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify(serviceSchema).replace(/</g, '\\u003c'),
                }}
            />
            <Suspense fallback={<Loading />}>
                <SelectDateClient therapist={therapist} />
            </Suspense>
        </div>
    );
}
