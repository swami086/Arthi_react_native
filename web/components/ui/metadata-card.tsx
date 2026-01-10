'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface MetadataCardProps {
    icon: LucideIcon;
    label: string;
    value: string | number;
    className?: string;
    delay?: number;
}

export const MetadataCard: React.FC<MetadataCardProps> = ({
    icon: Icon,
    label,
    value,
    className,
    delay = 0
}) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay }}
            whileHover={{ y: -4, transition: { duration: 0.2 } }}
            className={cn(
                "flex-1 bg-gray-50/50 dark:bg-[#1a2c32] p-4 rounded-2xl items-center text-center border border-gray-100 dark:border-border-dark transition-all duration-300 hover:shadow-lg hover:shadow-primary/5 hover:border-primary/20",
                className
            )}
        >
            <div className="p-2.5 rounded-xl bg-primary/10 mb-3">
                <Icon
                    size={24}
                    className="text-primary stroke-[2.5px]"
                />
            </div>
            <h4 className="text-xl font-black text-gray-900 dark:text-gray-100 mb-1 tabular-nums">
                {value}
            </h4>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 dark:text-gray-500 whitespace-nowrap">
                {label}
            </p>
        </motion.div>
    );
};
