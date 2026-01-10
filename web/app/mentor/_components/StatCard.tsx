'use client';

import { motion } from 'framer-motion';
import { LucideIcon, ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatCardProps {
    title: string;
    value: string | number;
    icon: LucideIcon;
    trend?: {
        value: number;
        label: string;
        direction: 'up' | 'down' | 'neutral';
    };
    color?: string; // class for bg/text color theme
    delay?: number;
}

export function StatCard({ title, value, icon: Icon, trend, color = "text-primary", delay = 0 }: StatCardProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay }}
            className="bg-white dark:bg-gray-900 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-800"
        >
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</p>
                    <h3 className="mt-2 text-2xl font-bold text-gray-900 dark:text-white">{value}</h3>
                </div>
                <div className={cn("p-2 rounded-lg bg-opacity-10 dark:bg-opacity-20", color.replace('text-', 'bg-'))}>
                    <Icon className={cn("h-5 w-5", color)} />
                </div>
            </div>

            {trend && (
                <div className="mt-4 flex items-center text-sm">
                    <span className={cn(
                        "flex items-center font-medium",
                        trend.direction === 'up' ? "text-green-600" :
                            trend.direction === 'down' ? "text-red-600" : "text-gray-500"
                    )}>
                        {trend.direction === 'up' && <ArrowUpRight className="mr-1 h-4 w-4" />}
                        {trend.direction === 'down' && <ArrowDownRight className="mr-1 h-4 w-4" />}
                        {trend.direction === 'neutral' && <Minus className="mr-1 h-4 w-4" />}
                        {Math.abs(trend.value)}%
                    </span>
                    <span className="ml-2 text-gray-500 dark:text-gray-400">{trend.label}</span>
                </div>
            )}
        </motion.div>
    );
}
