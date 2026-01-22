'use client';

import React from 'react';
import { useFollowupAgent } from '@/hooks/use-followup-agent';
import { A2UIRenderer } from '@/lib/a2ui/renderer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Heart, Send, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface A2UIFollowupFormProps {
    userId: string;
}

export function A2UIFollowupForm({ userId }: A2UIFollowupFormProps) {
    const {
        surface,
        loading,
        isInitializing,
        startFollowup,
        sendAction,
        error
    } = useFollowupAgent({ userId });

    if (loading && !surface) {
        return (
            <div className="flex h-64 items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="w-full max-w-2xl mx-auto space-y-6">
            <AnimatePresence mode="wait">
                {!surface ? (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                    >
                        <Card className="bg-gradient-to-br from-primary/5 to-transparent border-primary/10 rounded-[40px] shadow-xl overflow-hidden">
                            <CardHeader className="text-center pt-12">
                                <div className="mx-auto w-16 h-16 bg-white dark:bg-slate-800 shadow-lg rounded-3xl flex items-center justify-center mb-6 border-4 border-primary/10">
                                    <Heart className="h-8 w-8 text-primary" />
                                </div>
                                <CardTitle className="text-3xl font-black">Daily Wellness Check</CardTitle>
                                <CardDescription className="font-medium text-foreground-muted max-w-sm mx-auto mt-2">
                                    Take 60 seconds to reflect on your day. Your therapist uses this to prepare for your next session.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="flex justify-center pb-12 pt-6">
                                <Button
                                    onClick={startFollowup}
                                    disabled={isInitializing}
                                    size="lg"
                                    className="rounded-full px-12 h-16 text-lg font-black shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all border-b-4 border-primary-dark"
                                >
                                    {isInitializing ? (
                                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                    ) : (
                                        <Send className="mr-2 h-5 w-5" />
                                    )}
                                    Start Check-in
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
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-black text-xl flex items-center gap-2">
                                <Heart className="w-5 h-5 text-primary" />
                                Wellness Companion
                            </h3>
                            <Button variant="ghost" size="icon" onClick={startFollowup} className="rounded-full">
                                <RefreshCw className="w-4 h-4" />
                            </Button>
                        </div>
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

