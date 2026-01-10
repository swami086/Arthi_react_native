'use client';



import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function OnboardingLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-background-light dark:bg-background-dark">
            <div className="max-w-md mx-auto min-h-screen relative overflow-hidden">
                <AnimatePresence mode="wait">
                    <motion.main
                        key="onboarding-content"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex flex-col h-full"
                    >
                        {children}
                    </motion.main>
                </AnimatePresence>
            </div>
        </div>
    );
}
