import { createClient, createAdminClient } from '@/lib/supabase/server';
import { getTherapists } from '@/lib/services/therapist-service';
import TherapistsListClient from './_components/therapists-list-client';
import { generateMetadata as generateSeoMetadata } from '@/lib/metadata';
import { addBreadcrumb, reportError } from '@/lib/rollbar-utils';
import { ErrorBoundary } from '@/components/ui/error-boundary';

export const revalidate = 300; // ISR: Revalidate every 5 minutes

export async function generateMetadata() {
    const supabase = createAdminClient();
    const therapists = await getTherapists(supabase);
    const count = therapists.length;

    return generateSeoMetadata({
        title: `Find your Therapist (${count}+ Available) - SafeSpace`,
        description: `Browse ${count}+ verified therapists specializing in designated areas. Connect today for mental health support.`,
        path: '/therapists',
    });
}

export default async function TherapistsPage() {
    const supabase = createAdminClient();

    try {
        const therapists = await getTherapists(supabase);

        addBreadcrumb('Therapists page loaded', 'page.therapists', 'info', { count: therapists.length });

        const itemListSchema = {
            '@context': 'https://schema.org',
            '@type': 'ItemList',
            itemListElement: therapists.map((therapist, index) => ({
                '@type': 'ListItem',
                position: index + 1,
                item: {
                    '@type': 'Person',
                    name: therapist.full_name,
                    image: therapist.avatar_url,
                    description: therapist.bio,
                    url: `${process.env.NEXT_PUBLIC_SITE_URL}/therapists/${therapist.user_id}`
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
                <ErrorBoundary context="therapists_page">
                    <TherapistsListClient initialTherapists={therapists} />
                </ErrorBoundary>
            </div>
        );
    } catch (error: any) {
        if (error?.message === 'NEXT_REDIRECT' || error?.digest?.startsWith('NEXT_REDIRECT')) {
            throw error;
        }
        reportError(error, 'therapists_page.server_fetch');
        throw error;
    }
}
