'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface SectionHeaderProps {
    title: string;
    subtitle?: string;
    action?: React.ReactNode;
    className?: string;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({
    title,
    subtitle,
    action,
    className,
}) => {
    return (
        <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className={cn(
                'flex flex-col sm:flex-row sm:items-end justify-between gap-4 py-8 px-1',
                className
            )}
        >
            <div>
                <h2 className="text-3xl font-black text-gray-900 dark:text-gray-100 tracking-tight leading-none mb-2">
                    {title}
                </h2>
                {subtitle && (
                    <p className="text-gray-500 dark:text-gray-400 text-sm font-semibold uppercase tracking-widest opacity-80">
                        {subtitle}
                    </p>
                )}
            </div>
            {action && (
                <div className="flex-shrink-0">
                    {action}
                </div>
            )}
        </motion.div>
    );
};
