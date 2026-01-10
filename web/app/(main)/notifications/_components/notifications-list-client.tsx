'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, CheckCircle2, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNotifications } from '@/hooks/use-notifications';
import NotificationCard from './notification-card';
import { useRouter } from 'next/navigation';

interface NotificationsListClientProps {
    initialNotifications: any[];
}

export default function NotificationsListClient({ initialNotifications }: NotificationsListClientProps) {
    const { notifications, loading, markAsRead, markAllAsRead, refetch } = useNotifications();
    const router = useRouter();

    const displayNotifications = notifications.length > 0 ? notifications : initialNotifications;

    const handleNotificationClick = (n: any) => {
        markAsRead(n.id);

        // Navigation logic based on notification type
        if (n.type === 'message' && n.related_entity_id) {
            router.push(`/messages/${n.related_entity_id}`);
        } else if (n.type === 'appointment') {
            router.push('/appointments');
        } else if (n.type === 'payment') {
            router.push('/payment/history');
        }
    };

    return (
        <div className="max-w-3xl mx-auto space-y-8 pb-32 p-4 md:p-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-4xl font-black text-gray-900 dark:text-white tracking-tight">
                        Feed
                    </h1>
                    <p className="text-gray-500 font-bold uppercase tracking-[0.2em] text-[10px] mt-1 pl-1">
                        YOUR ACTIVITY HUB
                    </p>
                </div>

                <Button
                    variant="ghost"
                    onClick={markAllAsRead}
                    disabled={!displayNotifications.some(n => !n.is_read)}
                    className="rounded-2xl h-12 px-5 font-black text-xs gap-2 hover:bg-primary/5 hover:text-primary transition-all uppercase tracking-widest"
                >
                    <CheckCircle2 className="h-4 w-4" />
                    Mark all read
                </Button>
            </div>

            {/* List */}
            <AnimatePresence mode="popLayout">
                {displayNotifications.length > 0 ? (
                    <div className="grid grid-cols-1">
                        {displayNotifications.map((n) => (
                            <NotificationCard
                                key={n.id}
                                notification={n}
                                onClick={() => handleNotificationClick(n)}
                            />
                        ))}
                    </div>
                ) : !loading ? (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="py-32 flex flex-col items-center text-center"
                    >
                        <div className="h-28 w-28 rounded-[3rem] bg-gray-50 dark:bg-gray-900 text-gray-300 dark:text-gray-700 flex items-center justify-center mb-8 relative">
                            <Bell className="h-12 w-12" />
                            <div className="absolute top-0 right-0 h-8 w-8 bg-white dark:bg-black rounded-full flex items-center justify-center shadow-lg border border-gray-100 dark:border-gray-800">
                                <span className="text-xl font-black text-gray-400">0</span>
                            </div>
                        </div>
                        <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-3">
                            All caught up!
                        </h3>
                        <p className="text-gray-500 font-bold max-w-xs mx-auto leading-relaxed">
                            No new notifications at the moment. We&apos;ll notify you when something important happens.
                        </p>
                    </motion.div>
                ) : (
                    <div className="space-y-4">
                        {[1, 2, 3, 4].map(i => (
                            <div key={i} className="h-28 w-full bg-gray-50 dark:bg-gray-900/50 rounded-[2rem] animate-pulse" />
                        ))}
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
