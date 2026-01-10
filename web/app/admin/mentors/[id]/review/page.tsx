export const dynamic = 'force-dynamic';

import { adminService } from '@/lib/services/admin-service';
import { createClient } from '@/lib/supabase/server';
import MentorReviewClient from './_components/mentor-review-client';
import { notFound } from 'next/navigation';

interface PageProps {
    params: Promise<{ id: string }>;
}

export default async function MentorReviewPage({ params }: PageProps) {
    const { id } = await params;
    const supabase = await createClient();

    try {
        const mentor = await adminService.getMentorDetails(supabase, id);
        if (!mentor) notFound();

        return (
            <MentorReviewClient mentor={mentor} />
        );
    } catch (error) {
        // This will be handled by the parent error boundary
        throw error;
    }
}
