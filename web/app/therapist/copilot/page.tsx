'use client';

import React, { useState } from 'react';
import { useSessionCopilot } from '@/hooks/use-session-copilot';
import { useAuth } from '@/hooks/use-auth';
import { createClient } from '@/lib/supabase/client';
import { A2UICopilotSidebar } from '@/components/ai/a2ui-copilot-sidebar';
import { LoadingSkeleton } from '@/components/ui/loading-skeleton';
import { ErrorBanner } from '@/components/ui/error-banner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    ChevronLeft,
    BrainCircuit,
    Search,
    User,
    Calendar,
    ArrowRight,
    Bot,
    RefreshCw
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { CalendarManagementPanel } from './_components/CalendarManagementPanel';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function TherapistCopilotPage() {
    const { user } = useAuth();
    const router = useRouter();
    const [appointmentId, setAppointmentId] = useState('');
    const [activeAppointmentId, setActiveAppointmentId] = useState<string | null>(null);

    const { surface, loading, isAnalyzing, refreshAnalysis, error, retry } = useSessionCopilot({
        userId: user?.id || '',
        appointmentId: activeAppointmentId || '',
    });

    const handleStartCopilot = () => {
        if (!appointmentId.trim()) {
            return;
        }
        // Simply set the active appointment ID - the hook will handle initialization
        setActiveAppointmentId(appointmentId.trim());
    };

    if (!activeAppointmentId) {
        return (
            <div className="p-8 max-w-4xl mx-auto space-y-8">
                <div>
                    <h1 className="text-3xl font-black mb-2 flex items-center gap-3">
                        <BrainCircuit className="w-8 h-8 text-primary" />
                        Therapist Copilot
                    </h1>
                    <p className="text-foreground-muted font-medium">
                        AI-powered assistant for session management and calendar scheduling.
                    </p>
                </div>

                <Tabs defaultValue="session" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="session">Session Copilot</TabsTrigger>
                        <TabsTrigger value="calendar">Calendar Management</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="session" className="space-y-4 bg-background-light dark:bg-background-dark p-8 rounded-3xl border-2 border-border shadow-sm">
                        <div className="space-y-2">
                            <label className="text-xs font-black uppercase tracking-widest text-foreground-muted">Appointment ID</label>
                            <div className="flex gap-2">
                                <Input
                                    placeholder="Paste appointment UUID here..."
                                    value={appointmentId}
                                    onChange={(e) => setAppointmentId(e.target.value)}
                                    className="font-bold"
                                />
                                <Button onClick={handleStartCopilot} disabled={!appointmentId.trim()} className="font-black">
                                    Launch
                                </Button>
                            </div>
                        </div>

                        <div className="pt-4 border-t border-border mt-4">
                            <h3 className="text-sm font-black mb-4 flex items-center gap-2">
                                <Calendar className="w-4 h-4 text-primary" />
                                Recent Sessions
                            </h3>
                            {/* Mock recent sessions for now */}
                            <div className="space-y-2">
                                {['Active Session - Patient: John Doe', 'Last Session - Patient: Jane Smith'].map((session, i) => (
                                    <button
                                        key={i}
                                        className="w-full text-left p-4 rounded-2xl hover:bg-slate-50 dark:hover:bg-zinc-900 border border-transparent hover:border-border transition-all flex items-center justify-between group"
                                        onClick={() => {
                                            const mockId = i === 0 ? 'session-123' : 'session-456';
                                            setAppointmentId(mockId);
                                            setActiveAppointmentId(mockId);
                                        }}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-zinc-800 flex items-center justify-center">
                                                <User className="w-5 h-5 opacity-50" />
                                            </div>
                                            <span className="font-bold">{session}</span>
                                        </div>
                                        <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </button>
                                ))}
                            </div>
                        </div>
                    </TabsContent>
                    
                    <TabsContent value="calendar" className="bg-background-light dark:bg-background-dark p-8 rounded-3xl border-2 border-border shadow-sm">
                        <CalendarManagementPanel />
                    </TabsContent>
                </Tabs>
            </div>
        );
    }

    if (loading && !surface) {
        return (
            <div className="p-6 space-y-4">
                <LoadingSkeleton className="h-12 w-1/3" />
                <LoadingSkeleton className="h-[600px] w-full rounded-2xl" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-6">
                <ErrorBanner
                    message={error}
                    onRetry={retry}
                    visible={!!error}
                />
                <Button variant="ghost" className="mt-4 font-bold" onClick={() => setActiveAppointmentId(null)}>
                    <ChevronLeft className="w-4 h-4 mr-2" />
                    Back to selection
                </Button>
            </div>
        );
    }

    return (
        <div className="flex h-[calc(100vh-64px)] overflow-hidden">
            {/* Main Content Area (Simulated Session View) */}
            <div className="flex-1 flex flex-col p-8 bg-slate-50 dark:bg-zinc-950 overflow-y-auto">
                <div className="mb-8 flex items-center justify-between">
                    <Button variant="ghost" size="sm" className="font-bold" onClick={() => setActiveAppointmentId(null)}>
                        <ChevronLeft className="w-4 h-4 mr-2" />
                        Close Copilot
                    </Button>
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2 px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-black uppercase tracking-wider">
                            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                            Live Session
                        </div>
                    </div>
                </div>

                <div className="max-w-4xl mx-auto w-full space-y-8">
                    <div className="bg-background-light dark:bg-background-dark p-12 rounded-[40px] border-2 border-border shadow-xl text-center">
                        <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                            <User className="w-10 h-10 text-primary" />
                        </div>
                        <h2 className="text-3xl font-black mb-2">Ongoing Session</h2>
                        <p className="text-foreground-muted font-bold text-lg">Patient ID: PAT-9421</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-border shadow-sm">
                            <h3 className="font-black mb-4">Real-time Transcript</h3>
                            <div className="space-y-4 opacity-50 italic">
                                <p className="text-sm">"I was feeling quite anxious this week..."</p>
                                <p className="text-sm">"Can you tell me more about that?"</p>
                                <div className="animate-pulse flex gap-2">
                                    <div className="h-2 w-24 bg-slate-200 rounded" />
                                </div>
                            </div>
                        </div>
                        <div className="bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-border shadow-sm">
                            <h3 className="font-black mb-4">Patient History (RAG)</h3>
                            <ul className="space-y-3">
                                <li className="text-sm font-bold flex gap-2">
                                    <div className="w-1 h-4 bg-primary rounded-full" />
                                    History of GAD
                                </li>
                                <li className="text-sm font-bold flex gap-2">
                                    <div className="w-1 h-4 bg-primary rounded-full" />
                                    Progress: Stable (Last 3 weeks)
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>

            {/* Sidebar Copilot */}
            <div className="w-[400px] border-l bg-background-light dark:bg-background-dark flex flex-col shadow-2xl relative z-20">
                <div className="p-4 border-b flex items-center justify-between">
                    <h2 className="font-black flex items-center gap-2 uppercase tracking-widest text-xs">
                        <BrainCircuit className="w-4 h-4 text-primary" />
                        Clinical Intelligence
                    </h2>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={() => refreshAnalysis()}
                        disabled={isAnalyzing}
                    >
                        <RefreshCw className={`w-4 h-4 ${isAnalyzing ? 'animate-spin' : ''}`} />
                    </Button>
                </div>

                <div className="flex-1 overflow-y-auto">
                    {surface ? (
                        <A2UICopilotSidebar
                            appointmentId={activeAppointmentId}
                            userId={user?.id || ''}
                        />
                    ) : (

                        <div className="p-8 flex flex-col items-center justify-center h-full text-center space-y-4">
                            <div className="w-16 h-16 bg-slate-100 dark:bg-zinc-800 rounded-3xl flex items-center justify-center animate-pulse">
                                <Bot className="w-8 h-8 opacity-20" />
                            </div>
                            <div>
                                <h3 className="font-black">Initializing Assistant</h3>
                                <p className="text-xs font-bold text-foreground-muted uppercase tracking-wider mt-1">Analyzing context...</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

