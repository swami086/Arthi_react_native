'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Calendar, MessageSquare, CreditCard, Info, Circle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface NotificationCardProps {
    notification: {
        id: string;
        title: string;
        message: string;
        type: 'appointment' | 'message' | 'system' | 'payment';
        is_read: boolean;
        created_at: string;
    };
    onClick: () => void;
}

const iconMap = {
    appointment: { icon: Calendar, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-900/20' },
    message: { icon: MessageSquare, color: 'text-primary', bg: 'bg-primary/5 dark:bg-primary/10' },
    payment: { icon: CreditCard, color: 'text-green-500', bg: 'bg-green-50 dark:bg-green-900/20' },
    system: { icon: Info, color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-900/20' },
};

export default function NotificationCard({ notification, onClick }: NotificationCardProps) {
    const { icon: Icon, color, bg } = iconMap[notification.type] || iconMap.system;
    const timeAgo = formatDistanceToNow(new Date(notification.created_at), { addSuffix: true });

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            whileTap={{ scale: 0.98 }}
            onClick={onClick}
            className={cn(
                'group flex items-start gap-4 p-5 rounded-[2rem] cursor-pointer transition-all duration-300 border mb-3 relative overflow-hidden',
                notification.is_read
                    ? 'bg-white dark:bg-[#1a2c32] border-gray-100 dark:border-border-dark hover:bg-gray-50 dark:hover:bg-[#233840]'
                    : 'bg-primary/[0.02] dark:bg-primary/[0.05] border-primary/10 dark:border-primary/20 hover:bg-primary/[0.05] dark:hover:bg-primary/10 shadow-lg shadow-primary/5'
            )}
        >
            {/* Unread Indicator Vertical Bar */}
            {!notification.is_read && (
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary" />
            )}

            <div className={cn('h-14 w-14 rounded-2xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-110 duration-500', bg)}>
                <Icon className={cn('h-6 w-6', color)} />
            </div>

            <div className="flex-1 min-w-0 py-1">
                <div className="flex justify-between items-start mb-1 gap-4">
                    <h4 className={cn(
                        'text-base leading-tight truncate',
                        notification.is_read ? 'text-gray-900 dark:text-gray-100 font-bold' : 'text-gray-900 dark:text-white font-black'
                    )}>
                        {notification.title}
                    </h4>
                    <span className="text-[10px] uppercase font-black tracking-widest text-gray-400 whitespace-nowrap">
                        {timeAgo}
                    </span>
                </div>
                <p className={cn(
                    'text-sm leading-relaxed line-clamp-2',
                    notification.is_read ? 'text-gray-500 dark:text-gray-400 font-medium' : 'text-gray-700 dark:text-gray-300 font-bold'
                )}>
                    {notification.message}
                </p>
            </div>

            {!notification.is_read && (
                <div className="flex-shrink-0 pt-1">
                    <Circle className="h-2.5 w-2.5 fill-primary text-primary" />
                </div>
            )}
        </motion.div>
    );
}
