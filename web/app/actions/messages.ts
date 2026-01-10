'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import {
    reportError,
    addBreadcrumb,
    getTraceId,
    withRollbarSpan
} from '@/lib/rollbar-utils';

/**
 * Sends a message to another user.
 */
export async function sendMessage(receiverId: string, content: string) {
    const traceId = getTraceId();
    const span = { name: 'messages.sendMessage' };
    addBreadcrumb('Sending message', 'messages.sendMessage', 'info', { receiverId, traceId });

    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            throw new Error('Not authenticated');
        }

        const { data, error } = await (supabase
            .from('messages') as any)
            .insert({
                sender_id: user.id,
                receiver_id: receiverId,
                content,
                is_read: false
            })
            .select()
            .single();

        if (error) throw error;

        revalidatePath('/messages');
        revalidatePath(`/messages/${receiverId}`);

        return { success: true, data };
    } catch (error) {
        reportError(error, 'messages.sendMessage', { receiverId, traceId, ...span });
        return { success: false, error: (error as Error).message || 'Failed to send message' };
    }
}

/**
 * Fetches the list of conversations for the current user.
 * A conversation is derived from unique participants the user has exchanged messages with.
 */
export async function getConversations() {
    const traceId = getTraceId();
    const span = { name: 'messages.getConversations' };

    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return { success: false, error: 'Not authenticated' };
        }

        // Fetch all messages where user is sender or receiver to derive uniquely
        // In a production app, we would use a dedicated conversations table or a optimized RPC
        const { data: messages, error } = await (supabase
            .from('messages') as any)
            .select(`
                *,
                sender:profiles!messages_sender_id_fkey(full_name, avatar_url),
                receiver:profiles!messages_receiver_id_fkey(full_name, avatar_url)
            `)
            .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
            .order('created_at', { ascending: false });

        if (error) throw error;

        const conversationsMap = new Map();
        messages?.forEach((msg: any) => {
            const otherParticipantId = msg.sender_id === user.id ? msg.receiver_id : msg.sender_id;
            if (!conversationsMap.has(otherParticipantId)) {
                conversationsMap.set(otherParticipantId, {
                    lastMessage: msg,
                    otherParticipant: msg.sender_id === user.id ? msg.receiver : msg.sender,
                    otherParticipantId,
                    unreadCount: 0 // Will handle if needed
                });
            }

            // Increment unread count if applicable
            if (msg.receiver_id === user.id && !msg.is_read) {
                const conv = conversationsMap.get(otherParticipantId);
                conv.unreadCount += 1;
            }
        });

        return { success: true, data: Array.from(conversationsMap.values()) };
    } catch (error) {
        reportError(error, 'messages.getConversations', { traceId, ...span });
        return { success: false, error: 'Failed to fetch conversations' };
    }
}

/**
 * Retrieves message history for a specific conversation.
 */
export async function getMessages(otherUserId: string, limit = 50, offset = 0) {
    const traceId = getTraceId();
    const span = { name: 'messages.getMessages' };

    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return { success: false, error: 'Not authenticated' };
        }

        const { data, error } = await (supabase
            .from('messages') as any)
            .select('*')
            .or(`and(sender_id.eq.${user.id},receiver_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},receiver_id.eq.${user.id})`)
            .order('created_at', { ascending: false })
            .range(offset, offset + limit - 1);

        if (error) throw error;

        return { success: true, data: data.reverse() }; // Chronological order
    } catch (error) {
        reportError(error, 'messages.getMessages', { otherUserId, traceId, ...span });
        return { success: false, error: 'Failed to fetch messages' };
    }
}

/**
 * Marks a specific message as read.
 */
export async function markMessageAsRead(messageId: string) {
    const traceId = getTraceId();
    try {
        const supabase = await createClient();
        const { error } = await (supabase
            .from('messages') as any)
            .update({ is_read: true })
            .eq('id', messageId);

        if (error) throw error;
        return { success: true };
    } catch (error) {
        reportError(error, 'messages.markMessageAsRead', { messageId, traceId });
        return { success: false, error: 'Failed to mark message as read' };
    }
}

/**
 * Marks all messages from a specific user as read.
 */
export async function markAllMessagesFromUserAsRead(otherUserId: string) {
    const traceId = getTraceId();
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) throw new Error('Not authenticated');

        const { error } = await (supabase
            .from('messages') as any)
            .update({ is_read: true })
            .eq('sender_id', otherUserId)
            .eq('receiver_id', user.id)
            .eq('is_read', false);

        if (error) throw error;

        revalidatePath('/messages');
        revalidatePath(`/messages/${otherUserId}`);

        return { success: true };
    } catch (error) {
        reportError(error, 'messages.markAllMessagesFromUserAsRead', { otherUserId, traceId });
        return { success: false, error: 'Failed to mark messages as read' };
    }
}
