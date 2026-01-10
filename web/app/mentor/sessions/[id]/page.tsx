export const dynamic = 'force-dynamic';

import { redirect } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { Button } from '@/components/ui/button';
import { Mic, FileText, Calendar, Clock, Video, FileEdit } from 'lucide-react';
import { formatDate, formatTime } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

interface SessionDetailPageProps {
    params: Promise<{
        id: string;
    }>;
}

export default async function SessionDetailPage({ params }: SessionDetailPageProps) {
    const { id } = await params;
    const supabase = await createClient(); // Await createClient which is async in next.js (or sometimes sync depending on version, assuming latest is async for server actions/components safe)
    // Actually standard server component usage: const supabase = createClient(); if using some boilerplates, but standard is cookies() access which needs await in some versions.
    // The previous code had `const supabase = createClient();` (sync). I'll stick to that if it works, but adding 'await' is safer for newer Next versions if `createClient` uses `cookies()`.
    // Let's assume sync for now based on original file, but use `await` for calls.

    // 1. Verify User
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        redirect('/login');
    }

    // 2. Fetch Appointment Details
    // 2. Fetch Appointment Details
    const { data: appointmentResult, error } = await supabase
        .from('appointments' as any)
        .select(`
            *,
            patient:profiles!patient_id(*),
            therapist:profiles!therapist_id(*)
        `)
        .eq('id', id)
        .single();

    const appointment = appointmentResult as any;

    if (error || !appointment) {
        redirect('/therapist/dashboard');
    }

    // Verify Access
    if (appointment.therapist_id !== user.id) {
        redirect('/therapist/dashboard');
    }

    // 3. Fetch Recording Status
    const { data: recordingResult } = await supabase
        .from('session_recordings' as any)
        .select('*')
        .eq('appointment_id', id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

    const recording = recordingResult as any;

    const isCompleted = recording?.recording_status === 'completed';
    const isProcessing = recording?.recording_status === 'processing';

    // 4. Fetch SOAP Note Status
    const { data: soapNoteResult } = await supabase
        .from('soap_notes' as any)
        .select('id, is_finalized')
        .eq('appointment_id', id)
        .maybeSingle();
    const soapNote = soapNoteResult as any;

    return (
        <div className="min-h-screen bg-background-light dark:bg-[#0e181b] p-6 lg:p-12">
            <div className="max-w-4xl mx-auto space-y-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Session Details</h1>
                        <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                            <Badge variant="secondary" className="uppercase tracking-wider">
                                {appointment.status}
                            </Badge>
                            <span>•</span>
                            <span>{formatDate(appointment.start_time)}</span>
                        </div>
                    </div>
                    <Link href="/therapist/dashboard">
                        <Button variant="outline">Back to Dashboard</Button>
                    </Link>
                </div>

                {/* Session Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Patient Card */}
                    <div className="bg-white dark:bg-[#121f24] p-6 rounded-2xl border border-slate-100 dark:border-white/5 shadow-sm">
                        <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                            Patient
                        </h2>
                        <div className="flex items-center gap-4">
                            <Avatar className="h-16 w-16">
                                <AvatarImage src={appointment.patient?.avatar_url || ''} />
                                <AvatarFallback>{appointment.patient?.full_name?.[0] || 'P'}</AvatarFallback>
                            </Avatar>
                            <div>
                                <h3 className="text-xl font-bold text-slate-900 dark:text-white">{appointment.patient?.full_name || 'Patient'}</h3>
                                <p className="text-slate-500 dark:text-slate-400 text-sm">Patient ID: {appointment.patient_id ? appointment.patient_id.slice(0, 8) : 'N/A'}</p>
                            </div>
                        </div>
                    </div>

                    {/* Time & Action */}
                    <div className="bg-white dark:bg-[#121f24] p-6 rounded-2xl border border-slate-100 dark:border-white/5 shadow-sm flex flex-col justify-center">
                        <div className="flex items-center gap-3 mb-2">
                            <Calendar className="w-5 h-5 text-[#30bae8]" />
                            <span className="text-slate-900 dark:text-white font-medium">{formatDate(appointment.start_time)}</span>
                        </div>
                        <div className="flex items-center gap-3 mb-6">
                            <Clock className="w-5 h-5 text-[#30bae8]" />
                            <span className="text-slate-900 dark:text-white font-medium">
                                {formatTime(appointment.start_time)} - {formatTime(appointment.end_time)}
                            </span>
                        </div>

                        <div className="flex gap-3">
                            {appointment.status === 'confirmed' && (
                                <Link href={`/video/${appointment.id}/waiting`} className="flex-1">
                                    <Button className="w-full" leftIcon={<Video className="w-4 h-4" />}>
                                        Join Video Call
                                    </Button>
                                </Link>
                            )}
                        </div>
                    </div>
                </div>

                {/* AI Tools Section */}
                <div className="space-y-4">
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">AI Clinical Tools</h2>

                    <div className="bg-gradient-to-br from-[#30bae8]/10 to-transparent p-6 rounded-3xl border border-[#30bae8]/20 relative overflow-hidden">
                        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                            <div className="space-y-2 max-w-lg">
                                <div className="flex items-center gap-2">
                                    <div className="p-2 bg-[#30bae8] rounded-lg">
                                        <Mic className="w-5 h-5 text-white" />
                                    </div>
                                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">Session Recording & Documentation</h3>
                                </div>
                                <p className="text-slate-600 dark:text-slate-300">
                                    Record your session to automatically generate transcripts and AI-powered SOAP notes.
                                </p>
                            </div>

                            <div className="flex flex-col gap-3 min-w-[200px] w-full md:w-auto">
                                {recording ? (
                                    <>
                                        {isProcessing && (
                                            <div className="bg-yellow-500/10 text-yellow-500 px-4 py-2 rounded-xl text-center font-medium text-sm border border-yellow-500/20">
                                                Processing Recording...
                                            </div>
                                        )}
                                        {isCompleted && (
                                            <div className="flex flex-col gap-2">
                                                <div className="flex gap-2">
                                                    <Link href={`/therapist/sessions/${appointment.id}/transcript`} className="flex-1">
                                                        <Button variant="secondary" className="w-full" leftIcon={<FileText className="w-4 h-4" />}>
                                                            Transcript
                                                        </Button>
                                                    </Link>
                                                    <Link href={`/therapist/sessions/${appointment.id}/soap`} className="flex-1">
                                                        <Button
                                                            variant="primary"
                                                            className="w-full"
                                                            leftIcon={<FileEdit className="w-4 h-4" />}
                                                        >
                                                            {soapNote ? (soapNote.is_finalized ? 'View Note' : 'Edit Note') : 'Create Note'}
                                                        </Button>
                                                    </Link>
                                                </div>
                                            </div>
                                        )}
                                        <Link href={`/therapist/sessions/${appointment.id}/record`}>
                                            <Button variant="outline" className="w-full">
                                                {isCompleted ? 'Re-record Session' : 'Continue Recording'}
                                            </Button>
                                        </Link>
                                    </>
                                ) : (
                                    <Link href={`/therapist/sessions/${appointment.id}/record`}>
                                        <Button className="w-full shadow-lg shadow-[#30bae8]/20" leftIcon={<Mic className="w-4 h-4" />}>
                                            Start Recording
                                        </Button>
                                    </Link>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
