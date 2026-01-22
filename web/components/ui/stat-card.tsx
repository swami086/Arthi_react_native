'use client';

import { motion } from 'framer-motion';
import * as icons from 'lucide-react';
import { LucideIcon, TrendingUp, Activity } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface StatCardProps {
    title: string;
    value: string | number;
    icon: LucideIcon | string;
    iconColor?: string;
    growth?: string;
    growthLabel?: string;
    className?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
    title,
    value,
    icon,
    iconColor = '#30bae8',
    growth,
    growthLabel,
    className,
}) => {
    // Resolve icon string to component if needed
    let IconComp = icon;
    if (typeof icon === 'string') {
        IconComp = (icons as any)[icon] || Activity;
    }
    const Icon = IconComp as LucideIcon;

    return (
        <motion.div
            whileHover={{ y: -4 }}
            className={cn(
                'bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col',
                className
            )}
        >
            <div className="flex justify-between items-start mb-3">
                <div
                    className="p-2.5 rounded-xl bg-opacity-10"
                    style={{ backgroundColor: `${iconColor}20` }}
                >
                    <Icon size={22} color={iconColor} />
                </div>
                {growth && (
                    <div className="flex items-center bg-green-50 dark:bg-green-900/30 px-2 py-1 rounded-full border border-green-100 dark:border-green-800/50">
                        <TrendingUp size={12} className="text-green-600 dark:text-green-400" />
                        <span className="text-green-700 dark:text-green-400 text-[10px] font-bold ml-1">
                            {growth}
                        </span>
                    </div>
                )}
            </div>

            <div className="flex flex-col gap-0.5">
                <p className="text-gray-500 dark:text-gray-400 text-xs font-semibold uppercase tracking-wider">
                    {title}
                </p>
                <h3 className="text-gray-900 dark:text-white text-2xl font-black tabular-nums">
                    {value}
                </h3>
                {growthLabel && (
                    <p className="text-gray-400 dark:text-gray-500 text-[10px] font-medium mt-1">
                        {growthLabel}
                    </p>
                )}
            </div>
        </motion.div>
    );
};

StatCard.displayName = 'StatCard';
