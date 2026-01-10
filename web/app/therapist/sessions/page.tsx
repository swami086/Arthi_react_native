export const dynamic = 'force-dynamic';

import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Calendar, Clock, Video } from 'lucide-react';
import { formatDate, formatTime } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

export const metadata = {
    title: 'My Sessions | SafeSpace Therapist',
    description: 'View your upcoming and past therapisting sessions.'
};

export default async function TherapistSessionsPage() {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect('/login');

    // Fetch details to ensure role is therapist? Assuming middleware or layout already did.

    const { data: appointments } = await supabase
        .from('appointments' as any)
        .select(`
            *,
            patient:profiles!patient_id(*)
        `)
        .eq('therapist_id', user.id)
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

function SessionCard({ session, isUpcoming }: { session: any, isUpcoming?: boolean }) {
    const patient = session.patient;

    return (
        <Link href={`/therapist/sessions/${session.id}`}>
            <Card className="hover:border-[#30bae8]/50 transition-colors cursor-pointer dark:bg-[#121f24] dark:border-white/5">
                <CardContent className="p-6 flex flex-col md:flex-row gap-6 items-center">
                    <div className="flex items-center gap-4 flex-1">
                        <Avatar className="h-12 w-12">
                            <AvatarImage src={patient?.avatar_url} />
                            <AvatarFallback>{patient?.full_name?.[0]}</AvatarFallback>
                        </Avatar>
                        <div>
                            <h3 className="font-semibold text-slate-900 dark:text-white">{patient?.full_name || 'Patient'}</h3>
                            <p className="text-sm text-slate-500">{session.type || 'Therapy Session'}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-6 flex-1 justify-end">
                        <div className="flex flex-col items-end gap-1">
                            <div className="flex items-center gap-2 text-slate-900 dark:text-white font-medium">
                                <Calendar className="w-4 h-4 text-[#30bae8]" />
                                {formatDate(session.start_time)}
                            </div>
                            <div className="flex items-center gap-2 text-slate-500 text-sm">
                                <Clock className="w-4 h-4" />
                                {formatTime(session.start_time)} - {formatTime(session.end_time)}
                            </div>
                        </div>

                        <Badge variant={isUpcoming ? "default" : "secondary"} className={isUpcoming ? "bg-[#30bae8] hover:bg-[#30bae8]/90" : ""}>
                            {session.status}
                        </Badge>

                        {isUpcoming && session.status === 'confirmed' && (
                            <Button size="sm" className="hidden md:flex ml-4" onClick={(e) => {
                                e.preventDefault(); // prevent card click
                                // Usually navigate to waiting room
                                window.location.href = `/video/${session.id}/waiting`;
                            }}>
                                <Video className="w-4 h-4 mr-2" />
                                Join
                            </Button>
                        )}
                    </div>
                </CardContent>
            </Card>
        </Link>
    );
}
