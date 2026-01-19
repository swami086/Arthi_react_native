'use client';

import { useState } from 'react';
import { A2UIBookingInterface } from '@/components/ai/a2ui-booking-interface';
import { Button } from '@/components/ui/button';
import { Sparkles, History, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface BookingAgentWrapperProps {
    userId: string;
}

export function BookingAgentWrapper({ userId }: BookingAgentWrapperProps) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="mb-8">
            <AnimatePresence>
                {!isOpen ? (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-6 text-white shadow-xl"
                    >
                        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-4">
                            <div className="space-y-1 text-center md:text-left">
                                <h2 className="text-xl font-bold flex items-center justify-center md:justify-start gap-2">
                                    <Sparkles className="h-5 w-5" />
                                    Try Smart Booking
                                </h2>
                                <p className="text-white/80 text-sm max-w-md">
                                    Let our AI assistant find the best therapist and slot for you based on your needs.
                                </p>
                            </div>
                            <Button
                                onClick={() => setIsOpen(true)}
                                className="bg-white text-indigo-600 hover:bg-white/90 rounded-full font-bold px-8"
                            >
                                Launch Assistant
                            </Button>
                        </div>
                        {/* Decorative background elements */}
                        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
                        <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-64 h-64 bg-indigo-600/20 rounded-full blur-3xl" />
                    </motion.div>
                ) : (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                        className="bg-white dark:bg-slate-900 rounded-3xl border border-border shadow-2xl overflow-hidden"
                    >
                        <div className="bg-slate-50 dark:bg-slate-800/50 px-6 py-4 flex items-center justify-between border-b">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                                    <Sparkles className="h-5 w-5 text-primary" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-sm">Space Booking Agent</h3>
                                    <p className="text-xs text-muted-foreground">Always active to help you</p>
                                </div>
                            </div>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setIsOpen(false)}
                                className="rounded-full"
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        </div>
                        <div className="p-6">
                            <A2UIBookingInterface userId={userId} />
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
