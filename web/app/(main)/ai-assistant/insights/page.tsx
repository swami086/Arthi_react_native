'use client';

import React from 'react';
import { useInsightsAgent } from '@/hooks/use-insights-agent';
import { useAuth } from '@/hooks/use-auth';
import { A2UIInsightsDashboard } from '@/components/ai/a2ui-insights-dashboard';
import { LoadingSkeleton } from '@/components/ui/loading-skeleton';
import { ErrorBanner } from '@/components/ui/error-banner';
import { Button } from '@/components/ui/button';
import { ChevronLeft, BarChart3, RefreshCw } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function InsightsAgentPage() {
    const { user } = useAuth();
    const router = useRouter();

    return (
        <div className="flex flex-col min-h-screen">
            <div className="p-4 border-b bg-background-light dark:bg-background-dark flex items-center justify-between sticky top-0 z-10">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => router.back()}>
                        <ChevronLeft className="w-5 h-5" />
                    </Button>
                    <div>
                        <h1 className="text-xl font-black flex items-center gap-2">
                            <BarChart3 className="w-5 h-5 text-purple-600" />
                            Insights Dashboard
                        </h1>
                        <p className="text-xs font-bold text-foreground-muted uppercase tracking-wider">
                            Progress Analytics & Patterns
                        </p>
                    </div>
                </div>
            </div>


            <div className="flex-1 p-4 md:p-8 bg-slate-50 dark:bg-zinc-950">
                <div className="max-w-6xl mx-auto h-full">
                    {user?.id ? (
                        <A2UIInsightsDashboard
                            userId={user.id}
                        />
                    ) : (

                        <div className="flex flex-col items-center justify-center p-12 bg-background-light dark:bg-background-dark rounded-3xl border-2 border-dashed border-border shadow-sm">
                            <BarChart3 className="w-12 h-12 text-foreground-muted mb-4 opacity-20" />
                            <p className="text-foreground-muted font-bold text-lg mb-2">No Insights Available Yet</p>
                            <p className="text-foreground-muted font-medium text-center max-w-sm mb-6">
                                Start your journey by booking your first session. Our AI will analyze your sessions to provide personal insights.
                            </p>
                            <Button onClick={() => router.push('/ai-assistant/booking')} className="font-black">
                                Book Calibration Session
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
