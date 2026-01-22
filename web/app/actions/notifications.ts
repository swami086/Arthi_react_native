'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import {
    reportError,
    getTraceId,
    withRollbarSpan,
    startTimer,
    endTimer
} from '@/lib/rollbar-utils';

/**
 * Fetches notifications for the current user.
 */
export async function getNotifications(limit = 20) {
    const traceId = getTraceId();
    const span = { name: 'notifications.getNotifications' };
    startTimer('notifications.getNotifications');

    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return { success: false, error: 'Not authenticated' };
        }

        const { data: profile } = await supabase
            .from('profiles')
            .select('practice_id')
            .eq('user_id', user.id)
            .single();

        const { data, error } = await (supabase
            .from('notifications') as any)
            .select('*')
            .eq('user_id', user.id)
            .eq('practice_id', profile?.practice_id)
            .order('created_at', { ascending: false })
            .limit(limit);

        if (error) throw error;

        endTimer('notifications.getNotifications');
        return { success: true, data };
    } catch (error) {
        reportError(error, 'notifications.getNotifications', { traceId, ...span });
        return { success: false, error: 'Failed to fetch notifications' };
    }
}

/**
 * Marks a single notification as read.
 */
export async function markNotificationAsRead(notificationId: string) {
    const traceId = getTraceId();
    try {
        const supabase = await createClient();
        const { error } = await (supabase
            .from('notifications') as any)
            .update({ is_read: true })
            .eq('id', notificationId);

        if (error) throw error;

        revalidatePath('/notifications');
        return { success: true };
    } catch (error) {
        reportError(error, 'notifications.markNotificationAsRead', { notificationId, traceId });
        return { success: false, error: 'Failed to mark notification as read' };
    }
}

/**
 * Marks all notifications for current user as read.
 */
export async function markAllNotificationsAsRead() {
    const traceId = getTraceId();
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) throw new Error('Not authenticated');

        const { data: profile } = await supabase
            .from('profiles')
            .select('practice_id')
            .eq('user_id', user.id)
            .single();

        const { error } = await (supabase
            .from('notifications') as any)
            .update({ is_read: true })
            .eq('user_id', user.id)
            .eq('practice_id', profile?.practice_id)
            .eq('is_read', false);

        if (error) throw error;

        revalidatePath('/notifications');
        return { success: true };
    } catch (error) {
        reportError(error, 'notifications.markAllNotificationsAsRead', { traceId });
        return { success: false, error: 'Failed to mark all notifications as read' };
    }
}

/**
 * Deletes a notification.
 */
export async function deleteNotification(notificationId: string) {
    const traceId = getTraceId();
    try {
        const supabase = await createClient();
        const { error } = await (supabase
            .from('notifications') as any)
            .delete()
            .eq('id', notificationId);

        if (error) throw error;

        revalidatePath('/notifications');
        return { success: true };
    } catch (error) {
        reportError(error, 'notifications.deleteNotification', { notificationId, traceId });
        return { success: false, error: 'Failed to delete notification' };
    }
}
