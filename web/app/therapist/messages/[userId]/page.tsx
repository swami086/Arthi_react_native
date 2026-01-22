
import { Metadata } from 'next';
import { getMessages } from '@/app/actions/messages';
import { getUserProfile } from '@/app/actions/auth';
import ChatDetailClient from '@/app/(main)/messages/[userId]/_components/chat-detail-client';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

interface ChatPageProps {
    params: Promise<{
        userId: string;
    }>;
}

export async function generateMetadata({ params }: ChatPageProps): Promise<Metadata> {
    const { userId } = await params;
    const result = await getUserProfile(userId) as any;
    const name = result.success ? result.data?.full_name : 'Chat';

    return {
        title: `${name} | Messages`,
        description: `Chat with ${name} on SafeSpace.`,
    };
}

export default async function ChatPage({ params }: ChatPageProps) {
    const { userId } = await params;
    const [messagesResult, profileResult] = await Promise.all([
        getMessages(userId),
        getUserProfile(userId)
    ]) as [any, any];

    if (!profileResult.success || !profileResult.data) {
        redirect('/therapist/messages');
    }

    return (
        <ChatDetailClient
            otherUser={profileResult.data}
            initialMessages={messagesResult.success ? messagesResult.data : []}
            backUrl="/therapist/messages"
        />
    );
}
