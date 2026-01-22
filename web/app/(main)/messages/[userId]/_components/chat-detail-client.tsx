'use client';

import React, { useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useChat } from '@/hooks/use-chat';
import { usePresence } from '@/hooks/use-presence';
import { MessageBubble } from '@/components/ui/message-bubble';
import ChatHeader from './chat-header';
import MessageInput from './message-input';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/hooks/use-auth';

interface ChatDetailClientProps {
    otherUser: any;
    initialMessages: any[];
}

export default function ChatDetailClient({ otherUser, initialMessages, backUrl = '/messages' }: ChatDetailClientProps & { backUrl?: string }) {
    const { messages, loading, sendMessage } = useChat(otherUser.user_id);
    const scrollRef = useRef<HTMLDivElement>(null);
    const { user } = useAuth();
    const { isOnline } = usePresence(user?.id);
    const currentUserId = user?.id;

    // Scroll to bottom on new messages
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTo({
                top: scrollRef.current.scrollHeight,
                behavior: 'smooth'
            });
        }
    }, [messages]);

    const displayMessages = useMemo(() => {
        return messages.length > 0 ? messages : initialMessages;
    }, [messages, initialMessages]);

    return (
        <div className="flex flex-col h-[calc(100vh-80px)] md:h-full bg-white dark:bg-black overflow-hidden relative">
            {/* Header */}
            <ChatHeader user={otherUser} isOnline={isOnline(otherUser.user_id)} backUrl={backUrl} />

            {/* Messages Area */}
            <div
                ref={scrollRef}
                className="flex-1 overflow-y-auto p-4 md:p-6 space-y-2 custom-scrollbar"
            >
                <div className="max-w-4xl mx-auto flex flex-col min-h-full">
                    <div className="flex-1" /> {/* Push messages to bottom */}

                    <AnimatePresence initial={false}>
                        {displayMessages.map((msg, index) => {
                            const isMyMessage = msg.sender_id === currentUserId;
                            const showDate = index === 0 ||
                                new Date(msg.created_at).toDateString() !== new Date(displayMessages[index - 1].created_at).toDateString();

                            return (
                                <React.Fragment key={msg.id}>
                                    {showDate && (
                                        <div className="flex justify-center my-6">
                                            <span className="px-3 py-1 bg-gray-50 dark:bg-gray-900 rounded-full text-[10px] uppercase font-black tracking-widest text-gray-400">
                                                {new Date(msg.created_at).toLocaleDateString(undefined, {
                                                    weekday: 'long',
                                                    month: 'short',
                                                    day: 'numeric'
                                                })}
                                            </span>
                                        </div>
                                    )}
                                    <MessageBubble
                                        content={msg.content}
                                        timestamp={msg.created_at}
                                        isMyMessage={isMyMessage}
                                        isRead={msg.is_read}
                                    />
                                </React.Fragment>
                            );
                        })}
                    </AnimatePresence>
                </div>
            </div>

            {/* Input */}
            <MessageInput onSend={sendMessage} disabled={loading} />
        </div>
    );
}
