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
                <div className="flex flex-col h-full">
                    {children}
                </div>
            </div>
        </div>
    );
}
