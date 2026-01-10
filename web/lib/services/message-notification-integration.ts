'use client';

import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';
import { NotificationService } from './notification-service';

/**
 * Service to bridge messaging and notifications.
 * Listens for new messages globally and triggers UI notifications if the user isn't actively chatting.
 */
export const MessageNotificationIntegration = {
    /**
     * Set up a real-time listener for incoming messages.
     * @param currentUserId - The ID of the authenticated user.
     * @param currentPathname - The current URL path to check against active chats.
     */
    setupListener: (currentUserId: string, currentPathname: string) => {
        const supabase = createClient();

        // Use a unique channel for this listener
        const channel = supabase
            .channel('global-message-bridge')
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'messages',
                    filter: `receiver_id=eq.${currentUserId}`
                },
                async (payload) => {
                    const newMsg = payload.new;

                    // Rule: Don't notify if user is already browsing THIS specific conversation
                    const chatPath = `/messages/${newMsg.sender_id}`;
                    if (currentPathname === chatPath) return;

                    // Fetch sender details to make the notification personal
                    const { data: sender } = await (supabase
                        .from('profiles')
                        .select('full_name, avatar_url')
                        .eq('user_id', newMsg.sender_id)
                        .single() as any);

                    const senderName = sender?.full_name || 'New Message';

                    // Trigger toast notification
                    toast(senderName, {
                        description: newMsg.content.length > 60
                            ? newMsg.content.substring(0, 60) + '...'
                            : newMsg.content,
                        action: {
                            label: 'Reply',
                            onClick: () => {
                                // Direct navigation
                                window.location.href = chatPath;
                            },
                        },
                    });

                    // Create a database notification record so it appears in the /notifications Feed later
                    // This ensures consistency between real-time and historical views
                    NotificationService.createNotification(
                        supabase,
                        currentUserId,
                        `Message from ${senderName}`,
                        newMsg.content,
                        'message',
                        newMsg.sender_id
                    ).catch(err => {
                        console.warn('[MessageBridge] Failed to create persistent notification:', err);
                    });
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }
};
