'use client';

import React, { useState, useEffect } from 'react';
import { useA2UI } from '@/hooks/use-a2ui';
import { A2UIRenderer } from '@/lib/a2ui/renderer';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Calendar, Sparkles, MessageCircle } from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

interface A2UIBookingInterfaceProps {
    userId: string;
    initialSpecialization?: string;
    therapistId?: string;
}

export function A2UIBookingInterface({ userId, initialSpecialization, therapistId }: A2UIBookingInterfaceProps) {
    const supabase = createClient();
    const [initializing, setInitializing] = useState(false);
    const [currentSurfaceId, setCurrentSurfaceId] = useState<string | null>(null);

    const { surfaces, loading, error, sendAction, connected } = useA2UI({
        userId,
        agentId: 'booking-agent',
        surfaceId: currentSurfaceId || undefined,
    });

    // Get the most recent surface
    const activeSurface = Array.from(surfaces.values())
        .sort((a, b) => new Date(b.updatedAt || 0).getTime() - new Date(a.updatedAt || 0).getTime())[0];

    const handleStartBooking = async () => {
        try {
            setInitializing(true);

            // Directly invoke booking-agent-init
            const { data, error } = await supabase.functions.invoke('booking-agent-init', {
                body: {
                    specialization: initialSpecialization,
                    therapistId: therapistId
                }
            });

            if (error) throw error;

            if (data.surfaceId) {
                setCurrentSurfaceId(data.surfaceId);
                toast.success("Booking agent initialized");
            } else {
                toast.success("Agent connected");
            }

        } catch (err: any) {
            console.error("Failed to init booking agent:", err);
            toast.error("Failed to start booking assistant");
        } finally {
            setInitializing(false);
        }
    };

    const handleAction = async (action: any) => {
        try {
            // Directly invoke booking-agent for actions
            const { data, error } = await supabase.functions.invoke('booking-agent', {
                body: {
                    action: action.actionId,
                    surfaceId: action.surfaceId,
                    payload: action.payload,
                    metadata: action.metadata
                }
            });

            if (error) throw error;

            if (data.textResponse) {
                toast(data.textResponse, {
                    icon: <MessageCircle className="h-4 w-4 text-primary" />
                });
            }
        } catch (err: any) {
            console.error("Action error:", err);
            toast.error("Failed to process action");
        }
    };

    if (loading && !activeSurface) {
        return (
            <div className="flex h-64 items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="w-full max-w-4xl mx-auto space-y-6">
            <AnimatePresence mode="wait">
                {!activeSurface ? (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                    >
                        <Card className="border-none bg-white/40 dark:bg-slate-900/40 backdrop-blur-xl shadow-2xl ring-1 ring-white/20 dark:ring-white/10 relative overflow-hidden">
                            <CardHeader className="text-center relative z-10">
                                <div className="mx-auto w-16 h-16 bg-gradient-to-tr from-primary to-indigo-500 rounded-2xl flex items-center justify-center mb-6 shadow-lg rotate-3">
                                    <Sparkles className="h-8 w-8 text-white" />
                                </div>
                                <CardTitle className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-indigo-600 dark:from-white dark:to-indigo-300">
                                    AI Booking Assistant
                                </CardTitle>
                                <CardDescription className="max-w-xs mx-auto text-slate-600 dark:text-slate-400">
                                    Experience a faster, more personal way to book your sessions.
                                    Find the right therapist and slot in seconds.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="flex justify-center pb-8 relative z-10">
                                <Button
                                    onClick={handleStartBooking}
                                    disabled={initializing}
                                    size="lg"
                                    className="rounded-xl px-10 py-6 bg-primary hover:bg-primary/90 shadow-xl shadow-primary/20 transition-all hover:scale-105 active:scale-95"
                                >
                                    {initializing ? (
                                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                    ) : (
                                        <Calendar className="mr-2 h-5 w-5" />
                                    )}
                                    <span className="text-base font-bold">Launch Smart Booking</span>
                                </Button>
                            </CardContent>

                            {/* Decorative Blobs */}
                            <div className="absolute top-0 right-0 -mr-20 -mt-20 w-48 h-48 bg-primary/20 rounded-full blur-3xl" />
                            <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-48 h-48 bg-indigo-500/20 rounded-full blur-3xl" />
                        </Card>
                    </motion.div>
                ) : (
                    <motion.div
                        key={activeSurface.surfaceId}
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="space-y-4"
                    >
                        <div className="flex items-center justify-between px-2 bg-white/50 dark:bg-slate-900/50 backdrop-blur-md py-2 rounded-xl border border-white/20 dark:border-white/10">
                            <div className="flex items-center gap-3">
                                <div className="relative">
                                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                                        <Sparkles className="h-4 w-4 text-primary" />
                                    </div>
                                    <div className={`absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white dark:border-slate-900 ${connected ? 'bg-green-500' : 'bg-yellow-500'}`} />
                                </div>
                                <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-widest">
                                    {connected ? 'Assistant Online' : 'Connecting...'}
                                </span>
                            </div>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="text-xs text-muted-foreground"
                                onClick={() => setCurrentSurfaceId(null)}
                            >
                                Reset Assistant
                            </Button>
                        </div>

                        <A2UIRenderer
                            surface={activeSurface}
                            onAction={handleAction}
                            className="a2ui-surface-root"
                        />
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
