'use client';

import React from 'react';
import { useBookingAgent } from '@/hooks/use-booking-agent';
import { useAuth } from '@/hooks/use-auth';
import { A2UIBookingInterface } from '@/components/ai/a2ui-booking-interface';
import { LoadingSkeleton } from '@/components/ui/loading-skeleton';
import { ErrorBanner } from '@/components/ui/error-banner';
import { Button } from '@/components/ui/button';
import { ChevronLeft, Bot } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function BookingAgentPage() {
    const { user } = useAuth();
    const router = useRouter();



    return (
        <div className="flex flex-col h-[calc(100vh-64px)] overflow-hidden">
            <div className="p-4 border-b bg-background-light dark:bg-background-dark flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => router.back()}>
                        <ChevronLeft className="w-5 h-5" />
                    </Button>
                    <div>
                        <h1 className="text-xl font-black flex items-center gap-2">
                            <Bot className="w-5 h-5 text-primary" />
                            Booking Assistant
                        </h1>
                        <p className="text-xs font-bold text-foreground-muted uppercase tracking-wider">
                            Real-time AI Scheduling
                        </p>
                    </div>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 md:p-8 bg-slate-50 dark:bg-zinc-950">
                <div className="max-w-4xl mx-auto h-full">
                    {user?.id ? (
                        <A2UIBookingInterface
                            userId={user.id}
                        />
                    ) : (
                        <div className="flex items-center justify-center h-full">
                            <p className="text-foreground-muted font-bold">Initializing assistant...</p>
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
}
