export const dynamic = 'force-dynamic';

import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getMentorById } from '@/lib/services/mentor-service';
import SelectDateClient from './_components/select-date-client';
import { generateMetadata as generateSeoMetadata } from '@/lib/metadata';
import { generateServiceSchema } from '@/lib/schemas';
import Loading from '../../../loading';

export async function generateMetadata({ params }: { params: Promise<{ mentorId: string }> }) {
    const { mentorId } = await params;
    const supabase = await createClient();
    try {
        const mentor = await getMentorById(supabase, mentorId);
        if (!mentor) return generateSeoMetadata({ title: 'Mentor Not Found', description: 'Mentor not found', path: `/appointments/book/${mentorId}/select-date` });

        return generateSeoMetadata({
            title: `Book Session with ${mentor.full_name}`,
            description: `Schedule a 1-on-1 mentorship session with ${mentor.full_name} on SafeSpace.`,
            path: `/appointments/book/${mentorId}/select-date`,
        });
    } catch (e) {
        return generateSeoMetadata({
            title: 'Book Appointment',
            description: 'Book a mentorship session on SafeSpace',
            path: `/appointments/book/${mentorId}/select-date`
        });
    }
}

export default async function SelectDatePage({ params }: { params: Promise<{ mentorId: string }> }) {
    const { mentorId } = await params;
    const supabase = await createClient();
    const mentor = await getMentorById(supabase, mentorId);

    if (!mentor) {
        notFound();
    }

    const serviceSchema = generateServiceSchema(mentor.full_name || 'Mentor', '1-on-1 Mentorship Session');

    return (
        <div className="container max-w-md mx-auto py-6 px-4">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify(serviceSchema).replace(/</g, '\\u003c'),
                }}
            />
            <Suspense fallback={<Loading />}>
                <SelectDateClient mentor={mentor} />
            </Suspense>
        </div>
    );
}
