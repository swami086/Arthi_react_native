import { useState, useCallback, useEffect } from 'react';
import { supabase } from '../../../api/supabase';
import { Database } from '../../../api/types';
import { useAuth } from '../../auth/context/AuthContext';
import { NotificationService } from '../services/notificationService';

export type Notification = Database['public']['Tables']['notifications']['Row'];

export const useNotifications = () => {
    const { user } = useAuth();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);
    const [unreadCount, setUnreadCount] = useState(0);

    const fetchNotifications = useCallback(async () => {
        if (!user) return;
        try {
            // Don't set loading to true on refetch to avoid flickering if desired, 
            // but for initial load it's good. 
            // We can check if notifications.length === 0 maybe.
            const { data, error } = await supabase
                .from('notifications')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false });

            if (error) throw error;

            setNotifications(data || []);
            setUnreadCount(data?.filter(n => !n.is_read).length || 0);
        } catch (error) {
            console.error('Error fetching notifications:', error);
        } finally {
            setLoading(false);
        }
    }, [user]);

    const markAsRead = async (id: string) => {
        // Optimistic update
        setNotifications(prev =>
            prev.map(n => n.id === id ? { ...n, is_read: true } : n)
        );
        // Recalculate unread count
        setUnreadCount(prev => {
            const notification = notifications.find(n => n.id === id);
            if (notification && !notification.is_read) {
                return Math.max(0, prev - 1);
            }
            return prev;
        });

        try {
            await NotificationService.markAsRead(id);
        } catch (error) {
            console.error('Failed to mark as read', error);
            // Revert or re-fetch suppressed for seamless UX usually
            fetchNotifications();
        }
    };

    const markAllAsRead = async () => {
        if (!user) return;

        const previousNotifications = [...notifications];
        setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
        setUnreadCount(0);

        try {
            await NotificationService.markAllAsRead(user.id);
        } catch (error) {
            console.error(error);
            setNotifications(previousNotifications);
            fetchNotifications();
        }
    };

    useEffect(() => {
        fetchNotifications();

        if (!user) return;

        const subscription = supabase
            .channel('notifications_channel')
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'notifications',
                    filter: `user_id=eq.${user.id}`,
                },
                (payload) => {
                    const newNotification = payload.new as Notification;
                    setNotifications(prev => [newNotification, ...prev]);
                    if (!newNotification.is_read) {
                        setUnreadCount(prev => prev + 1);
                    }
                }
            )
            .subscribe();

        return () => {
            subscription.unsubscribe();
        };

    }, [user, fetchNotifications]);

    return {
        notifications,
        loading,
        unreadCount,
        fetchNotifications,
        markAsRead,
        markAllAsRead
    };
};
