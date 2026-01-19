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
}

export function A2UIBookingInterface({ userId, initialSpecialization }: A2UIBookingInterfaceProps) {
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
            const { data, error: initError } = await supabase.functions.invoke('booking-agent-init', {
                body: { specialization: initialSpecialization }
            });

            if (initError) throw initError;

            setCurrentSurfaceId(data.surfaceId);
            toast.success("Booking agent initialized");
        } catch (err: any) {
            console.error("Failed to init booking agent:", err);
            toast.error("Failed to start booking assistant");
        } finally {
            setInitializing(false);
        }
    };

    const handleAction = async (action: any) => {
        try {
            // 1. Send action to backend (Edge Function)
            const { data, error: actionError } = await supabase.functions.invoke('booking-agent', {
                body: {
                    action: action.actionId, // The action identifier from the component
                    surfaceId: action.surfaceId,
                    payload: action.payload,
                    metadata: action.metadata
                }
            });

            if (actionError) throw actionError;

            // 2. The edge function updates the DB, and useA2UI will pick up the change via Realtime
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
                        <Card className="border-dashed border-2 bg-slate-50/50 dark:bg-slate-900/10">
                            <CardHeader className="text-center">
                                <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                                    <Sparkles className="h-6 w-6 text-primary" />
                                </div>
                                <CardTitle>AI Booking Assistant</CardTitle>
                                <CardDescription>
                                    Experience a faster, more personal way to book your sessions.
                                    Our AI assistant helps you find the right therapist and slot in seconds.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="flex justify-center pb-8">
                                <Button
                                    onClick={handleStartBooking}
                                    disabled={initializing}
                                    size="lg"
                                    className="rounded-full px-8"
                                >
                                    {initializing ? (
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    ) : (
                                        <Calendar className="mr-2 h-4 w-4" />
                                    )}
                                    Launch Smart Booking
                                </Button>
                            </CardContent>
                        </Card>
                    </motion.div>
                ) : (
                    <motion.div
                        key={activeSurface.surfaceId}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="space-y-4"
                    >
                        <div className="flex items-center justify-between px-1">
                            <div className="flex items-center gap-2">
                                <div className={`h-2 w-2 rounded-full ${connected ? 'bg-green-500' : 'bg-yellow-500'} animate-pulse`} />
                                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
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
