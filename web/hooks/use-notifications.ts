'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { reportError } from '@/lib/rollbar-utils';

/**
 * Hook to manage notification state, unread counts, and real-time updates.
 * Refactored to use client-side Supabase instance instead of server actions.
 */
export function useNotifications() {
    const [notifications, setNotifications] = useState<any[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [currentUserId, setCurrentUserId] = useState<string | null>(null);

    const supabase = createClient();

    useEffect(() => {
        const init = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) setCurrentUserId(user.id);
        };
        init();
    }, [supabase]);

    const fetchNotifications = useCallback(async () => {
        if (!currentUserId) return;
        setLoading(true);
        setError(null);
        try {
            const { data, error: fetchError } = await supabase
                .from('notifications')
                .select('*')
                .eq('user_id', currentUserId)
                .order('created_at', { ascending: false });

            if (fetchError) throw fetchError;

            const results = data || [];
            setNotifications(results);
            setUnreadCount(results.filter((n: any) => !n.is_read).length);
        } catch (err: any) {
            setError(err.message);
            reportError(err, 'useNotifications.fetch');
        } finally {
            setLoading(false);
        }
    }, [currentUserId, supabase]);

    const handleMarkAsRead = async (notificationId: string) => {
        // Optimistic update
        setNotifications(prev => prev.map(n => n.id === notificationId ? { ...n, is_read: true } : n));
        setUnreadCount(prev => Math.max(0, prev - 1));

        try {
            const { error: updateError } = await (supabase
                .from('notifications') as any)
                .update({ is_read: true })
                .eq('id', notificationId);

            if (updateError) throw updateError;
        } catch (err) {
            reportError(err, 'useNotifications.markRead');
            fetchNotifications(); // Sync back on error
        }
    };

    const handleMarkAllAsRead = async () => {
        if (!currentUserId) return;

        setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
        setUnreadCount(0);

        try {
            const { error: updateError } = await (supabase
                .from('notifications') as any)
                .update({ is_read: true })
                .eq('user_id', currentUserId);

            if (updateError) throw updateError;
        } catch (err) {
            reportError(err, 'useNotifications.markAllRead');
            fetchNotifications();
        }
    };

    useEffect(() => {
        if (!currentUserId) return;

        fetchNotifications();

        // Listen for ANY changes to notifications for the user
        const channel = supabase
            .channel('notifications-realtime-feed')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'notifications',
                    filter: `user_id=eq.${currentUserId}`
                },
                () => {
                    fetchNotifications();
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [currentUserId, fetchNotifications, supabase]);

    return {
        notifications,
        unreadCount,
        loading,
        error,
        markAsRead: handleMarkAsRead,
        markAllAsRead: handleMarkAllAsRead,
        refetch: fetchNotifications
    };
}
