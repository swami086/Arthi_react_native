'use client';

import { motion } from 'framer-motion';
import { Calendar, Clock, Video, MoreVertical, X, Check } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { GradientAvatar } from '@/components/ui/gradient-avatar';
// Assuming TagPill exists or just use Badge
import { TagPill } from '@/components/ui/tag-pill';

interface AppointmentCardProps {
    appointment: any; // Ideally typed from database
    variant?: 'upcoming' | 'past';
    onJoin?: () => void;
    onCancel?: () => void;
    onConfirm?: () => void; // For pending state
}

export default function AppointmentCard({
    appointment,
    variant = 'upcoming',
    onJoin,
    onCancel,
    onConfirm
}: AppointmentCardProps) {
    const { therapist, start_time, end_time, status, meeting_link } = appointment;
    const startDate = new Date(start_time);
    const dateStr = format(startDate, 'EEE, MMM d, yyyy');
    const timeStr = `${format(startDate, 'h:mm a')} - ${format(new Date(end_time), 'h:mm a')}`;

    const isPending = status === 'pending';
    const isConfirmed = status === 'confirmed';

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-card border border-border rounded-xl p-4 shadow-sm mb-4"
        >
            <div className="flex justify-between items-start mb-3">
                <div className="flex gap-3">
                    <GradientAvatar
                        src={therapist.avatar_url}
                        size={48}
                        alt={therapist.full_name}
                    />
                    <div>
                        <h3 className="font-semibold text-foreground">{therapist.full_name}</h3>
                        <p className="text-sm text-muted-foreground">{therapist.specialization || 'Therapist'}</p>
                    </div>
                </div>
                <TagPill
                    label={status}
                    color={isConfirmed ? 'green' : isPending ? 'orange' : 'gray'}
                />
            </div>

            <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="w-4 h-4" />
                    <span>{dateStr}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="w-4 h-4" />
                    <span>{timeStr}</span>
                </div>
                {meeting_link && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Video className="w-4 h-4" />
                        <span>Google Meet</span>
                    </div>
                )}
            </div>

            <div className="flex gap-2 justify-end">
                {variant === 'upcoming' && (
                    <>
                        {isPending && onCancel && (
                            <Button variant="outline" size="sm" onClick={onCancel} className="text-destructive border-destructive/50 hover:bg-destructive/10">
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
}
