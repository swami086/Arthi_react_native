export const dynamic = 'force-dynamic';

import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { AdminSidebar } from '@/components/admin/admin-sidebar';
import { RollbarProvider } from '@/components/providers/rollbar-provider';
import { RollbarUserContext } from './_components/rollbar-user-context';
import { generateNoIndexMetadata } from '@/lib/metadata';

export const metadata = generateNoIndexMetadata();

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const supabase = await createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        redirect('/login');
    }

    // Verify admin role
    const { data: profile } = await (supabase
        .from('profiles') as any)
        .select('role, full_name, is_super_admin')
        .eq('user_id', user.id)
        .single();

    if (profile?.role !== 'admin') {
        redirect('/unauthorized');
    }

    return (
        <RollbarProvider>
            <RollbarUserContext
                user={{
                    id: user.id,
                    email: user.email,
                    full_name: profile.full_name,
                    is_super_admin: profile.is_super_admin
                }}
            />
            <div className="flex h-screen bg-gray-50 dark:bg-black overflow-hidden">
                <AdminSidebar
                    userEmail={user.email}
                    userName={profile.full_name || 'Admin'}
                    isSuperAdmin={profile.is_super_admin}
                />

                <div className="flex-1 flex flex-col overflow-hidden">
                    {/* Admin Specific Header can go here if needed, or share same structure as therapist */}
                    <header className="h-20 border-b bg-white dark:bg-gray-950 dark:border-gray-800 flex items-center justify-between px-8 shadow-sm z-10 lg:static fixed w-full top-0 left-0 hidden lg:flex">
                        <div className="flex flex-col">
                            <h1 className="text-xl font-black text-gray-900 dark:text-gray-100 flex items-center gap-2">
                                Admin Control Center
                                <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                            </h1>
                            <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">SafeSpace Central</p>
                        </div>
                    </header>

                    <main className="flex-1 overflow-y-auto bg-gray-50 dark:bg-[#09090b] p-6 lg:p-8 mt-16 lg:mt-0">
                        {children}
                    </main>
                </div>
            </div>
        </RollbarProvider>
    );
}

