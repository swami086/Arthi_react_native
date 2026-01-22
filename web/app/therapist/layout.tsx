export const dynamic = 'force-dynamic';

import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { TherapistSidebar } from './_components/TherapistSidebar';
import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { RollbarProvider } from '@/components/providers/rollbar-provider';
import { MessageListener } from '@/components/messaging/message-listener';

export default async function TherapistLayout({
    children,
}: {
    children: React.ReactNode; // Triggers HMR
}) {
    const supabase = await createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        redirect('/login');
    }

    // Verify therapist role (basic check, middleware should also handle)
    const { data: profile, error: profileError } = await (supabase
        .from('profiles') as any)
        .select('role, full_name')
        .eq('user_id', user.id)
        .single();

    console.log('[TherapistLayout] User:', user?.id, 'Profile Role:', profile?.role, 'Error:', profileError);

    if (profile?.role !== 'therapist') {
        console.warn('[TherapistLayout] Non-therapist user redirected:', user?.id);
        redirect('/unauthorized');
    }

    return (
        <RollbarProvider>
            <div className="flex h-screen bg-gray-50 dark:bg-black overflow-hidden">
                <TherapistSidebar
                    userEmail={user.email}
                    userName={profile.full_name || 'Therapist'}
                />
                <MessageListener />

                <div className="flex-1 flex flex-col overflow-hidden">
                    {/* Header with Crisis Resource */}
                    <header className="h-16 border-b bg-white dark:bg-gray-950 dark:border-gray-800 flex items-center justify-between px-8 shadow-sm z-10">
                        <h1 className="text-xl font-semibold text-gray-800 dark:text-gray-100">
                            Workplace
                        </h1>
                        <Link href="/resources/crisis">
                            <Button
                                variant="error"
                                size="sm"
                                className="gap-2 bg-red-600 hover:bg-red-700 text-white shadow-red-200"
                            >
                                <AlertTriangle className="h-4 w-4" />
                                Crisis Resources
                            </Button>
                        </Link>
                    </header>

                    <main className="flex-1 overflow-y-auto bg-gray-50 dark:bg-[#09090b] p-8">
                        {children}
                    </main>
                </div>
            </div>
        </RollbarProvider>
    );
}
