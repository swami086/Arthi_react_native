'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { AlertCircle } from 'lucide-react';

export interface RadioOption {
    value: string;
    label: string;
}

interface RadioGroupProps {
    label?: string;
    options: RadioOption[];
    value?: string;
    onValueChange: (value: string) => void;
    orientation?: 'vertical' | 'horizontal';
    disabled?: boolean;
    error?: string;
    className?: string;
}

export const RadioGroup: React.FC<RadioGroupProps> = ({
    label,
    options,
    value,
    onValueChange,
    orientation = 'vertical',
    disabled = false,
    error,
    className
}) => {
    return (
        <div className={cn('flex flex-col w-full mb-4', className)}>
            {label && (
                <label className="mb-3 text-gray-500 dark:text-gray-400 text-[10px] font-black uppercase tracking-[0.2em] leading-none px-1">
                    {label}
                </label>
            )}

            <div
                className={cn(
                    'flex gap-3',
                    orientation === 'vertical' ? 'flex-col' : 'flex-row flex-wrap'
                )}
            >
                {options.map((option) => {
                    const isSelected = value === option.value;
                    return (
                        <motion.button
                            key={option.value}
                            type="button"
                            disabled={disabled}
                            whileHover={{ scale: disabled ? 1 : 1.01 }}
                            whileTap={{ scale: disabled ? 1 : 0.98 }}
                            onClick={() => onValueChange(option.value)}
                            className={cn(
                                'flex items-center px-4 py-3 rounded-2xl border-2 transition-all duration-300 text-left',
                                isSelected
                                    ? 'border-primary bg-primary/5 text-primary shadow-lg shadow-primary/5'
                                    : 'border-gray-100 dark:border-border-dark bg-gray-50/50 dark:bg-[#0f191d] text-gray-700 dark:text-gray-300',
                                disabled && 'opacity-50 cursor-not-allowed grayscale',
                                error && !isSelected && 'border-red-500/50'
                            )}
                        >
                            <div
                                className={cn(
                                    'w-5 h-5 rounded-full border-2 mr-3 flex items-center justify-center transition-colors duration-300',
                                    isSelected ? 'border-primary bg-primary' : 'border-gray-300 dark:border-gray-600'
                                )}
                            >
                                {isSelected && (
                                    <motion.div
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        className="w-2 h-2 rounded-full bg-white"
                                    />
                                )}
                            </div>
                            <span className="font-bold text-sm sm:text-base">{option.label}</span>
                        </motion.button>
                    );
                })}
            </div>

            <AnimatePresence>
                {error && (
                    <motion.p
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="text-red-500 text-[11px] font-black uppercase tracking-widest mt-2 ml-1 flex items-center"
                    >
                        <AlertCircle size={12} className="mr-1" />
                        {error}
                    </motion.p>
                )}
            </AnimatePresence>
        </div>
    );
};
