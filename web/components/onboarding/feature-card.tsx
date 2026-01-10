'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface FeatureCardProps {
    icon: React.ReactNode;
    title: string;
    description: string;
    delay?: number;
}

export const FeatureCard: React.FC<FeatureCardProps> = ({
    icon,
    title,
    description,
    delay = 0,
}) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay, duration: 0.5, ease: 'easeOut' }}
            className="flex flex-row items-start gap-4 p-5 rounded-2xl bg-white/50 dark:bg-white/5 border border-border-light/50 dark:border-border-dark/50 shadow-sm"
        >
            <div className="w-14 h-14 shrink-0 rounded-2xl bg-primary/10 dark:bg-primary/20 flex items-center justify-center text-primary">
                {icon}
            </div>
            <div className="flex flex-col gap-1">
                <h3 className="text-lg font-bold text-text-primary-light dark:text-text-primary-dark tracking-tight">
                    {title}
                </h3>
                <p className="text-sm font-medium text-text-secondary-light dark:text-text-secondary-dark leading-relaxed">
                    {description}
                </p>
            </div>
        </motion.div>
    );
};
