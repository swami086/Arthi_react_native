'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, Heart, ArrowRight } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { addBreadcrumb, reportInfo } from '@/lib/rollbar-utils';
import { useAuth } from '@/hooks/use-auth';

export function LandingHero() {
    const router = useRouter();
    const { user, profile } = useAuth();

    React.useEffect(() => {
        reportInfo('Landing page viewed', 'marketing.landing');
    }, []);

    const handleCTA = () => {
        if (user) {
            const homePath = profile?.role === 'therapist' ? '/therapist/home' : profile?.role === 'admin' ? '/admin/dashboard' : '/home';
            router.push(homePath);
            return;
        }
        addBreadcrumb('Landing page CTA clicked', 'marketing.landing', 'info');
        router.push('/signup');
    };

    return (
        <section className="pt-12 pb-8 md:pt-24 md:pb-20 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
                className="flex flex-col gap-6 text-left"
            >
                <h1 className="text-5xl md:text-7xl font-extrabold leading-[1.1] tracking-tight">
                    A place to be heard, <span className="text-primary italic">not analyzed.</span>
                </h1>
                <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 font-medium leading-relaxed max-w-xl">
                    Life coaching and active listening for when you just need to talk. No diagnosis, just support.
                </p>

                <div className="flex gap-3 flex-wrap">
                    <div className="flex h-10 items-center gap-x-2 rounded-full bg-primary/10 px-4 border border-primary/20">
                        <CheckCircle2 className="w-5 h-5 text-primary" />
                        <span className="text-sm font-bold">Not Therapy</span>
                    </div>
                    <div className="flex h-10 items-center gap-x-2 rounded-full bg-secondary-light/10 px-4 border border-secondary-light/20">
                        <Heart className="w-5 h-5 text-secondary-light" />
                        <span className="text-sm font-bold">Life Coaching</span>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 pt-4">
                    <Button
                        onClick={handleCTA}
                        className="h-16 px-10 text-xl font-bold rounded-full group shadow-2xl shadow-primary/30"
                        rightIcon={<ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />}
                    >
                        {user ? 'Go to Dashboard' : 'Connect with a Listener'}
                    </Button>
                    <div className="flex flex-col justify-center">
                        <span className="text-sm font-bold text-gray-400">Free 15-min intro session</span>
                        <span className="text-xs text-gray-400">No credit card needed</span>
                    </div>
                </div>
            </motion.div>

            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="relative"
            >
                <div className="relative w-full aspect-[4/3] rounded-[40px] overflow-hidden shadow-2xl group">
                    <Image
                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuB5NswgvnQBfEQBSsCNTWXK74n6ysVP6ago1FPTuZvO4RfuQfCmXNVSd-bI0IPNdDJrpaPNBb5FRMEIPZfwOqmGj2NEjpE-adilwDSBF6L64TAroG0oJCE1o8A9Ze_BE2HRs5sbj_KaY9pzdJYkzlqSzhGGdmB1lX79M1_xk1k5Hd6K0sobMIWGz_bwnodOT_NHo5_RWCF53sFbOXTyYwaEi4Lum1HcSBxgBLYophcUc3HnzdVwCFJVy0-n3b01eiKvh2rQvTg_fFfe"
                        alt="Supportive Illustration"
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-[2000ms]"
                        sizes="(max-width: 1024px) 100vw, 50vw"
                        priority
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-primary/30 to-transparent mix-blend-overlay" />
                </div>
                <div className="absolute -top-6 -right-6 w-32 h-32 bg-primary/20 blur-3xl rounded-full animate-pulse" />
                <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-secondary-light/20 blur-3xl rounded-full" />
            </motion.div>
        </section>
    );
}
