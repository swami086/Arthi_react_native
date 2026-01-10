'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

interface NotificationBadgeProps {
    count: number;
    max?: number;
    className?: string;
}

export const NotificationBadge: React.FC<NotificationBadgeProps> = ({
    count,
    max = 99,
    className
}) => {
    return (
        <AnimatePresence>
            {count > 0 && (
                <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    className={cn(
                        "absolute -top-1 -right-1 flex items-center justify-center min-w-[18px] h-[18px] px-1 bg-red-500 rounded-full border-2 border-white dark:border-[#1a2c32]",
                        className
                    )}
                >
                    <span className="text-[10px] font-black leading-none text-white tabular-nums">
                        {count > max ? `${max}+` : count}
                    </span>
                    <span className="absolute inset-0 rounded-full bg-red-400 animate-ping opacity-75" />
                </motion.div>
            )}
        </AnimatePresence>
    );
};
