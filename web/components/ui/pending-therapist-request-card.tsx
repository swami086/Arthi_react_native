
import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Check, X, Clock, MessageSquare, Star } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface Therapist {
    id: string;
    full_name: string;
    specialization: string;
    avatar_url?: string;
    expertise_areas?: string[];
    rating?: number;
}

interface RequestData {
    id: string;
    created_at: string;
    therapist: Therapist;
    notes?: string;
    status: string;
}

interface PendingTherapistRequestCardProps {
    request: RequestData;
    onAccept: () => void;
    onDecline: () => void;
    isProcessing?: boolean;
}

export function PendingTherapistRequestCard({
    request,
    onAccept,
    onDecline,
    isProcessing = false
}: PendingTherapistRequestCardProps) {
    return (
        <div className="bg-white dark:bg-white/5 rounded-2xl p-4 border border-orange-200 dark:border-orange-500/20 shadow-sm">
            <div className="flex gap-4">
                <div className="relative shrink-0">
                    <img
                        src={request.therapist.avatar_url || 'https://via.placeholder.com/150'}
                        alt={request.therapist.full_name}
                        className="w-12 h-12 rounded-full object-cover border border-orange-100 dark:border-orange-500/30"
                    />
                    <div className="absolute -bottom-1 -right-1 bg-orange-100 dark:bg-orange-900/50 text-orange-600 dark:text-orange-400 text-[10px] font-bold px-1.5 py-0.5 rounded-full border border-white dark:border-gray-900 flex items-center gap-0.5">
                        <Star className="w-2.5 h-2.5 fill-current" />
                        {request.therapist.rating?.toFixed(1) || 'New'}
                    </div>
                </div>

                <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                        <div>
                            <h4 className="font-bold text-gray-900 dark:text-white truncate">
                                {request.therapist.full_name}
                            </h4>
                            <p className="text-xs text-gray-500 dark:text-gray-400 font-medium truncate">
                                {request.therapist.specialization}
                            </p>
                        </div>
                        <span className="text-[10px] font-medium text-orange-600/70 dark:text-orange-400/70 bg-orange-50 dark:bg-orange-500/10 px-2 py-1 rounded-full whitespace-nowrap">
                            {formatDistanceToNow(new Date(request.created_at), { addSuffix: true })}
                        </span>
                    </div>

                    {request.notes && (
                        <div className="mt-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl p-3 text-xs text-gray-600 dark:text-gray-300 italic relative">
                            <MessageSquare className="w-3 h-3 text-gray-400 absolute top-3 left-3" />
                            <p className="pl-5 line-clamp-2">"{request.notes}"</p>
                        </div>
                    )}

                    <div className="mt-4 flex gap-2">
                        <Button
                            className="flex-1 h-9 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-900 dark:text-white border-0 font-bold text-xs rounded-xl"
                            onClick={onDecline}
                            disabled={isProcessing}
                        >
                            <X className="w-3.5 h-3.5 mr-1.5" />
                            Decline
                        </Button>
                        <Button
                            className="flex-1 h-9 bg-orange-500 hover:bg-orange-600 text-white border-0 font-bold text-xs rounded-xl shadow-lg shadow-orange-500/20"
                            onClick={onAccept}
                            disabled={isProcessing}
                        >
                            {isProcessing ? (
                                <div className="animate-spin rounded-full h-3.5 w-3.5 border-2 border-white/30 border-t-white" />
                            ) : (
                                <>
                                    <Check className="w-3.5 h-3.5 mr-1.5" />
                                    Accept
                                </>
                            )}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
