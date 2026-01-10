'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, Video, AlertCircle, Calendar } from 'lucide-react';
import { GradientAvatar } from './gradient-avatar';
import { toast } from 'sonner';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { reportError } from '@/lib/rollbar-utils';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface SessionCardProps {
    title: string;
    date: string;
    duration: string;
    status: 'confirmed' | 'pending' | 'completed' | 'cancelled';
    menteeName: string;
    menteeAvatar?: string | null;
    meetingLink?: string | null;
    feedback?: string | null;
    onClick: () => void;
    className?: string;
}

const statusColors = {
    confirmed: '#10b981', // success
    pending: '#f59e0b',   // warning
    completed: '#3b82f6', // info
    cancelled: '#ef4444', // error
};

export const SessionCard: React.FC<SessionCardProps> = ({
    title,
    date,
    duration,
    status,
    menteeName,
    menteeAvatar,
    meetingLink,
    feedback,
    onClick,
    className,
}) => {
    const statusColor = statusColors[status] || '#94a3b8';

    const handleJoinMeeting = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (meetingLink) {
            try {
                window.open(meetingLink, '_blank', 'noopener,noreferrer');
            } catch (error) {
                reportError(error, 'session_card.join_link');
                toast.error('Could not open meeting link');
            }
        }
    };

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -2 }}
            className={cn(
                'group bg-white dark:bg-[#1a2c32] p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-border-dark flex flex-col relative overflow-hidden transition-all duration-200 cursor-pointer border-l-[6px]',
                className
            )}
            style={{ borderLeftColor: statusColor }}
            onClick={onClick}
        >
            <div className="flex justify-between items-start mb-3 gap-3">
                <div className="flex-1">
                    <h3 className="font-bold text-gray-900 dark:text-gray-100 text-lg leading-tight group-hover:text-primary transition-colors">
                        {title}
                    </h3>
                    <div className="flex items-center mt-2 gap-2">
                        <Calendar size={14} className="text-gray-400 dark:text-gray-500" />
                        <span className="text-gray-500 dark:text-gray-400 text-sm font-medium">
                            {date} • {duration}
                        </span>
                    </div>
                </div>

                <div
                    className="px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-widest border"
                    style={{
                        backgroundColor: `${statusColor}10`,
                        color: statusColor,
                        borderColor: `${statusColor}20`
                    }}
                >
                    {status}
                </div>
            </div>

            <div className="flex items-center mt-3 pt-3 border-t border-gray-50 dark:border-border-dark justify-between">
                <div className="flex items-center gap-2.5">
                    <GradientAvatar
                        src={menteeAvatar || 'https://via.placeholder.com/150'}
                        alt={menteeName}
                        size={32}
                    />
                    <span className="text-gray-700 dark:text-gray-300 text-sm font-bold">
                        with {menteeName}
                    </span>
                </div>

                <AnimatePresence>
                    {status === 'confirmed' && meetingLink && (
                        <motion.button
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={handleJoinMeeting}
                            className="bg-primary hover:bg-primary-dark text-white flex items-center px-4 py-2 rounded-xl shadow-md transition-all duration-200"
                        >
                            <Video size={16} className="mr-2" />
                            <span className="font-bold text-xs">Join</span>
                        </motion.button>
                    )}
                </AnimatePresence>
            </div>

            {feedback && (status === 'completed' || status === 'confirmed') && (
                <div className="mt-3 bg-gray-50 dark:bg-gray-800/50 p-3 rounded-xl border border-gray-100 dark:border-gray-700/50 group-hover:bg-primary/5 transition-colors">
                    <p className="text-gray-600 dark:text-gray-400 text-xs italic leading-relaxed line-clamp-2">
                        "{feedback}"
                    </p>
                </div>
            )}
        </motion.div>
    );
};
