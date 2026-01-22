'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Sparkles, Heart } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { A2UIFollowupForm } from '@/components/ai/a2ui-followup-form';
import { createClient } from '@/lib/supabase/client';
import { pageTransition } from '@/lib/animation-variants';

export default function WellnessCheckPage() {
    const router = useRouter();
    const supabase = createClient();
    const [userId, setUserId] = useState<string | null>(null);

    useEffect(() => {
        const getUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                setUserId(user.id);
            } else {
                router.push('/login');
            }
        };
        getUser();
    }, [router, supabase]);

    if (!userId) return null;

    return (
        <motion.div
            variants={pageTransition}
            initial="initial"
            animate="animate"
            exit="exit"
            className="max-w-4xl mx-auto px-6 py-8 space-y-8"
        >
            <div className="flex items-center justify-between">
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => router.back()}
                    className="group text-gray-400 hover:text-primary"
                >
                    <ArrowLeft size={18} className="mr-2 transition-transform group-hover:-translate-x-1" />
                    Back to Dashboard
                </Button>

                <div className="flex items-center gap-2">
                    <Heart size={16} className="text-primary fill-primary/10" />
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">
                        Daily Companion
                    </span>
                </div>
            </div>

            <div className="space-y-2">
                <h1 className="text-3xl font-black text-gray-900 dark:text-gray-100 italic tracking-tight">
                    Wellness <span className="text-primary">Check-in</span>
                </h1>
                <p className="text-gray-500 dark:text-gray-400 max-w-xl">
                    Consistency is key to progress. Reflecting on your daily habits helps your therapist provide the best possible support.
                </p>
            </div>

            <div className="bg-white dark:bg-[#1a2c32] rounded-[40px] p-2 border border-gray-100 dark:border-border-dark shadow-xl shadow-gray-200/50 dark:shadow-none">
                <A2UIFollowupForm userId={userId} />
            </div>

            <div className="text-center pt-8">
                <p className="text-xs text-gray-400 flex items-center justify-center gap-2">
                    <Sparkles size={12} className="text-primary" />
                    Powered by A2UI Assistant
                </p>
            </div>
        </motion.div>
    );
}
