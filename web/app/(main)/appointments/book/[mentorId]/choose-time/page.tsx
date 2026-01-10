export const dynamic = 'force-dynamic';

import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getMentorById } from '@/lib/services/mentor-service';
import ChooseTimeClient from './_components/choose-time-client';
import { generateServiceSchema } from '@/lib/schemas';

// Next.js 15 recommendation: params and searchParams are Promises
type Props = {
    params: Promise<{ mentorId: string }>;
    searchParams: Promise<{ date?: string; time?: string; endTime?: string }>;
};

export default async function ChooseTimePage({ params, searchParams }: Props) {
    const { mentorId } = await params;
    const { date, time, endTime } = await searchParams;

    const supabase = await createClient();
    const mentor = await getMentorById(supabase, mentorId);

    if (!mentor) {
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

    const serviceSchema = generateServiceSchema(mentor.full_name || 'Mentor', '1-on-1 Mentorship Session');

    // Pass resolved params to client
    return (
        <div className="container max-w-md mx-auto py-6 px-4">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }}
            />
            <ChooseTimeClient
                mentor={mentor}
                dateStr={date}
                initialTime={time}
                initialEndTime={endTime}
            />
        </div>
    );
}
