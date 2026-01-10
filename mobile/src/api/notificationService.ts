import { supabase } from './supabase';
import { Database } from './types';
import { reportError, withRollbarTrace, startSpan, endSpan } from '../services/rollbar';

type NotificationInsert = Database['public']['Tables']['notifications']['Insert'];

/**
 * Send an in-app notification to a user
 */
export const sendNotification = async (notification: NotificationInsert) => {
    startSpan('api.notification.send');
    try {
        const { data, error } = await supabase
            .from('notifications')
            .insert(notification)
            .select()
            .single();

        if (error) {
            reportError(error, 'notificationService:sendNotification', {
                userId: notification.user_id,
                type: notification.type
            });
            return null;
        }

        return data;
    } catch (error) {
        reportError(error, 'notificationService:sendNotification');
        return null;
    } finally {
        endSpan();
    }
};

/**
 * Get notifications for a user
 */
export const getNotifications = async (userId: string) => {
    startSpan('api.notification.getAll');
    try {
        const { data, error } = await supabase
            .from('notifications')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });

        if (error) {
            reportError(error, 'notificationService:getNotifications', { userId });
            return [];
        }

        return data;
    } catch (error) {
        reportError(error, 'notificationService:getNotifications', { userId });
        return [];
    } finally {
        endSpan();
    }
};

/**
 * Mark notification as read
 */
export const markAsRead = async (notificationId: string) => {
    startSpan('api.notification.markAsRead');
    try {
        const { error } = await supabase
            .from('notifications')
            .update({ read: true })
            .eq('id', notificationId)


        if (error) {
            reportError(error, 'notificationService:markAsRead', { notificationId });
            return false;
        }

        return true;
    } catch (error) {
        reportError(error, 'notificationService:markAsRead', { notificationId });
        return false;
    } finally {
        endSpan();
    }
};
