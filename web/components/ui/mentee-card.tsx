'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Calendar, MessageCircle, User, UserMinus } from 'lucide-react';
import { GradientAvatar } from './gradient-avatar';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface MenteeCardProps {
    name: string;
    age?: number | null;
    education?: string | null;
    avatar?: string | null;
    status: string;
    statusColor: string;
    nextInfo?: string;
    onMessage: () => void;
    onViewProfile: () => void;
    onRemove?: () => void;
    className?: string;
}

export const MenteeCard: React.FC<MenteeCardProps> = ({
    name,
    age,
    education,
    avatar,
    status,
    statusColor,
    nextInfo,
    onMessage,
    onViewProfile,
    onRemove,
    className,
}) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -2 }}
            className={cn(
                'group bg-white dark:bg-[#1a2c32] p-4 rounded-2xl mb-3 shadow-sm border border-gray-100 dark:border-border-dark flex items-start sm:items-center gap-5 transition-all duration-300 hover:shadow-md hover:border-primary/20 cursor-pointer',
                className
            )}
            onClick={onViewProfile}
        >
            <div className="flex-shrink-0">
                <GradientAvatar
                    src={avatar || 'https://via.placeholder.com/150'}
                    alt={name}
                    size={72}
                    online={true}
                />
            </div>

            <div className="flex-1 flex flex-col gap-2 min-w-0">
                <div className="flex flex-col sm:flex-row justify-between items-start gap-2">
                    <div className="min-w-0">
                        <h3 className="text-gray-900 dark:text-gray-100 font-black text-lg leading-none group-hover:text-primary transition-colors truncate">
                            {name}
                        </h3>
                        <p className="text-gray-400 dark:text-gray-500 text-xs font-bold mt-1.5 uppercase tracking-wide">
                            {age ? `${age} yrs` : ''}
                            {education ? ` • ${education}` : ''}
                        </p>
                    </div>

                    <div
                        className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border"
                        style={{
                            backgroundColor: `${statusColor}10`,
                            borderColor: `${statusColor}20`,
                            color: statusColor
                        }}
                    >
                        {status}
                    </div>
                </div>

                {nextInfo && (
                    <div className="flex items-center gap-1.5 p-2 rounded-xl bg-gray-50 dark:bg-gray-800/50 w-fit">
                        <Calendar size={12} className="text-gray-400 dark:text-gray-500" />
                        <span className="text-gray-500 dark:text-gray-400 text-[11px] font-bold leading-none">
                            {nextInfo}
                        </span>
                    </div>
                )}

                <div className="flex flex-wrap gap-2 mt-1">
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={(e) => { e.stopPropagation(); onMessage(); }}
                        className="flex-1 min-w-[100px] h-10 bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl flex items-center justify-center gap-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    >
                        <MessageCircle size={14} className="text-gray-600 dark:text-gray-400" />
                        <span className="text-gray-700 dark:text-gray-300 font-black text-[11px] uppercase tracking-wider">Message</span>
                    </motion.button>

                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={(e) => { e.stopPropagation(); onViewProfile(); }}
                        className="flex-1 min-w-[100px] h-10 bg-primary/10 hover:bg-primary/20 dark:bg-primary/5 dark:hover:bg-primary/10 text-primary rounded-xl flex items-center justify-center gap-2 transition-colors"
                    >
                        <User size={14} className="fill-primary/20" />
                        <span className="font-black text-[11px] uppercase tracking-wider">Profile</span>
                    </motion.button>

                    {onRemove && (
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={(e) => { e.stopPropagation(); onRemove(); }}
                            className="w-10 h-10 bg-red-50 hover:bg-red-100 dark:bg-red-500/10 dark:hover:bg-red-500/20 text-red-500 rounded-xl flex items-center justify-center transition-colors border border-red-500/10"
                        >
                            <UserMinus size={16} />
                        </motion.button>
                    )}
                </div>
            </div>
        </motion.div>
    );
};
