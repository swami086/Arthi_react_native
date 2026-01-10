'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface PageIndicatorProps {
    totalPages: number;
    currentPage: number;
    activeColor?: string;
}

export const PageIndicator: React.FC<PageIndicatorProps> = ({
    totalPages,
    currentPage,
    activeColor = 'bg-primary',
}) => {
    return (
        <div className="flex flex-row items-center gap-2">
            {Array.from({ length: totalPages }).map((_, index) => {
                const isActive = index === currentPage;
                return (
                    <motion.div
                        key={index}
                        initial={false}
                        animate={{
                            width: isActive ? 32 : 10,
                            opacity: isActive ? 1 : 0.3,
                        }}
                        transition={{
                            type: 'spring',
                            stiffness: 300,
                            damping: 30,
                            duration: 0.3,
                        }}
                        className={`h-2.5 rounded-full ${isActive ? activeColor : 'bg-text-secondary-light/30 dark:bg-text-secondary-dark/30'}`}
                    />
                );
            })}
        </div>
    );
};
