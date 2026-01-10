'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface FeedbackChipProps {
    label: string;
    isSelected: boolean;
    onClick: () => void;
    className?: string;
}

export const FeedbackChip: React.FC<FeedbackChipProps> = ({
    label,
    isSelected,
    onClick,
    className,
}) => {
    return (
        <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onClick}
            className={cn(
                'px-4 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-wider transition-all duration-200 border-2',
                isSelected
                    ? 'bg-primary border-primary text-white shadow-md shadow-primary/20'
                    : 'bg-gray-50 dark:bg-gray-800 border-transparent text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700',
                className
            )}
        >
            {label}
        </motion.button>
    );
};
