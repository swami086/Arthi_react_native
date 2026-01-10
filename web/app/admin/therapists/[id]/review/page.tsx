export const dynamic = 'force-dynamic';

import { adminService } from '@/lib/services/admin-service';
import { createClient } from '@/lib/supabase/server';
import TherapistReviewClient from './_components/therapist-review-client';
import { notFound } from 'next/navigation';

interface PageProps {
    params: Promise<{ id: string }>;
}

export default async function TherapistReviewPage({ params }: PageProps) {
    const { id } = await params;
    const supabase = await createClient();

    try {
        const therapist = await adminService.getTherapistDetails(supabase, id);
        if (!therapist) notFound();

        return (
            <TherapistReviewClient therapist={therapist} />
        );
    } catch (error) {
        // This will be handled by the parent error boundary
        throw error;
    }
}
