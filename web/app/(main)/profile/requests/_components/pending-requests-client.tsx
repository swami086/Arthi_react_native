'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Inbox, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PendingTherapistRequestCard } from '@/components/ui/pending-therapist-request-card';
import { usePendingTherapistRequests } from '@/hooks/use-pending-therapist-requests';
import { slideUp, staggerContainer, fadeIn } from '@/lib/animation-variants';

interface PendingRequestsClientProps {
    user: any;
    initialRequests: any[];
}

export default function PendingRequestsClient({ user, initialRequests }: PendingRequestsClientProps) {
    const router = useRouter();
    const { requests, loading, processingId, acceptRequest, declineRequest } = usePendingTherapistRequests(user.id);

    // Use initial requests while loading
    const displayRequests = requests.length > 0 ? requests : (loading ? initialRequests : []);

    return (
        <motion.div
            className="max-w-4xl mx-auto px-6 py-8 space-y-8"
            initial="initial"
            animate="animate"
            variants={staggerContainer}
        >
            {/* Header */}
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => router.back()}>
                    <ArrowLeft className="h-5 w-5" />
                </Button>
                <h1 className="text-2xl font-bold tracking-tight">Therapist Requests</h1>
            </div>

            <AnimatePresence mode="popLayout">
                {displayRequests.length > 0 ? (
                    <motion.div
                        className="grid gap-4"
                        variants={fadeIn}
                    >
                        {displayRequests.map((request) => (
                            <motion.div
                                key={request.id}
                                variants={slideUp}
                                layout
                            >
                                <PendingTherapistRequestCard
                                    request={request}
                                    onAccept={() => acceptRequest(request.id)}
                                    onDecline={() => declineRequest(request.id)}
                                    isProcessing={processingId === request.id}
                                />
                            </motion.div>
                        ))}
                    </motion.div>
                ) : !loading ? (
                    <motion.div
                        variants={fadeIn}
                        className="flex flex-col items-center justify-center py-20 px-6 text-center space-y-4 bg-gray-50 dark:bg-gray-900 border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-3xl"
                    >
                        <div className="bg-white dark:bg-gray-800 p-4 rounded-full shadow-sm">
                            <Inbox className="h-8 w-8 text-gray-300" />
                        </div>
                        <div className="space-y-1">
                            <h3 className="text-lg font-bold text-gray-700 dark:text-gray-300">No Pending Requests</h3>
                            <p className="text-sm text-gray-500 max-w-xs">
                                When therapists request to connect with you, they'll appear here.
                            </p>
                        </div>
                        <Button variant="outline" onClick={() => router.push('/therapists')}>
                            Browse Therapists
                        </Button>
                    </motion.div>
                ) : (
                    <div className="flex justify-center py-20">
                        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                    </div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}
