export const dynamic = 'force-dynamic';

import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { SessionCard } from './_components/SessionCard';

export const metadata = {
    title: 'My Sessions | SafeSpace Therapist',
    description: 'View your upcoming and past therapisting sessions.'
};

export default async function TherapistSessionsPage() {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect('/login');

    // Fetch details to ensure role is therapist? Assuming middleware or layout already did.

    const { data: profile } = await supabase
        .from('profiles')
        .select('practice_id')
        .eq('user_id', user.id)
        .single();

    const { data: appointments } = await supabase
        .from('appointments' as any)
        .select(`
            *,
            patient:profiles!patient_id(*)
        `)
        .eq('therapist_id', user.id)
        .eq('practice_id', profile?.practice_id)
        .order('start_time', { ascending: true });

    const upcoming = appointments?.filter((a: any) => new Date(a.start_time) > new Date()) || [];
    const past = appointments?.filter((a: any) => new Date(a.start_time) <= new Date()) || [];

    return (
        <div className="space-y-8 max-w-5xl mx-auto">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">My Sessions</h1>
                    <p className="text-slate-500 dark:text-slate-400">Manage your upcoming appointments and history.</p>
                </div>
                {/* Maybe a 'Schedule New' button if therapists initiate? Usually patients book. */}
            </div>

            <div className="space-y-6">
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Upcoming Sessions</h2>
                {upcoming.length === 0 ? (
                    <Card className="bg-slate-50 dark:bg-slate-800/50 border-dashed">
                        <CardContent className="flex flex-col items-center justify-center p-12 text-slate-500">
                            <Calendar className="w-10 h-10 mb-4 opacity-50" />
                            <p>No upcoming sessions scheduled.</p>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid gap-4">
                        {upcoming.map((session: any) => (
                            <SessionCard key={session.id} session={session} isUpcoming />
                        ))}
                    </div>
                )}
            </div>

            <div className="space-y-6">
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Past Sessions</h2>
                {past.length === 0 ? (
                    <p className="text-slate-500">No session history yet.</p>
                ) : (
                    <div className="grid gap-4">
                        {past.map((session: any) => (
                            <SessionCard key={session.id} session={session} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

