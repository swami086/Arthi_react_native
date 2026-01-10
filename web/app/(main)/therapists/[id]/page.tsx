import { createClient, createAdminClient } from '@/lib/supabase/server';
import { getTherapistById, getTherapistReviews, getTherapistAvailability, getTherapists } from '@/lib/services/therapist-service';
import TherapistDetailClient from './_components/therapist-detail-client';
import { Metadata } from 'next';
import { addBreadcrumb, reportError } from '@/lib/rollbar-utils';
import { ErrorBoundary } from '@/components/ui/error-boundary';
import { notFound } from 'next/navigation';

import { generateMetadata as generateSeoMetadata } from '@/lib/metadata';
import { generateTherapistSchema } from '@/lib/schemas';

export const revalidate = 300; // ISR

export async function generateStaticParams() {
    const supabase = createAdminClient();
    try {
        const therapists = await getTherapists(supabase);
        return therapists.map((therapist) => ({
            id: therapist.user_id,
        }));
    } catch (error) {
        console.error('Error generating static params for therapists:', error);
        return [];
    }
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
    const { id } = await params;
    const supabase = createAdminClient();
    try {
        const therapist = await getTherapistById(supabase, id);
        if (!therapist) {
            return generateSeoMetadata({
                title: 'Therapist Not Found',
                description: 'The requested therapist profile could not be found.',
                path: `/therapists/${id}`,
            });
        }
        return generateSeoMetadata({
            title: `${therapist.full_name} - ${therapist.specialization || 'Therapist'}`,
            description: therapist.bio ? therapist.bio.slice(0, 160) : `Connect with ${therapist.full_name} on SafeSpace.`,
            path: `/therapists/${id}`,
            image: therapist.avatar_url || undefined,
        });
    } catch (error) {
        return generateSeoMetadata({
            title: 'Therapist Profile',
            description: 'View therapist profile on SafeSpace.',
            path: `/therapists/${id}`,
        });
    }
}

export default async function TherapistDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const supabase = await createClient();

    try {
        addBreadcrumb('Therapist detail page loaded', 'page.therapist_detail', 'info', { therapistId: id });

        const [therapist, reviews, availability] = await Promise.all([
            getTherapistById(supabase, id),
            getTherapistReviews(supabase, id),
            getTherapistAvailability(supabase, id)
        ]);

        if (!therapist) {
            notFound();
        }

        // Generate Schema using utility
        const schema = generateTherapistSchema({
            ...therapist,
            avg_rating: therapist.rating_average || undefined,
            total_reviews: reviews?.length || 0
        });

        return (
            <>
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{
                        __html: JSON.stringify(schema).replace(/</g, '\\u003c'),
                    }}
                />
                <ErrorBoundary context={`therapist_detail_${id}`}>
                    <TherapistDetailClient
                        therapist={therapist}
                        reviews={reviews}
                        availability={availability}
                    />
                </ErrorBoundary>
            </>
        );

    } catch (error) {
        // If it's a 404 from our service logic or not found check
        if ((error as any)?.message?.includes('JSON object requested, multiple (or no) rows returned')) {
            notFound();
        }
        reportError(error, 'therapist_detail.server_fetch');
        throw error;
    }
}
