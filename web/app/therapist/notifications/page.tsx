import { Metadata } from 'next';
import { getNotifications } from '@/app/actions/notifications';
import TherapistNotificationsList from './_components/therapist-notifications-list';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
    title: 'Notifications | SafeSpace Therapist',
    description: 'Keep track of your appointments, messages, and account updates.',
};

export default async function TherapistNotificationsPage() {
    const result = await getNotifications();
    const initialNotifications = result.success ? result.data : [];

    return (
        <TherapistNotificationsList initialNotifications={initialNotifications || []} />
    );
}
