'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface TimeSlotButtonProps {
    time: string;
    endTime?: string;
    isSelected: boolean;
    onPress: () => void;
    disabled?: boolean;
    available?: boolean;
    label?: string;
    className?: string;
}

/**
 * TimeSlotButton component for schedule selection.
 * Features selection state, availability indicators, and smooth animations.
 */
export const TimeSlotButton: React.FC<TimeSlotButtonProps> = ({
    time,
    endTime,
    isSelected,
    onPress,
    disabled = false,
    available = true,
    label,
    className
}) => {
    const isDisabled = disabled || !available;

    return (
        <motion.button
            whileTap={!isDisabled ? { scale: 0.95 } : {}}
            whileHover={!isDisabled ? { scale: 1.02 } : {}}
            onClick={!isDisabled ? onPress : undefined}
            disabled={isDisabled}
            className={
                cn(
                    "relative flex flex-col items-center justify-center p-4 rounded-2xl border transition-all duration-300 shadow-sm",
                    "h-[88px] w-full min-w-[120px]",
                    isSelected
                        ? "bg-primary border-primary text-primary-foreground shadow-lg shadow-primary/20 scale-105 z-10"
                        : "bg-white dark:bg-[#1a2c32] border-gray-100 dark:border-border-dark hover:border-primary/50 text-gray-900 dark:text-gray-100",
                    isDisabled && "opacity-40 cursor-not-allowed grayscale",
                    className
                )}
        >
            {/* Availability Indicator */}
            < div className="absolute top-2.5 left-2.5 flex items-center gap-1.5" >
                <div className={cn(
                    "w-2 h-2 rounded-full",
                    available ? "bg-green-500" : "bg-gray-300 dark:bg-gray-600"
                )} />
                {!available && <span className="text-[8px] font-black uppercase tracking-tighter text-gray-400">Busy</span>}
            </div >

            <div className="flex flex-col items-center">
                <span className={cn(
                    "text-xl font-black leading-none",
                    isSelected ? "text-white" : "text-gray-900 dark:text-gray-100"
                )}>
                    {label || time}
                </span>

                {endTime && !label && (
                    <span className={cn(
                        "text-[10px] font-bold mt-1 uppercase tracking-widest",
                        isSelected ? "text-white/80" : "text-gray-500"
                    )}>
                        Ends {endTime}
                    </span>
                )}
            </div>

            {
                isSelected && (
                    <motion.div
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="absolute top-2.5 right-2.5 bg-white/20 p-1 rounded-full backdrop-blur-sm"
                    >
                        <Check className="w-3.5 h-3.5 text-white stroke-[3px]" />
                    </motion.div>
                )
            }
        </motion.button >
    );
};

TimeSlotButton.displayName = 'TimeSlotButton';
