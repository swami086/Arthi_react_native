import { createClient, createAdminClient } from '@/lib/supabase/server';
import { getMentors } from '@/lib/services/mentor-service';
import MentorsListClient from './_components/mentors-list-client';
import { generateMetadata as generateSeoMetadata } from '@/lib/metadata';
import { addBreadcrumb, reportError } from '@/lib/rollbar-utils';
import { ErrorBoundary } from '@/components/ui/error-boundary';

export const revalidate = 300; // ISR: Revalidate every 5 minutes

export async function generateMetadata() {
    const supabase = createAdminClient();
    const mentors = await getMentors(supabase);
    const count = mentors.length;

    return generateSeoMetadata({
        title: `Find your Mentor (${count}+ Available) - SafeSpace`,
        description: `Browse ${count}+ verified mentors specializing in designated areas. Connect today for mental health support.`,
        path: '/mentors',
    });
}

export default async function MentorsPage() {
    const supabase = createAdminClient();

    try {
        const mentors = await getMentors(supabase);

        addBreadcrumb('Mentors page loaded', 'page.mentors', 'info', { count: mentors.length });

        const itemListSchema = {
            '@context': 'https://schema.org',
            '@type': 'ItemList',
            itemListElement: mentors.map((mentor, index) => ({
                '@type': 'ListItem',
                position: index + 1,
                item: {
                    '@type': 'Person',
                    name: mentor.full_name,
                    image: mentor.avatar_url,
                    description: mentor.bio,
                    url: `${process.env.NEXT_PUBLIC_SITE_URL}/mentors/${mentor.user_id}`
                }
            }))
        };

        return (
            <div className="max-w-7xl mx-auto px-6 py-8">
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{
                        __html: JSON.stringify(itemListSchema).replace(/</g, '\\u003c'),
                    }}
                />
                <ErrorBoundary context="mentors_page">
                    <MentorsListClient initialMentors={mentors} />
                </ErrorBoundary>
            </div>
        );
    } catch (error) {
        reportError(error, 'mentors_page.server_fetch');
        throw error;
    }
}
