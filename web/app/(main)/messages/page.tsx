import { Metadata } from 'next';
import { getConversations } from '@/app/actions/messages';
import MessagesListClient from './_components/messages-list-client';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
    title: 'Messages | SafeSpace',
    description: 'Connect with your therapist or patient via secure messaging.',
};

export default async function MessagesPage() {
    const result = await getConversations();

    // Pass initial data to client component for immediate first paint
    const initialConversations = result.success ? result.data : [];

    return (
        <MessagesListClient initialConversations={initialConversations || []} />
    );
}
