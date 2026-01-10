import { createClient, createAdminClient } from '@/lib/supabase/server';
import { getMentorById, getMentorReviews, getMentorAvailability, getMentors } from '@/lib/services/mentor-service';
import MentorDetailClient from './_components/mentor-detail-client';
import { Metadata } from 'next';
import { addBreadcrumb, reportError } from '@/lib/rollbar-utils';
import { ErrorBoundary } from '@/components/ui/error-boundary';
import { notFound } from 'next/navigation';

import { generateMetadata as generateSeoMetadata } from '@/lib/metadata';
import { generateMentorSchema } from '@/lib/schemas';

export const revalidate = 300; // ISR

export async function generateStaticParams() {
    const supabase = createAdminClient();
    try {
        const mentors = await getMentors(supabase);
        return mentors.map((mentor) => ({
            id: mentor.user_id,
        }));
    } catch (error) {
        console.error('Error generating static params for mentors:', error);
        return [];
    }
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
    const { id } = await params;
    const supabase = createAdminClient();
    try {
        const mentor = await getMentorById(supabase, id);
        if (!mentor) {
            return generateSeoMetadata({
                title: 'Mentor Not Found',
                description: 'The requested mentor profile could not be found.',
                path: `/mentors/${id}`,
            });
        }
        return generateSeoMetadata({
            title: `${mentor.full_name} - ${mentor.specialization || 'Mentor'}`,
            description: mentor.bio ? mentor.bio.slice(0, 160) : `Connect with ${mentor.full_name} on SafeSpace.`,
            path: `/mentors/${id}`,
            image: mentor.avatar_url || undefined,
        });
    } catch (error) {
        return generateSeoMetadata({
            title: 'Mentor Profile',
            description: 'View mentor profile on SafeSpace.',
            path: `/mentors/${id}`,
        });
    }
}

export default async function MentorDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const supabase = await createClient();

    try {
        addBreadcrumb('Mentor detail page loaded', 'page.mentor_detail', 'info', { mentorId: id });

        const [mentor, reviews, availability] = await Promise.all([
            getMentorById(supabase, id),
            getMentorReviews(supabase, id),
            getMentorAvailability(supabase, id)
        ]);

        if (!mentor) {
            notFound();
        }

        // Generate Schema using utility
        const schema = generateMentorSchema({
            ...mentor,
            avg_rating: mentor.rating_average || undefined,
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
                <ErrorBoundary context={`mentor_detail_${id}`}>
                    <MentorDetailClient
                        mentor={mentor}
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
        reportError(error, 'mentor_detail.server_fetch');
        throw error;
    }
}
