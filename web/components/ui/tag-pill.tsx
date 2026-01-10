'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface TagPillProps {
    label: string;
    color?: 'blue' | 'purple' | 'orange' | 'green' | 'gray';
    className?: string;
    delay?: number;
}

const colorVariants = {
    purple: {
        bg: 'bg-purple-50 dark:bg-purple-900/30',
        text: 'text-purple-600 dark:text-purple-300',
        border: 'border-purple-100 dark:border-purple-800'
    },
    orange: {
        bg: 'bg-orange-50 dark:bg-orange-900/30',
        text: 'text-orange-600 dark:text-orange-300',
        border: 'border-orange-100 dark:border-orange-800'
    },
    green: {
        bg: 'bg-green-50 dark:bg-green-900/30',
        text: 'text-green-600 dark:text-green-400',
        border: 'border-green-100 dark:border-green-800'
    },
    gray: {
        bg: 'bg-gray-100 dark:bg-gray-800',
        text: 'text-gray-600 dark:text-gray-400',
        border: 'border-gray-200 dark:border-gray-700'
    },
    blue: {
        bg: 'bg-blue-50 dark:bg-blue-900/30',
        text: 'text-primary dark:text-blue-300',
        border: 'border-blue-100 dark:border-blue-800'
    }
};

export const TagPill: React.FC<TagPillProps> = ({
    label,
    color = 'blue',
    className,
    delay = 0,
}) => {
    const styles = colorVariants[color];

    return (
        <motion.span
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{
                type: 'spring',
                stiffness: 300,
                damping: 15,
                delay
            }}
            className={cn(
                'inline-flex items-center px-2.5 py-0.5 rounded-full border text-xs font-semibold select-none',
                styles.bg,
                styles.border,
                styles.text,
                className
            )}
        >
            {label}
        </motion.span>
    );
};
