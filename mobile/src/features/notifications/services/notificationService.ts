import { supabase } from '../../../api/supabase';
import { Database } from '../../../api/types';
import { reportError } from '../../../services/rollbar';

type NotificationInsert = Database['public']['Tables']['notifications']['Insert'];

export const NotificationService = {
    /**
     * Create a new notification for a user
     */
    createNotification: async (
        userId: string,
        title: string,
        message: string,
        type: 'appointment' | 'message' | 'system' | 'payment',
        relatedEntityId?: string,
        metadata?: any
    ) => {
        try {
            const notification: NotificationInsert = {
                user_id: userId,
                title,
                message,
                type,
                related_entity_id: relatedEntityId,
                metadata,
                is_read: false,
            };

            const { error } = await supabase
                .from('notifications')
                .insert(notification);

            if (error) throw error;
            return true;
        } catch (error) {
            console.error('Error creating notification:', error);
            reportError(error, 'NotificationService:createNotification');
            throw error;
        }
    },

    /**
     * Mark a single notification as read
     */
    markAsRead: async (id: string) => {
        try {
            const { error } = await supabase
                .from('notifications')
                .update({ is_read: true })
                .eq('id', id);

            if (error) throw error;
            return true;
        } catch (error) {
            console.error('Error marking notification as read:', error);
            reportError(error, 'NotificationService:markAsRead');
            throw error;
        }
    },

    /**
     * Mark all notifications as read for a user
     */
    markAllAsRead: async (userId: string) => {
        try {
            const { error } = await supabase
                .from('notifications')
                .update({ is_read: true })
                .eq('user_id', userId);

            if (error) throw error;
            return true;
        } catch (error) {
            console.error('Error marking all notifications as read:', error);
            reportError(error, 'NotificationService:markAllAsRead');
            throw error;
        }
    },

    /**
     * Delete a notification
     */
    deleteNotification: async (id: string) => {
        try {
            const { error } = await supabase
                .from('notifications')
                .delete()
                .eq('id', id);

            if (error) throw error;
            return true;
        } catch (error) {
            console.error('Error deleting notification:', error);
            reportError(error, 'NotificationService:deleteNotification');
            throw error;
        }
    }
};
