'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LucideIcon, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement | HTMLTextAreaElement> {
    label?: string;
    error?: string;
    leftIcon?: LucideIcon;
    rightIcon?: LucideIcon;
    onRightIconClick?: () => void;
    multiline?: boolean;
    containerClassName?: string;
}

export const Input = React.forwardRef<HTMLInputElement & HTMLTextAreaElement, InputProps>(
    ({ label, error, leftIcon: LeftIcon, rightIcon: RightIcon, onRightIconClick, multiline, containerClassName, type, className, ...props }, ref) => {
        const [showPassword, setShowPassword] = React.useState(false);
        const [isFocused, setIsFocused] = React.useState(false);

        const isPassword = type === 'password';
        const inputType = isPassword ? (showPassword ? 'text' : 'password') : type;

        const errorShake = {
            animate: error ? { x: [0, -4, 4, -4, 4, 0] } : {},
            transition: { duration: 0.4 }
        };

        return (
            <div className={cn('flex flex-col w-full group mb-4', containerClassName)}>
                {label && (
                    <label className="mb-2 text-gray-500 dark:text-gray-400 text-[10px] font-black uppercase tracking-[0.2em] leading-none px-1 transition-colors group-focus-within:text-primary">
                        {label}
                    </label>
                )}

                <motion.div
                    {...errorShake}
                    className={cn(
                        'relative flex items-center transition-all duration-300 rounded-2xl border-2 overflow-hidden',
                        isFocused
                            ? 'border-primary bg-white dark:bg-[#1a2c32] shadow-xl shadow-primary/5'
                            : 'border-gray-100 dark:border-border-dark bg-gray-50/50 dark:bg-[#0f191d]',
                        error && 'border-red-500 bg-red-50/30 dark:bg-red-500/5',
                        multiline ? 'h-auto min-h-[120px]' : 'h-14',
                        className
                    )}
                >
                    {LeftIcon && (
                        <div className="absolute left-4 flex-shrink-0 z-10 transition-transform duration-300 group-focus-within:scale-110">
                            <LeftIcon
                                size={20}
                                className={cn(
                                    'transition-colors duration-300',
                                    isFocused ? 'text-primary' : 'text-gray-400 dark:text-gray-500',
                                    error && 'text-red-500'
                                )}
                            />
                        </div>
                    )}

                    {multiline ? (
                        <textarea
                            ref={ref}
                            onFocus={() => setIsFocused(true)}
                            onBlur={() => setIsFocused(false)}
                            className={cn(
                                'flex-1 bg-transparent px-4 py-3 outline-none text-gray-900 dark:text-gray-100 font-bold text-sm sm:text-base placeholder:text-gray-300 dark:placeholder:text-gray-600 resize-none',
                                LeftIcon && 'pl-12'
                            )}
                            {...(props as any)}
                        />
                    ) : (
                        <input
                            ref={ref}
                            type={inputType}
                            onFocus={() => setIsFocused(true)}
                            onBlur={() => setIsFocused(false)}
                            className={cn(
                                'flex-1 bg-transparent h-full px-4 outline-none text-gray-900 dark:text-gray-100 font-bold text-sm sm:text-base placeholder:text-gray-300 dark:placeholder:text-gray-600',
                                LeftIcon && 'pl-12'
                            )}
                            {...props}
                        />
                    )}

                    {isPassword ? (
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="px-4 h-full flex items-center justify-center transition-opacity hover:opacity-70 focus:outline-none"
                        >
                            {showPassword ? (
                                <EyeOff size={18} className={isFocused ? 'text-primary' : 'text-gray-400 dark:text-gray-500'} />
                            ) : (
                                <Eye size={18} className={isFocused ? 'text-primary' : 'text-gray-400 dark:text-gray-500'} />
                            )}
                        </button>
                    ) : RightIcon ? (
                        <button
                            type="button"
                            onClick={onRightIconClick}
                            disabled={!onRightIconClick}
                            className="px-4 h-full flex items-center justify-center transition-opacity hover:opacity-70 focus:outline-none"
                        >
                            <RightIcon size={18} className={isFocused ? 'text-primary' : 'text-gray-400 dark:text-gray-500'} />
                        </button>
                    ) : (
                        error && (
                            <div className="px-4">
                                <AlertCircle size={18} className="text-red-500" />
                            </div>
                        )
                    )}
                </motion.div>

                <AnimatePresence>
                    {error && (
                        <motion.p
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="text-red-500 text-[11px] font-black uppercase tracking-widest mt-2 ml-1"
                        >
                            {error}
                        </motion.p>
                    )}
                </AnimatePresence>
            </div>
        );
    }
);

Input.displayName = 'Input';
