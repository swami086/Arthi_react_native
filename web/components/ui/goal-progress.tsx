'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface GoalProgressProps {
    title: string;
    percentage: number;
    color?: string;
    className?: string;
}

export const GoalProgress: React.FC<GoalProgressProps> = ({
    title,
    percentage,
    color = '#30bae8',
    className
}) => {
    return (
        <div className={cn('w-full mb-6', className)}>
            <div className="flex justify-between items-end mb-2">
                <h4 className="text-gray-900 dark:text-gray-100 font-black text-xs uppercase tracking-widest leading-none">
                    {title}
                </h4>
                <span className="text-primary font-black text-xs tabular-nums leading-none">
                    {Math.round(percentage)}%
                </span>
            </div>

            <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden p-0.5 border border-gray-50 dark:border-gray-700">
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    transition={{ type: 'spring', damping: 20, stiffness: 80, delay: 0.1 }}
                    className="h-full rounded-full relative overflow-hidden"
                    style={{ backgroundColor: color }}
                >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
                </motion.div>
            </div>
        </div>
    );
};
