'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface FilterChipProps {
    label: string;
    isSelected: boolean;
    onClick: () => void;
    className?: string;
}

export const FilterChip: React.FC<FilterChipProps> = ({
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
                'px-5 py-2 rounded-full text-sm font-black uppercase tracking-widest transition-all duration-300 border-2 whitespace-nowrap',
                isSelected
                    ? 'bg-primary border-primary text-white shadow-lg shadow-primary/20'
                    : 'bg-white dark:bg-[#1a2c32] border-gray-100 dark:border-border-dark text-gray-400 dark:text-gray-500 hover:border-gray-200 dark:hover:border-gray-700 hover:text-gray-600 dark:hover:text-gray-300',
                className
            )}
        >
            {label}
        </motion.button>
    );
};
