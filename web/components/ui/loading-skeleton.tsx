'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface LoadingSkeletonProps {
    className?: string;
    width?: string | number;
    height?: string | number;
    borderRadius?: string | number;
}

export const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({
    className,
    width,
    height,
    borderRadius = '1rem',
}) => {
    return (
        <div
            className={cn(
                'relative overflow-hidden bg-gray-200 dark:bg-gray-800',
                className
            )}
            style={{
                width,
                height,
                borderRadius,
            }}
        >
            <div className="absolute inset-0 animate-shimmer" />
        </div>
    );
};

export const CardSkeleton: React.FC<{ className?: string }> = ({ className }) => {
    return (
        <div className={cn('p-5 rounded-2xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-sm flex flex-col gap-4', className)}>
            <LoadingSkeleton width="40%" height={24} borderRadius="0.5rem" />
            <LoadingSkeleton width="100%" height={16} borderRadius="0.25rem" />
            <LoadingSkeleton width="100%" height={16} borderRadius="0.25rem" />
            <div className="flex justify-between mt-2">
                <LoadingSkeleton width="30%" height={32} borderRadius="9999px" />
                <LoadingSkeleton width="30%" height={32} borderRadius="9999px" />
            </div>
        </div>
    );
};

export const ListSkeleton: React.FC<{ count?: number; className?: string }> = ({
    count = 3,
    className
}) => {
    return (
        <div className={cn('flex flex-col gap-4', className)}>
            {Array.from({ length: count }).map((_, i) => (
                <div key={i} className="flex items-center gap-4 p-4 rounded-xl bg-white/50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700">
                    <LoadingSkeleton width={50} height={50} borderRadius="9999px" />
                    <div className="flex-1 space-y-2">
                        <LoadingSkeleton width="60%" height={16} borderRadius="0.25rem" />
                        <LoadingSkeleton width="40%" height={12} borderRadius="0.25rem" />
                    </div>
                </div>
            ))}
        </div>
    );
};
