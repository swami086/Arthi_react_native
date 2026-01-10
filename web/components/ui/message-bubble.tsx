'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Check, CheckCheck } from 'lucide-react';
import { format } from 'date-fns';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface MessageBubbleProps {
    content: string;
    timestamp: string;
    isMyMessage: boolean;
    isRead?: boolean;
    className?: string;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({
    content,
    timestamp,
    isMyMessage,
    isRead = false,
    className,
}) => {
    return (
        <motion.div
            initial={{ opacity: 0, x: isMyMessage ? 20 : -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
            className={cn(
                'max-w-[85%] sm:max-w-[70%] mb-4 px-4 py-3 shadow-sm flex flex-col',
                isMyMessage
                    ? 'bg-primary self-end rounded-2xl rounded-br-[4px] shadow-primary/10'
                    : 'bg-white dark:bg-[#1a2c32] self-start rounded-2xl rounded-bl-[4px] border border-gray-100 dark:border-border-dark',
                className
            )}
        >
            <p className={cn(
                'text-sm sm:text-base leading-relaxed break-words font-medium',
                isMyMessage ? 'text-white' : 'text-gray-800 dark:text-gray-200'
            )}>
                {content}
            </p>

            <div className={cn(
                'flex items-center mt-1.5 gap-1.5',
                isMyMessage ? 'justify-end' : 'justify-start'
            )}>
                <span className={cn(
                    'text-[10px] uppercase font-black tracking-widest leading-none',
                    isMyMessage ? 'text-white/70' : 'text-gray-400 dark:text-gray-500'
                )}>
                    {format(new Date(timestamp), 'h:mm a')}
                </span>

                {isMyMessage && (
                    <div className="flex-shrink-0">
                        {isRead ? (
                            <CheckCheck size={12} className="text-white fill-white/20" />
                        ) : (
                            <Check size={12} className="text-white/60" />
                        )}
                    </div>
                )}
            </div>
        </motion.div>
    );
};
