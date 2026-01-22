export const dynamic = 'force-dynamic';

import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { MainNavigation } from '@/components/navigation/main-navigation';
import { Metadata } from 'next';
import { addBreadcrumb, reportError } from '@/lib/rollbar-utils';
import { ErrorBoundary } from '@/components/ui/error-boundary';
import { MessageListener } from '@/components/messaging/message-listener';

export const metadata: Metadata = {
    title: 'SafeSpace - Therapisting, Not Therapy',
    description: 'Dashboard for patients at SafeSpace.',
};

export default async function MainLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const supabase = await createClient();

    try {
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            redirect('/login');
        }

        const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('user_id', user.id)
            .single();

        if (!profile || (profile as any).role !== 'patient') {
            redirect('/login');
        }

        addBreadcrumb('Main layout rendering', 'layout.main', 'info', { userId: user.id });

        return (
            <div className="flex min-h-screen bg-background-light dark:bg-background-dark">
                <MainNavigation />
                <MessageListener />
                <main className="flex-1 flex flex-col md:pl-[280px] pb-24 md:pb-0 min-w-0">
                    <ErrorBoundary context="main_layout">
                        {children}
                    </ErrorBoundary>
                </main>
            </div>
        );
    } catch (error: any) {
        if (error?.message === 'NEXT_REDIRECT' || error?.digest?.startsWith('NEXT_REDIRECT')) {
            throw error;
        }
        reportError(error, 'main_layout.render');
        return (
            <div className="min-h-screen flex items-center justify-center p-6">
                <div className="text-center">
                    <h1 className="text-2xl font-black text-red-600 mb-4 uppercase tracking-widest">System Error</h1>
                    <p className="text-gray-600 dark:text-gray-400 font-bold">Failed to load authenticated context.</p>
                </div>
            </div>
        );
    }
}
