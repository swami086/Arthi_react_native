'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface QuickActionButtonProps {
    icon: LucideIcon;
    title: string;
    subtitle?: string;
    color: string;
    onClick: () => void;
    className?: string;
    delay?: number;
}

export const QuickActionButton: React.FC<QuickActionButtonProps> = ({
    icon: Icon,
    title,
    subtitle,
    color,
    onClick,
    className,
    delay = 0,
}) => {
    return (
        <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{
                type: 'spring',
                stiffness: 400,
                damping: 17,
                delay
            }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95, rotate: '5deg' }}
            onClick={onClick}
            className={cn(
                'group flex flex-col items-center justify-center p-4 transition-all duration-200 min-w-[120px] bg-white dark:bg-[#1a2c32] rounded-3xl border border-gray-100 dark:border-border-dark shadow-sm hover:shadow-lg hover:shadow-primary/5 w-full h-full',
                className
            )}
        >
            <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center mb-3 shadow-lg shadow-black/5 transition-transform duration-300 group-hover:scale-110"
                style={{ backgroundColor: `${color}15` }}
            >
                <Icon
                    size={26}
                    style={{ color: color }}
                    className="drop-shadow-sm transition-transform duration-300"
                />
            </div>
            <span className="text-gray-900 dark:text-gray-100 text-sm font-black tracking-tight text-center leading-tight mb-1">
                {title}
            </span>
            {subtitle && (
                <span className="text-gray-500 dark:text-gray-400 text-[10px] font-medium text-center leading-tight max-w-[140px]">
                    {subtitle}
                </span>
            )}
        </motion.button>
    );
};
