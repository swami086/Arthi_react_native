'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { reportError } from '@/lib/rollbar-utils';

/**
 * Hook to manage high-level conversation list state and real-time updates.
 * Uses client-side Supabase instance to fetch data directly (no server action dependency).
 */
export function useMessages() {
    const [conversations, setConversations] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchConversations = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const supabase = createClient();
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) {
                setLoading(false);
                return;
            }

            // Fetch all messages where user is sender or receiver to derive conversations
            const { data: messages, error: fetchError } = await (supabase
                .from('messages') as any)
                .select(`
                    *,
                    sender:profiles!messages_sender_id_fkey(full_name, avatar_url),
                    receiver:profiles!messages_receiver_id_fkey(full_name, avatar_url)
                `)
                .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
                .order('created_at', { ascending: false });

            if (fetchError) throw fetchError;

            const conversationsMap = new Map();
            messages?.forEach((msg: any) => {
                const otherParticipantId = msg.sender_id === user.id ? msg.receiver_id : msg.sender_id;
                if (!conversationsMap.has(otherParticipantId)) {
                    conversationsMap.set(otherParticipantId, {
                        lastMessage: msg,
                        otherParticipant: msg.sender_id === user.id ? msg.receiver : msg.sender,
                        otherParticipantId,
                        unreadCount: 0
                    });
                }

                if (msg.receiver_id === user.id && !msg.is_read) {
                    const conv = conversationsMap.get(otherParticipantId);
                    conv.unreadCount += 1;
                }
            });

            setConversations(Array.from(conversationsMap.values()));
        } catch (err: any) {
            const message = err?.message || 'An unexpected error occurred';
            setError(message);
            reportError(err, 'useMessages.fetch');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchConversations();

        const supabase = createClient();

        // Subscribe to real-time message updates to refresh the list
        const channel = supabase
            .channel('messages-list-realtime')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'messages'
                },
                () => {
                    fetchConversations();
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [fetchConversations]);

    return {
        conversations,
        loading,
        error,
        refetch: fetchConversations
    };
}
