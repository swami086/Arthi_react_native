import { useEffect, useState } from 'react';
import { supabase } from '../../../api/supabase';
import { Message, Profile } from '../../../api/types';
import { useAuth } from '../../auth/hooks/useAuth';

export interface Conversation {
    otherUserId: string;
    otherUser: Profile | null;
    lastMessage: Message;
}

export const useMessages = () => {
    const { user } = useAuth();
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!user) return;

        const fetchMessages = async () => {
            try {
                // Fetch all messages involving the user
                const { data: messages, error: msgError } = await supabase
                    .from('messages')
                    .select('*')
                    .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
                    .order('created_at', { ascending: false });

                if (msgError) throw msgError;

                // Group by other user
                const convMap = new Map<string, Message>();
                if (messages) {
                    messages.forEach(msg => {
                        const otherId = msg.sender_id === user.id ? msg.receiver_id : msg.sender_id;
                        if (!convMap.has(otherId)) {
                            convMap.set(otherId, msg); // Since we ordered by desc, the first one is the last message
                        }
                    });
                }

                // Fetch profiles for these users
                const otherUserIds = Array.from(convMap.keys());
                if (otherUserIds.length > 0) {
                    const { data: profiles, error: profError } = await supabase
                        .from('profiles')
                        .select('*')
                        .in('user_id', otherUserIds);

                    if (profError) throw profError;

                    const profileMap = new Map(profiles?.map(p => [p.user_id, p]));

                    const convs: Conversation[] = otherUserIds.map(id => ({
                        otherUserId: id,
                        otherUser: profileMap.get(id) || null,
                        lastMessage: convMap.get(id)!,
                    }));

                    setConversations(convs);
                } else {
                    setConversations([]);
                }

            } catch (err: any) {
                setError(err.message || 'Failed to fetch messages');
            } finally {
                setLoading(false);
            }
        };

        fetchMessages();

        const channel = supabase
            .channel('messages_all')
            .on('postgres_changes', {
                event: '*',
                schema: 'public',
                table: 'messages',
            }, (payload) => {
                // Ideally check if payload involves user, but simple refresh is safer
                fetchMessages();
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [user]);

    return { conversations, loading, error };
};
