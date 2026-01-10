'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { X, Check, Info } from 'lucide-react';
import { Button } from './button';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { reportError } from '@/lib/rollbar-utils';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface PendingMentorRequestCardProps {
    request: any;
    onAccept: (id: string) => void;
    onDecline: (id: string) => void;
    isProcessing: boolean;
    className?: string;
}

export const PendingMentorRequestCard: React.FC<PendingMentorRequestCardProps> = ({
    request,
    onAccept,
    onDecline,
    isProcessing,
    className,
}) => {
    const mentor = request.mentor;

    const handleAccept = async () => {
        try {
            await onAccept(request.id);
        } catch (error) {
            reportError(error, 'mentor_request.accept');
        }
    };

    const handleDecline = async () => {
        try {
            await onDecline(request.id);
        } catch (error) {
            reportError(error, 'mentor_request.decline');
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn(
                'bg-white dark:bg-[#1a2c32] p-5 rounded-3xl shadow-sm border border-gray-100 dark:border-border-dark mb-4 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5',
                className
            )}
        >
            <div className="flex items-start mb-4 gap-4">
                <div className="h-14 w-14 rounded-2xl bg-gray-100 dark:bg-gray-800 overflow-hidden flex-shrink-0 border border-gray-100 dark:border-gray-700">
                    {mentor?.avatar_url ? (
                        <div className="relative w-full h-full">
                            <Image
                                src={mentor.avatar_url}
                                alt={mentor.full_name}
                                fill
                                className="object-cover"
                                sizes="56px"
                            />
                        </div>
                    ) : (
                        <div className="h-full w-full flex items-center justify-center bg-primary/10 dark:bg-primary/20">
                            <span className="text-xl font-black text-primary">
                                {mentor?.full_name?.charAt(0) || '?'}
                            </span>
                        </div>
                    )}
                </div>

                <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start gap-2">
                        <h4 className="font-black text-lg text-gray-900 dark:text-gray-100 leading-none truncate">
                            {mentor?.full_name || 'Unknown Mentor'}
                        </h4>
                        <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 dark:text-gray-500 whitespace-nowrap pt-1">
                            {new Date(request.created_at).toLocaleDateString()}
                        </span>
                    </div>
                    <p className="text-xs font-bold text-primary uppercase tracking-widest mt-1.5 opacity-80">
                        {mentor?.specialization || 'Mentor Application'}
                    </p>
                </div>
            </div>

            {request.notes && (
                <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-2xl mb-4 border border-gray-100/50 dark:border-gray-700/30">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400 italic leading-relaxed">
                        "{request.notes}"
                    </p>
                </div>
            )}

            {mentor?.expertise_areas && (
                <div className="flex flex-wrap gap-2 mb-5">
                    {mentor.expertise_areas.slice(0, 3).map((area: string, i: number) => (
                        <div key={i} className="bg-primary/5 dark:bg-primary/10 px-2.5 py-1 rounded-lg border border-primary/10">
                            <span className="text-[10px] font-black uppercase tracking-wider text-primary">{area}</span>
                        </div>
                    ))}
                    {mentor.expertise_areas.length > 3 && (
                        <div className="bg-gray-50 dark:bg-gray-800 px-2.5 py-1 rounded-lg border border-gray-100 dark:border-gray-700">
                            <span className="text-[10px] font-black text-gray-400 dark:text-gray-500">+{mentor.expertise_areas.length - 3} More</span>
                        </div>
                    )}
                </div>
            )}

            <div className="flex gap-3 pt-2">
                <Button
                    variant="outline"
                    onClick={handleDecline}
                    isLoading={isProcessing}
                    disabled={isProcessing}
                    className="flex-1 h-12 rounded-2xl text-red-500 border-red-100 dark:border-red-900/30 hover:bg-red-50 dark:hover:bg-red-500/10 hover:border-red-200 transition-all font-black uppercase tracking-widest text-[11px]"
                    leftIcon={<X size={16} />}
                >
                    Decline
                </Button>

                <Button
                    onClick={handleAccept}
                    isLoading={isProcessing}
                    disabled={isProcessing}
                    className="flex-1 h-12 rounded-2xl shadow-lg shadow-primary/20 font-black uppercase tracking-widest text-[11px]"
                    leftIcon={<Check size={16} />}
                >
                    Accept
                </Button>
            </div>
        </motion.div>
    );
};
