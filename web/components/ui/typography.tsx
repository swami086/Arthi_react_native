'use client';

import React from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface TypographyProps {
    variant?: 'h1' | 'h2' | 'h3' | 'h4' | 'p' | 'span' | 'small' | 'label';
    children: React.ReactNode;
    className?: string;
}

export const Typography: React.FC<TypographyProps> = ({
    variant = 'p',
    children,
    className,
}) => {
    const Component = variant === 'label' ? 'span' : variant;

    const baseStyles = {
        h1: 'text-4xl font-black tracking-tight',
        h2: 'text-2xl font-black tracking-tight',
        h3: 'text-xl font-bold tracking-tight',
        h4: 'text-lg font-bold tracking-tight',
        p: 'text-base text-gray-600 dark:text-gray-400',
        span: '',
        small: 'text-xs font-medium text-gray-500',
        label: 'text-sm font-black uppercase tracking-widest text-gray-400',
    };

    return (
        <Component className={cn(baseStyles[variant], className)}>
            {children}
        </Component>
    );
};

Typography.displayName = 'Typography';
