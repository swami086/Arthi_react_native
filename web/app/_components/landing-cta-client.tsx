'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { MessageCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { addBreadcrumb } from '@/lib/rollbar-utils';
import { useAuth } from '@/hooks/use-auth';

export function LandingCTA() {
    const router = useRouter();
    const { user, profile } = useAuth();

    const handleCTA = () => {
        if (user) {
            const homePath = profile?.role === 'therapist' ? '/therapist/home' : profile?.role === 'admin' ? '/admin/dashboard' : '/home';
            router.push(homePath);
            return;
        }
        addBreadcrumb('Landing page FAB CTA clicked', 'marketing.landing', 'info');
        router.push('/signup');
    };

    return (
        <div className="fixed bottom-10 right-10 z-50">
            <motion.button
                whileHover={{ scale: 1.1, rotate: 5 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleCTA}
                className="group flex items-center justify-center w-20 h-20 bg-primary text-white rounded-[28px] shadow-2xl shadow-primary/40 transition-all duration-300"
            >
                <MessageCircle className="w-10 h-10 group-hover:scale-110 transition-transform" />
            </motion.button>
        </div>
    );
}
