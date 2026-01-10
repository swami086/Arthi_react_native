import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '@/types/database';
import { addBreadcrumb, reportError, getTraceId } from '@/lib/rollbar-utils';

/**
 * Service for managing platform notifications.
 * Adapted from the React Native implementation for Next.js.
 */
export const NotificationService = {
    /**
     * Create a new notification for a user.
     */
    createNotification: async (
        supabase: SupabaseClient,
        userId: string,
        title: string,
        message: string,
        type: 'appointment' | 'message' | 'system' | 'payment',
        relatedEntityId?: string,
        metadata?: any
    ) => {
        const traceId = getTraceId();
        addBreadcrumb('Creating notification', 'NotificationService.createNotification', 'info', {
            userId,
            type,
            traceId
        });

        try {
            const { error } = await (supabase
                .from('notifications') as any)
                .insert({
                    user_id: userId,
                    title,
                    message,
                    type,
                    related_entity_id: relatedEntityId,
                    metadata,
                    is_read: false,
                });

            if (error) throw error;
            return true;
        } catch (error) {
            reportError(error, 'NotificationService:createNotification', { userId, traceId });
            throw error;
        }
    },

    /**
     * Mark a single notification as read.
     */
    markAsRead: async (supabase: SupabaseClient, id: string) => {
        try {
            const { error } = await (supabase
                .from('notifications') as any)
                .update({ is_read: true })
                .eq('id', id);

            if (error) throw error;
            return true;
        } catch (error) {
            reportError(error, 'NotificationService:markAsRead');
            throw error;
        }
    },

    /**
     * Mark all notifications as read for a user.
     */
    markAllAsRead: async (supabase: SupabaseClient, userId: string) => {
        try {
            const { error } = await (supabase
                .from('notifications') as any)
                .update({ is_read: true })
                .eq('user_id', userId);

            if (error) throw error;
            return true;
        } catch (error) {
            reportError(error, 'NotificationService:markAllAsRead');
            throw error;
        }
    },

    /**
     * Delete a notification.
     */
    deleteNotification: async (supabase: SupabaseClient, id: string) => {
        try {
            const { error } = await (supabase
                .from('notifications') as any)
                .delete()
                .eq('id', id);

            if (error) throw error;
            return true;
        } catch (error) {
            reportError(error, 'NotificationService:deleteNotification');
            throw error;
        }
    }
};
