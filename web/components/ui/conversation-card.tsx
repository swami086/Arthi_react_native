'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { CheckCheck } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface ConversationCardProps {
    name: string;
    avatarUrl?: string;
    lastMessage: string;
    timestamp: string;
    unreadCount?: number;
    isOnline?: boolean;
    onClick: () => void;
    className?: string;
}

export const ConversationCard: React.FC<ConversationCardProps> = ({
    name,
    avatarUrl,
    lastMessage,
    timestamp,
    unreadCount = 0,
    isOnline = false,
    onClick,
    className,
}) => {
    const date = new Date(timestamp);
    const timeAgo = formatDistanceToNow(date, { addSuffix: true }).replace('about ', '');

    return (
        <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            whileTap={{ scale: 0.98 }}
            onClick={onClick}
            className={cn(
                'group flex items-center p-4 mb-2 rounded-2xl cursor-pointer transition-all duration-200',
                unreadCount > 0
                    ? 'bg-primary/5 dark:bg-primary/10 hover:bg-primary/10 dark:hover:bg-primary/20'
                    : 'bg-white dark:bg-[#1a2c32] hover:bg-gray-50 dark:hover:bg-[#233840] border border-gray-100 dark:border-border-dark',
                className
            )}
        >
            <div className="relative mr-4 flex-shrink-0">
                <div className="w-14 h-14 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden border border-gray-100 dark:border-gray-700">
                    {avatarUrl ? (
                        <div className="relative w-full h-full">
                            <Image
                                src={avatarUrl}
                                alt={name}
                                fill
                                className="object-cover"
                                sizes="56px"
                            />
                        </div>
                    ) : (
                        <div className="w-full h-full flex items-center justify-center bg-primary/10 dark:bg-primary/20">
                            <span className="text-xl font-black text-primary">{name.charAt(0)}</span>
                        </div>
                    )}
                </div>
                {isOnline && (
                    <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 rounded-full border-2 border-white dark:border-[#1a2c32] shadow-sm" />
                )}
            </div>

            <div className="flex-1 min-w-0">
                <div className="flex justify-between items-center mb-1 gap-2">
                    <h4 className={cn(
                        'text-base leading-none truncate',
                        unreadCount > 0 ? 'text-gray-900 dark:text-gray-100 font-black' : 'text-gray-700 dark:text-gray-300 font-bold'
                    )}>
                        {name}
                    </h4>
                    <span className={cn(
                        'text-[10px] uppercase font-black tracking-widest whitespace-nowrap',
                        unreadCount > 0 ? 'text-primary' : 'text-gray-400 dark:text-gray-500'
                    )}>
                        {timeAgo}
                    </span>
                </div>

                <div className="flex justify-between items-center gap-3">
                    <p className={cn(
                        'text-sm leading-tight truncate flex-1',
                        unreadCount > 0 ? 'text-gray-900 dark:text-gray-100 font-bold' : 'text-gray-500 dark:text-gray-400 font-medium'
                    )}>
                        {lastMessage}
                    </p>

                    {unreadCount > 0 ? (
                        <motion.div
                            initial={{ scale: 0.5 }}
                            animate={{ scale: 1 }}
                            className="bg-primary rounded-full min-w-[20px] h-5 flex items-center justify-center px-1.5 shadow-sm shadow-primary/20"
                        >
                            <span className="text-white text-[10px] font-black">{unreadCount}</span>
                        </motion.div>
                    ) : (
                        <CheckCheck size={16} className="text-primary opacity-60 flex-shrink-0" />
                    )}
                </div>
            </div>
        </motion.div>
    );
};
