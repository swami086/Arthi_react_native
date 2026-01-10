'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from './button';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface BottomActionBarProps {
    onSecondaryClick: () => void;
    secondaryLabel: string;
    onPrimaryClick: () => void;
    primaryLabel: string;
    className?: string;
    isVisible?: boolean;
}

export const BottomActionBar: React.FC<BottomActionBarProps> = ({
    onSecondaryClick,
    secondaryLabel,
    onPrimaryClick,
    primaryLabel,
    className,
    isVisible = true,
}) => {
    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ y: 100, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 100, opacity: 0 }}
                    transition={{ type: 'spring', damping: 20, stiffness: 150 }}
                    className={cn(
                        'fixed bottom-0 left-0 right-0 bg-white/80 dark:bg-[#121717]/80 backdrop-blur-xl border-t border-gray-100 dark:border-border-dark p-6 pb-10 flex flex-row items-center justify-center gap-4 shadow-[0_-10px_40px_rgba(0,0,0,0.05)] z-50',
                        className
                    )}
                >
                    <div className="max-w-xl w-full flex flex-row gap-4">
                        <Button
                            variant="outline"
                            onClick={onSecondaryClick}
                            className="flex-1 h-12 rounded-2xl border-gray-100 dark:border-gray-800 text-gray-700 dark:text-gray-300 font-black uppercase tracking-widest text-[11px] hover:bg-gray-50 dark:hover:bg-gray-800"
                        >
                            {secondaryLabel}
                        </Button>

                        <Button
                            onClick={onPrimaryClick}
                            className="flex-1 h-12 rounded-2xl shadow-lg shadow-primary/20 font-black uppercase tracking-widest text-[11px]"
                        >
                            {primaryLabel}
                        </Button>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};
