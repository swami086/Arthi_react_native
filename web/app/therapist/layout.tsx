import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { TherapistSidebar } from './_components/TherapistSidebar'; // Commented out for debugging
import { MessageListener } from '@/components/messaging/message-listener';

export default async function TherapistLayout({
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

    // Verify therapist role
    const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

    if (error) {
        console.error('Error fetching profile:', error);
        // We will NOT redirect just yet to see if this is the cause, just render a debug error
        return (
            <div className="p-10 text-red-500">
                <h1>Error Loading Profile</h1>
                <pre>{JSON.stringify(error, null, 2)}</pre>
            </div>
        );
    }

    if (profile?.role !== 'therapist') {
        // redirect('/unauthorized'); 
        return (
            <div className="p-10 text-orange-500">
                <h1>Unauthorized: Role is {profile?.role}</h1>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen bg-background-light dark:bg-background-dark">
            <TherapistSidebar userName={profile?.full_name} userEmail={profile?.email} />

            <MessageListener />

            <main className="flex-1 overflow-y-auto h-screen ml-0 transition-all duration-300">
                <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6 md:space-y-8 pb-20 md:pb-8">
                    {children}
                </div>
            </main>
        </div>
    );
}
