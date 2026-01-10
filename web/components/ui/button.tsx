'use client';

import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'transparent' | 'error' | 'link';
type ButtonSize = 'sm' | 'md' | 'lg' | 'icon';

interface ButtonProps extends Omit<HTMLMotionProps<'button'>, 'children'> {
    variant?: ButtonVariant;
    size?: ButtonSize;
    isLoading?: boolean;
    leftIcon?: React.ReactNode;
    rightIcon?: React.ReactNode;
    children?: React.ReactNode;
}

const variants: Record<ButtonVariant, string> = {
    primary: 'bg-primary text-white hover:opacity-90 active:scale-95 shadow-lg shadow-primary/20',
    secondary: 'bg-secondary text-white hover:opacity-90 active:scale-95 shadow-lg shadow-secondary/20',
    outline: 'border-2 border-primary text-primary bg-transparent hover:bg-primary/5 active:scale-95',
    ghost: 'text-primary bg-transparent hover:bg-primary/5 active:scale-95',
    transparent: 'bg-transparent text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 active:scale-95',
    error: 'bg-red-500 text-white hover:opacity-90 active:scale-95 shadow-lg shadow-red-500/20',
    link: 'bg-transparent text-primary hover:underline underline-offset-4 p-0 h-auto font-bold tracking-normal normal-case active:scale-95 shadow-none',
};

const sizes: Record<ButtonSize, string> = {
    sm: 'px-4 py-2 text-[10px] rounded-xl',
    md: 'px-6 py-3 text-[11px] rounded-2xl',
    lg: 'px-8 py-4 text-[13px] rounded-3xl',
    icon: 'h-10 w-10 p-2 rounded-xl flex items-center justify-center',
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant = 'primary', size = 'md', isLoading = false, leftIcon, rightIcon, children, disabled, ...props }, ref) => {
        return (
            <motion.button
                ref={ref}
                whileHover={{ scale: disabled || isLoading ? 1 : 1.02 }}
                whileTap={{ scale: disabled || isLoading ? 1 : 0.98 }}
                disabled={disabled || isLoading}
                className={cn(
                    'relative inline-flex items-center justify-center font-black uppercase tracking-[0.15em] transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-50 disabled:cursor-not-allowed',
                    variants[variant],
                    sizes[size],
                    className
                )}
                {...props}
            >
                {isLoading && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin stroke-[3px]" />
                )}
                {!isLoading && leftIcon && <span className="mr-2 flex-shrink-0">{leftIcon}</span>}
                <span className={isLoading ? 'opacity-0' : 'opacity-100 whitespace-nowrap'}>{children}</span>
                {!isLoading && rightIcon && <span className="ml-2 flex-shrink-0">{rightIcon}</span>}
            </motion.button>
        );
    }
);

Button.displayName = 'Button';
