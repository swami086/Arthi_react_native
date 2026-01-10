'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, MessageSquare, Plus } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ConversationCard } from '@/components/ui/conversation-card';
import { useMessages } from '@/hooks/use-messages';
import { useRouter } from 'next/navigation';
import { usePresence } from '@/hooks/use-presence';
import { useAuth } from '@/hooks/use-auth';

interface MessagesListClientProps {
    initialConversations: any[];
}

export default function MessagesListClient({ initialConversations }: MessagesListClientProps) {
    const { conversations, loading, refetch } = useMessages();
    const { user } = useAuth();
    const { isOnline } = usePresence(user?.id);
    const [searchTerm, setSearchTerm] = useState('');
    const router = useRouter();

    const displayConversations = useMemo(() => {
        // Prefer live data from hook, fallback to initial server data
        const sourceList = conversations.length > 0 ? conversations : initialConversations;

        return sourceList.filter(conv => {
            const name = conv.otherParticipant?.full_name?.toLowerCase() || '';
            const lastMsg = conv.lastMessage?.content?.toLowerCase() || '';
            const search = searchTerm.toLowerCase();
            return name.includes(search) || lastMsg.includes(search);
        });
    }, [conversations, initialConversations, searchTerm]);

    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const item = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0 }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8 pb-32 p-4 md:p-6">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-black text-gray-900 dark:text-white tracking-tight">
                        Messages
                    </h1>
                    <p className="text-gray-500 font-bold uppercase tracking-[0.2em] text-[10px] mt-1 pl-1">
                        SECURE NETWORK COMMUNICATIONS
                    </p>
                </div>

                <div className="relative group w-full md:w-80">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-primary transition-colors" />
                    <Input
                        placeholder="Search conversations..."
                        className="pl-11 h-13 rounded-2xl bg-white dark:bg-gray-950 border-gray-100 dark:border-gray-800 shadow-sm focus:ring-primary/20"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* List Section */}
            <AnimatePresence mode="wait">
                {displayConversations.length > 0 ? (
                    <motion.div
                        variants={container}
                        initial="hidden"
                        animate="show"
                        className="grid grid-cols-1 gap-2"
                    >
                        {displayConversations.map((conv) => (
                            <motion.div key={conv.otherParticipantId} variants={item}>
                                <ConversationCard
                                    name={conv.otherParticipant?.full_name || 'User'}
                                    avatarUrl={conv.otherParticipant?.avatar_url}
                                    lastMessage={conv.lastMessage?.content || ''}
                                    timestamp={conv.lastMessage?.created_at || new Date().toISOString()}
                                    unreadCount={conv.unreadCount}
                                    isOnline={isOnline(conv.otherParticipantId)}
                                    onClick={() => router.push(`/messages/${conv.otherParticipantId}`)}
                                />
                            </motion.div>
                        ))}
                    </motion.div>
                ) : !loading ? (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="py-24 flex flex-col items-center text-center bg-gray-50/50 dark:bg-gray-900/10 rounded-[3rem] border-2 border-dashed border-gray-100 dark:border-gray-800"
                    >
                        <div className="h-24 w-24 rounded-[2.5rem] bg-primary/5 text-primary flex items-center justify-center mb-8 shadow-xl shadow-primary/5">
                            <MessageSquare className="h-10 w-10" />
                        </div>
                        <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-2">
                            Silence is golden, but connection is better
                        </h3>
                        <p className="text-gray-500 font-bold max-w-sm mx-auto leading-relaxed">
                            No conversations found matching your search. Start a new chat with your therapists or patients to get moving!
                        </p>
                        <Button className="mt-10 rounded-2xl h-15 px-10 font-black gap-3 shadow-lg shadow-primary/20">
                            <Plus className="h-5 w-5" />
                            Start New Chat
                        </Button>
                    </motion.div>
                ) : (
                    <div className="space-y-4">
                        {[1, 2, 3, 4].map(i => (
                            <div key={i} className="h-24 w-full bg-gray-100 dark:bg-gray-800 rounded-2xl animate-pulse" />
                        ))}
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
