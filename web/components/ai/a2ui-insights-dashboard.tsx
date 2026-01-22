'use client';

import React from 'react';
import { useInsightsAgent } from '@/hooks/use-insights-agent';
import { A2UIRenderer } from '@/lib/a2ui/renderer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Sparkles, TrendingUp, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface A2UIInsightsDashboardProps {
    userId: string;
}

export function A2UIInsightsDashboard({ userId }: A2UIInsightsDashboardProps) {
    const {
        surface,
        loading,
        isAnalyzing,
        refreshInsights,
        sendAction,
        error
    } = useInsightsAgent({ userId });

    if (loading && !surface) {
        return (
            <div className="flex h-64 items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="w-full space-y-6">
            <div className="flex justify-end">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={refreshInsights}
                    disabled={isAnalyzing}
                    className="font-black gap-2"
                >
                    <RefreshCw className={`w-4 h-4 ${isAnalyzing ? 'animate-spin' : ''}`} />
                    Refresh Analysis
                </Button>
            </div>

            <AnimatePresence mode="wait">
                {!surface ? (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                    >
                        <Card className="border-dashed border-2 bg-slate-50/50 dark:bg-slate-900/10 rounded-[32px]">
                            <CardHeader className="text-center">
                                <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                                    <TrendingUp className="h-6 w-6 text-primary" />
                                </div>
                                <CardTitle className="font-black text-2xl">AI Progress Insights</CardTitle>
                                <CardDescription className="font-medium text-foreground-muted">
                                    Get a data-driven view of your therapy journey.
                                    Our AI analyzes your moods and sessions to find hidden patterns.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="flex justify-center pb-8">
                                <Button
                                    onClick={refreshInsights}
                                    disabled={isAnalyzing}
                                    size="lg"
                                    className="rounded-full px-8 font-black"
                                >
                                    {isAnalyzing ? (
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    ) : (
                                        <Sparkles className="mr-2 h-4 w-4" />
                                    )}
                                    Generate My Insights
                                </Button>
                            </CardContent>
                        </Card>
                    </motion.div>
                ) : (
                    <motion.div
                        key={surface.surfaceId}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="space-y-4"
                    >
                        <A2UIRenderer
                            surface={surface}
                            onAction={(action) => sendAction({
                                ...action,
                                surfaceId: surface.surfaceId
                            })}
                            className="a2ui-surface-root"
                        />
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
