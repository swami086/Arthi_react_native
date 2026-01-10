'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import { reportError } from '@/lib/rollbar-utils';

/**
 * Hook for managing an individual chat conversation with real-time updates and optimistic UI.
 * Refactored to avoid server actions and fix real-time leak/duplication issues.
 */
export function useChat(otherUserId: string) {
    const [messages, setMessages] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [sending, setSending] = useState(false);
    const [currentUserId, setCurrentUserId] = useState<string | null>(null);

    const supabase = createClient();
    const otherUserIdRef = useRef(otherUserId);

    useEffect(() => {
        otherUserIdRef.current = otherUserId;
    }, [otherUserId]);

    // Initial load: Get current user and fetch messages
    useEffect(() => {
        const init = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                setCurrentUserId(user.id);
            }
        };
        init();
    }, [supabase]);

    const markAllAsRead = useCallback(async (userId: string, targetId: string) => {
        try {
            await (supabase
                .from('messages') as any)
                .update({ is_read: true })
                .eq('sender_id', targetId)
                .eq('receiver_id', userId)
                .eq('is_read', false);
        } catch (err) {
            reportError(err, 'useChat.markRead');
        }
    }, [supabase]);

    const fetchMessages = useCallback(async () => {
        if (!otherUserId || !currentUserId) return;
        setLoading(true);
        setError(null);
        try {
            const { data, error: fetchError } = await supabase
                .from('messages')
                .select('*')
                .or(`and(sender_id.eq.${currentUserId},receiver_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},receiver_id.eq.${currentUserId})`)
                .order('created_at', { ascending: true });

            if (fetchError) throw fetchError;

            setMessages(data || []);

            // Mark arriving messages as read
            markAllAsRead(currentUserId, otherUserId);
        } catch (err: any) {
            setError(err.message);
            reportError(err, 'useChat.fetch');
        } finally {
            setLoading(false);
        }
    }, [otherUserId, currentUserId, supabase, markAllAsRead]);

    const handleSendMessage = async (content: string) => {
        if (!content.trim() || !otherUserId || !currentUserId) return;

        setSending(true);
        const tempId = `optimistic-${Date.now()}`;
        try {
            // Optimistic Update
            const optimisticMsg = {
                id: tempId,
                sender_id: currentUserId,
                receiver_id: otherUserId,
                content: content.trim(),
                created_at: new Date().toISOString(),
                is_read: false,
                is_optimistic: true
            };

            setMessages(prev => [...prev, optimisticMsg]);

            const { data, error: sendError } = await (supabase
                .from('messages') as any)
                .insert({
                    sender_id: currentUserId,
                    receiver_id: otherUserId,
                    content: content.trim(),
                    is_read: false
                })
                .select()
                .single();

            if (sendError) throw sendError;

            // Replace optimistic message with actual data
            setMessages(prev => prev.map(m => m.id === tempId ? data : m));
        } catch (err: any) {
            setMessages(prev => prev.filter(m => m.id !== tempId));
            setError(err.message || 'Failed to send message');
            reportError(err, 'useChat.send');
        } finally {
            setSending(false);
        }
    };

    useEffect(() => {
        if (!otherUserId || !currentUserId) return;

        fetchMessages();

        // Subscribe specifically to messages exchanged with this user
        // Refined filter to prevent leaking unrelated messages (Comment 2)
        const channel = supabase
            .channel(`chat-conversation-${otherUserId}`)
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'messages',
                    // Filter in payload below as Postgres changes filters are limited for OR conditions
                },
                (payload) => {
                    const newMsg = payload.new;

                    // Comment 2: Only process payloads for THIS specific conversation
                    const isRelevant =
                        (newMsg.sender_id === currentUserId && newMsg.receiver_id === otherUserId) ||
                        (newMsg.sender_id === otherUserId && newMsg.receiver_id === currentUserId);

                    if (!isRelevant) return;

                    // Comment 3: Skip appending if WE sent it (optimistic UI handles it)
                    if (newMsg.sender_id === currentUserId) return;

                    setMessages(prev => {
                        // Deduplicate just in case
                        if (prev.some(m => m.id === newMsg.id)) return prev;
                        return [...prev, newMsg];
                    });

                    // If it's an incoming message, mark it as read
                    if (newMsg.sender_id === otherUserId) {
                        markAllAsRead(currentUserId, otherUserId);
                    }
                }
            )
            .on(
                'postgres_changes',
                {
                    event: 'UPDATE',
                    schema: 'public',
                    table: 'messages'
                },
                (payload) => {
                    const updatedMsg = payload.new;
                    setMessages(prev => prev.map(m => m.id === updatedMsg.id ? { ...m, ...updatedMsg } : m));
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [otherUserId, currentUserId, fetchMessages, supabase, markAllAsRead]);

    return {
        messages,
        loading,
        error,
        sending,
        sendMessage: handleSendMessage,
        refetch: fetchMessages
    };
}
