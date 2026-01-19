'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, Video } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { GradientAvatar } from '@/components/ui/gradient-avatar';
import { TagPill } from '@/components/ui/tag-pill';

interface AppointmentCardProps {
    appointment: any; // Ideally typed from database
    variant?: 'upcoming' | 'past';
    onJoin?: () => void;
    onCancel?: () => void;
    onConfirm?: () => void; // For pending state
    className?: string;
}

/**
 * AppointmentCard component for displaying scheduled therapy sessions.
 * Integrated with A2UI component catalog.
 */
export const AppointmentCard: React.FC<AppointmentCardProps> = ({
    appointment,
    variant = 'upcoming',
    onJoin,
    onCancel,
    onConfirm,
    className
}) => {
    if (!appointment || !appointment.therapist) return null;

    const { therapist, start_time, end_time, status, meeting_link } = appointment;
    const startDate = new Date(start_time);
    const dateStr = format(startDate, 'EEE, MMM d, yyyy');
    const timeStr = `${format(startDate, 'h:mm a')} - ${format(new Date(end_time), 'h:mm a')}`;

    const isPending = status === 'pending';
    const isConfirmed = status === 'confirmed';

    const statusColorMap = {
        confirmed: 'green',
        pending: 'orange',
        completed: 'blue',
        cancelled: 'gray'
    };

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn(
                "group bg-white dark:bg-[#1a2c32] p-5 rounded-3xl shadow-sm border border-gray-100 dark:border-border-dark flex flex-col transition-all duration-300 hover:shadow-xl hover:shadow-primary/5",
                className
            )}
        >
            <div className="flex justify-between items-start mb-4">
                <div className="flex gap-4">
                    <GradientAvatar
                        src={therapist.avatar_url || 'https://via.placeholder.com/150'}
                        size={56}
                        alt={therapist.full_name}
                    />
                    <div>
                        <span className="text-primary font-black text-[10px] uppercase tracking-[0.1em] mb-1 block">
                            {therapist.specialization || 'Therapist'}
                        </span>
                        <h3 className="text-lg font-black text-gray-900 dark:text-gray-100 leading-tight group-hover:text-primary transition-colors">
                            {therapist.full_name}
                        </h3>
                    </div>
                </div>
                <TagPill
                    label={status}
                    color={(statusColorMap[status as keyof typeof statusColorMap] as any) || 'gray'}
                />
            </div>

            <div className="space-y-3 mb-5 px-1">
                <div className="flex items-center gap-3 text-sm font-medium text-gray-500 dark:text-gray-400">
                    <Calendar className="w-4 h-4 text-primary" />
                    <span>{dateStr}</span>
                </div>
                <div className="flex items-center gap-3 text-sm font-medium text-gray-500 dark:text-gray-400">
                    <Clock className="w-4 h-4 text-primary" />
                    <span>{timeStr}</span>
                </div>
                {meeting_link && (
                    <div className="flex items-center gap-3 text-sm font-medium text-gray-500 dark:text-gray-400">
                        <Video className="w-4 h-4 text-primary" />
                        <span className="text-primary font-bold">Virtual Session</span>
                    </div>
                )}
            </div>

            <div className="flex gap-3 justify-end pt-4 border-t border-gray-50 dark:border-border-dark">
                {variant === 'upcoming' && (
                    <>
                        {isPending && onCancel && (
                            <Button variant="outline" size="sm" onClick={onCancel} className="text-red-500 border-red-500/50 hover:bg-red-500/10">
                                Decline
                            </Button>
                        )}
                        {isPending && onConfirm && (
                            <Button size="sm" onClick={onConfirm}>
                                Confirm
                            </Button>
                        )}
                        {isConfirmed && onJoin && (
                            <Button size="sm" className="w-full sm:w-auto" onClick={onJoin}>
                                <Video className="w-4 h-4 mr-2" />
                                Join Session
                            </Button>
                        )}
                    </>
                )}
                {variant === 'past' && (
                    <Button variant="outline" size="sm">
                        View Details
                    </Button>
                )}
            </div>
        </motion.div>
    );
};

AppointmentCard.displayName = 'AppointmentCard';
