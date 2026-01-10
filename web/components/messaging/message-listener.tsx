'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { MessageNotificationIntegration } from '@/lib/services/message-notification-integration';

/**
 * Global component to listen for incoming messages and trigger notifications.
 * Placed in the main layout to ensure it runs across all pages.
 */
export function MessageListener() {
    const { user } = useAuth();
    const pathname = usePathname();

    useEffect(() => {
        if (!user?.id) return;

        const cleanup = MessageNotificationIntegration.setupListener(user.id, pathname);

        return () => {
            if (cleanup) cleanup();
        };
    }, [user?.id, pathname]);

    return null; // Side-effect only component
}
