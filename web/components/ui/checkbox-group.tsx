'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { AlertCircle, Check } from 'lucide-react';

export interface CheckboxOption {
    value: string;
    label: string;
}

interface CheckboxGroupProps {
    label?: string;
    options: CheckboxOption[];
    values?: string[];
    onChange: (values: string[]) => void;
    selectAll?: boolean;
    disabled?: boolean;
    error?: string;
    className?: string;
}

export const CheckboxGroup: React.FC<CheckboxGroupProps> = ({
    label,
    options,
    values = [],
    onChange,
    selectAll = false,
    disabled = false,
    error,
    className
}) => {
    const handleToggle = (value: string) => {
        if (disabled) return;
        const newValues = values.includes(value)
            ? values.filter((v) => v !== value)
            : [...values, value];
        onChange(newValues);
    };

    const handleSelectAll = () => {
        if (disabled) return;
        if (values.length === options.length) {
            onChange([]);
        } else {
            onChange(options.map((o) => o.value));
        }
    };

    return (
        <div className={cn('flex flex-col w-full mb-4', className)}>
            <div className="flex items-center justify-between mb-3 px-1">
                {label && (
                    <label className="text-gray-500 dark:text-gray-400 text-[10px] font-black uppercase tracking-[0.2em] leading-none">
                        {label}
                    </label>
                )}
                {selectAll && (
                    <button
                        type="button"
                        onClick={handleSelectAll}
                        disabled={disabled}
                        className="text-primary text-[10px] font-black uppercase tracking-[0.1em] hover:underline disabled:opacity-50"
                    >
                        {values.length === options.length ? 'Deselect All' : 'Select All'}
                    </button>
                )}
            </div>

            <div className="flex flex-col gap-2">
                {options.map((option) => {
                    const isChecked = values.includes(option.value);
                    return (
                        <motion.button
                            key={option.value}
                            type="button"
                            disabled={disabled}
                            whileHover={{ scale: disabled ? 1 : 1.005 }}
                            whileTap={{ scale: disabled ? 1 : 0.995 }}
                            onClick={() => handleToggle(option.value)}
                            className={cn(
                                'flex items-center px-4 py-3 rounded-2xl border-2 transition-all duration-300 text-left',
                                isChecked
                                    ? 'border-primary bg-primary/5 text-primary shadow-lg shadow-primary/5'
                                    : 'border-gray-100 dark:border-border-dark bg-gray-50/50 dark:bg-[#0f191d] text-gray-700 dark:text-gray-300',
                                disabled && 'opacity-50 cursor-not-allowed grayscale',
                                error && !isChecked && 'border-red-500/50'
                            )}
                        >
                            <div
                                className={cn(
                                    'w-5 h-5 rounded-lg border-2 mr-3 flex items-center justify-center transition-colors duration-300',
                                    isChecked ? 'border-primary bg-primary' : 'border-gray-300 dark:border-gray-600'
                                )}
                            >
                                {isChecked && (
                                    <motion.div
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                    >
                                        <Check size={14} className="text-white stroke-[4px]" />
                                    </motion.div>
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
