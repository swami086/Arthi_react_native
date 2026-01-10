'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';

/**
 * Hook to track real-time presence of users using Supabase Presence.
 */
export function usePresence(currentUserId?: string) {
    const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());
    const supabase = createClient();

    useEffect(() => {
        if (!currentUserId) return;

        const channel = supabase.channel('online-presence', {
            config: {
                presence: {
                    key: currentUserId,
                },
            },
        });

        channel
            .on('presence', { event: 'sync' }, () => {
                const state = channel.presenceState();
                const onlineIds = new Set(Object.keys(state));
                setOnlineUsers(onlineIds);
            })
            .subscribe(async (status) => {
                if (status === 'SUBSCRIBED') {
                    await channel.track({
                        online_at: new Date().toISOString(),
                        user_id: currentUserId
                    });
                }
            });

        return () => {
            channel.unsubscribe();
        };
    }, [currentUserId, supabase]);

    const isOnline = (userId: string) => onlineUsers.has(userId);

    return {
        onlineUsers,
        isOnline
    };
}
