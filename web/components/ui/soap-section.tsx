'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp, LucideIcon, AlertCircle, CheckCircle2 } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

import { reportError } from '@/lib/rollbar-utils';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface SoapSectionProps {
    title: string;
    icon: LucideIcon;
    value: string;
    onChange: (text: string) => void;
    isExpanded: boolean;
    onToggle: () => void;
    readOnly?: boolean;
    minChars?: number;
    className?: string;
    onError?: (error: any) => void;
}

export const SoapSection: React.FC<SoapSectionProps> = ({
    title,
    icon: Icon,
    value,
    onChange,
    isExpanded,
    onToggle,
    readOnly = false,
    minChars = 50,
    className,
    onError,
}) => {
    const charCount = value.length;
    const isValid = charCount >= minChars;

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        try {
            onChange(e.target.value);
        } catch (error) {
            reportError(error, 'soap_section.change', { title });
            onError?.(error);
        }
    };

    const handleToggle = () => {
        try {
            onToggle();
        } catch (error) {
            reportError(error, 'soap_section.toggle', { title });
            onError?.(error);
        }
    };

    return (
        <div className={cn(
            'mb-6 bg-white dark:bg-[#1a2c32] rounded-[32px] overflow-hidden shadow-sm border border-gray-100 dark:border-border-dark transition-all duration-300',
            isExpanded && 'shadow-xl shadow-primary/5 border-primary/20',
            className
        )}>
            <button
                type="button"
                onClick={handleToggle}
                className={cn(
                    'w-full flex items-center justify-between p-6 transition-colors group focus:outline-none',
                    isExpanded ? 'bg-gray-50/50 dark:bg-[#233840]' : 'hover:bg-gray-50 dark:hover:bg-[#233840]'
                )}
            >
                <div className="flex items-center gap-4">
                    <div className={cn(
                        'w-12 h-12 rounded-2xl flex items-center justify-center transition-transform duration-300 group-hover:scale-110',
                        isValid
                            ? 'bg-green-100/50 dark:bg-green-500/10 text-green-600'
                            : 'bg-amber-100/50 dark:bg-amber-500/10 text-amber-600'
                    )}>
                        <Icon size={24} className="stroke-[2.5px]" />
                    </div>
                    <div className="text-left">
                        <h3 className="text-xl font-black text-gray-900 dark:text-gray-100 leading-tight">
                            {title}
                        </h3>
                        <p className={cn(
                            'text-[10px] font-black uppercase tracking-widest mt-1',
                            isValid ? 'text-green-600/70' : 'text-amber-600/70'
                        )}>
                            {isValid ? 'Completed' : 'Drafting'}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <div className="hidden sm:flex flex-col items-end">
                        <span className={cn(
                            'text-xs font-black tabular-nums',
                            isValid ? 'text-green-600' : 'text-amber-600'
                        )}>
                            {charCount} / {minChars}
                        </span>
                        <div className="w-16 h-1 bg-gray-100 dark:bg-gray-800 rounded-full mt-1 overflow-hidden">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${Math.min((charCount / minChars) * 100, 100)}%` }}
                                className={cn('h-full', isValid ? 'bg-green-500' : 'bg-amber-500')}
                            />
                        </div>
                    </div>

                    <div className="p-2 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500 group-hover:bg-primary group-hover:text-white transition-all">
                        {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                    </div>
                </div>
            </button>

            <AnimatePresence>
                {isExpanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                    >
                        <div className="p-6 border-t border-gray-100 dark:border-border-dark bg-white dark:bg-[#1a2c32]">
                            <textarea
                                value={value}
                                onChange={handleChange}
                                disabled={readOnly}
                                placeholder={`Enter detailed ${title.toLowerCase()} notes...`}
                                className={cn(
                                    'w-full min-h-[160px] bg-gray-50/50 dark:bg-[#0f191d] p-5 rounded-3xl outline-none text-gray-800 dark:text-gray-200 text-base leading-relaxed font-medium placeholder:text-gray-400 focus:ring-2 focus:ring-primary/20 transition-all border-2 border-transparent focus:border-primary/20 resize-none',
                                    readOnly && 'opacity-60 cursor-not-allowed'
                                )}
                            />

                            {!readOnly && (
                                <div className="flex items-center gap-2 mt-4">
                                    {isValid ? (
                                        <div className="flex items-center gap-1.5 text-green-600">
                                            <CheckCircle2 size={14} />
                                            <span className="text-[10px] font-black uppercase tracking-widest">Entry valid</span>
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-1.5 text-amber-600">
                                            <AlertCircle size={14} />
                                            <span className="text-[10px] font-black uppercase tracking-widest">
                                                Minimum {minChars} characters required
                                            </span>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
