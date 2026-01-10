'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface EarningsCardProps {
    title: string;
    amount: number;
    currency?: string;
    trend?: number;
    icon: LucideIcon;
    color: string;
    delay?: number;
    className?: string;
}

export const EarningsCard: React.FC<EarningsCardProps> = ({
    title,
    amount,
    currency = '₹',
    trend,
    icon: Icon,
    color,
    delay = 0,
    className,
}) => {
    const isPositive = trend !== undefined && trend >= 0;

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{
                type: 'spring',
                stiffness: 260,
                damping: 20,
                delay
            }}
            whileHover={{ y: -4, transition: { duration: 0.2 } }}
            className={cn(
                'bg-white dark:bg-[#1a2c32] rounded-3xl p-5 shadow-sm min-w-[180px] border border-gray-100 dark:border-border-dark flex flex-col transition-all duration-300 hover:shadow-lg hover:shadow-primary/5',
                className
            )}
        >
            <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4 transition-transform duration-300 group-hover:scale-110"
                style={{ backgroundColor: `${color}15` }}
            >
                <Icon size={24} color={color} className="stroke-[2.5px]" />
            </div>

            <p className="text-gray-500 dark:text-gray-400 text-xs font-bold uppercase tracking-wider mb-1.5 truncate">
                {title}
            </p>

            <div className="flex items-baseline gap-0.5 mb-3">
                <span className="text-gray-900 dark:text-gray-100 text-2xl font-black tabular-nums leading-none">
                    {currency}{amount.toLocaleString('en-IN')}
                </span>
            </div>

            {trend !== undefined && (
                <div className="flex items-center gap-1.5 mt-auto">
                    <div className={cn(
                        'flex items-center p-0.5 rounded-md',
                        isPositive ? 'bg-green-100/50 dark:bg-green-500/10' : 'bg-red-100/50 dark:bg-red-500/10'
                    )}>
                        {isPositive ? (
                            <TrendingUp size={12} className="text-green-600 dark:text-green-400 stroke-[3px]" />
                        ) : (
                            <TrendingDown size={12} className="text-red-600 dark:text-red-400 stroke-[3px]" />
                        )}
                    </div>
                    <p className={cn(
                        'text-xs font-black leading-none tabular-nums',
                        isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                    )}>
                        {Math.abs(trend)}%
                    </p>
                    <span className="text-gray-400 dark:text-gray-500 text-[10px] font-bold uppercase tracking-tighter opacity-80">
                        vs last mo
                    </span>
                </div>
            )}
        </motion.div>
    );
};
