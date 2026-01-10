import { Metadata } from 'next';
import { getNotifications } from '@/app/actions/notifications';
import NotificationsListClient from './_components/notifications-list-client';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
    title: 'Notifications | SafeSpace',
    description: 'Keep track of your appointments, messages, and account updates.',
};

export default async function NotificationsPage() {
    const result = await getNotifications();
    const initialNotifications = result.success ? result.data : [];

    return (
        <NotificationsListClient initialNotifications={initialNotifications || []} />
    );
}
