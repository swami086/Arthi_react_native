'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { reportError } from '@/lib/rollbar-utils';

/**
 * Hook to track unread counts for messages and notifications across the application.
 */
export function useUnreadCounts() {
    const [unreadMessages, setUnreadMessages] = useState(0);
    const [unreadNotifications, setUnreadNotifications] = useState(0);
    const [pendingRequests, setPendingRequests] = useState(0);
    const supabase = createClient();

    const fetchCounts = useCallback(async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const [msgRes, notifRes, reqRes] = await Promise.all([
                supabase
                    .from('messages')
                    .select('id', { count: 'exact', head: true })
                    .eq('receiver_id', user.id)
                    .eq('is_read', false),
                supabase
                    .from('notifications')
                    .select('id', { count: 'exact', head: true })
                    .eq('user_id', user.id)
                    .eq('is_read', false),
                supabase
                    .from('mentor_mentee_relationships')
                    .select('id', { count: 'exact', head: true })
                    .eq('mentee_id', user.id)
                    .eq('status', 'pending')
            ]);

            setUnreadMessages(msgRes.count || 0);
            setUnreadNotifications(notifRes.count || 0);
            setPendingRequests(reqRes.count || 0);
        } catch (err) {
            reportError(err, 'useUnreadCounts.fetch');
        }
    }, [supabase]);

    useEffect(() => {
        fetchCounts();

        const msgChannel = supabase
            .channel('unread-messages-subscription')
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'messages' },
                () => fetchCounts()
            )
            .subscribe();

        const notifChannel = supabase
            .channel('unread-notifications-subscription')
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'notifications' },
                () => fetchCounts()
            )
            .subscribe();

        const reqChannel = supabase
            .channel('pending-requests-subscription')
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'mentor_mentee_relationships' },
                () => fetchCounts()
            )
            .subscribe();

        return () => {
            supabase.removeChannel(msgChannel);
            supabase.removeChannel(notifChannel);
            supabase.removeChannel(reqChannel);
        };
    }, [fetchCounts, supabase]);

    // Dynamically update browser tab title with unread count
    useEffect(() => {
        const total = unreadMessages + unreadNotifications + pendingRequests;
        const baseTitle = 'SafeSpace';
        if (total > 0) {
            document.title = `(${total}) ${baseTitle}`;
        } else {
            document.title = baseTitle;
        }
    }, [unreadMessages, unreadNotifications, pendingRequests]);

    return {
        unreadMessages,
        unreadNotifications,
        pendingRequests,
        totalUnread: unreadMessages + unreadNotifications + pendingRequests,
        refetch: fetchCounts
    };
}
