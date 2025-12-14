import React, { useState, useEffect, useRef } from 'react';
import { View, Text, FlatList, TextInput, TouchableOpacity, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute, useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../../navigation/types';
import { supabase } from '../../../api/supabase';
import { useAuth } from '../../auth/hooks/useAuth';
import { Message } from '../../../api/types';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

type ChatDetailScreenNavigationProp = StackNavigationProp<RootStackParamList, 'ChatDetail'>;

export const ChatDetailScreen = () => {
    const route = useRoute<any>();
    const navigation = useNavigation<ChatDetailScreenNavigationProp>();
    const { otherUserId, otherUserName } = route.params;
    const { user } = useAuth();

    const [messages, setMessages] = useState<Message[]>([]);
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [newMessage, setNewMessage] = useState('');
    const flatListRef = useRef<FlatList>(null);

    useEffect(() => {
        if (!user) return;

        const fetchMessages = async () => {
            const { data, error } = await supabase
                .from('messages')
                .select('*')
                .or(`and(sender_id.eq.${user.id},receiver_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},receiver_id.eq.${user.id})`)
                .order('created_at', { ascending: false });

            if (!error && data) {
                setMessages(data);
            }
            setLoading(false);
        };

        fetchMessages();

        // Real-time subscription
        const channel = supabase
            .channel(`chat:${user.id}:${otherUserId}`)
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'messages',
                    filter: `sender_id=in.(${user.id},${otherUserId})`,
                },
                (payload) => {
                    const newMsg = payload.new as Message;
                    // Check if the message belongs to this conversation (double check receiver too)
                    if (
                        (newMsg.sender_id === user.id && newMsg.receiver_id === otherUserId) ||
                        (newMsg.sender_id === otherUserId && newMsg.receiver_id === user.id)
                    ) {
                        setMessages((prev) => [newMsg, ...prev]);
                    }
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [user, otherUserId]);

    const handleSend = async () => {
        if (!newMessage.trim() || !user) return;

        setSending(true);
        const { error } = await supabase.from('messages').insert({
            sender_id: user.id,
            receiver_id: otherUserId,
            content: newMessage.trim(),
            is_read: false,
        });

        if (error) {
            console.error('Error sending message:', error);
        } else {
            setNewMessage('');
        }
        setSending(false);
    };

    const renderMessage = ({ item }: { item: Message }) => {
        const isMyMessage = item.sender_id === user?.id;
        return (
            <View className={`my-1 mx-4 max-w-[80%] p-3 rounded-2xl ${isMyMessage
                    ? 'bg-primary self-end rounded-br-none'
                    : 'bg-gray-200 dark:bg-gray-700 self-start rounded-bl-none'
                }`}>
                <Text className={`${isMyMessage ? 'text-white' : 'text-black dark:text-white'
                    }`}>
                    {item.content}
                </Text>
                <Text className={`text-[10px] mt-1 ${isMyMessage ? 'text-white/70' : 'text-gray-500 box'}`}>
                    {new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </Text>
            </View>
        );
    };

    return (
        <SafeAreaView className="flex-1 bg-background-light dark:bg-background-dark" edges={['top']}>
            {/* Header */}
            <View className="flex-row items-center p-4 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm z-10">
                <TouchableOpacity onPress={() => navigation.goBack()} className="mr-3">
                    <Icon name="arrow-left" size={24} color="#30bae8" />
                </TouchableOpacity>
                <View className="w-10 h-10 bg-primary/20 rounded-full items-center justify-center mr-3">
                    <Text className="text-primary font-bold text-lg">{otherUserName.charAt(0)}</Text>
                </View>
                <Text className="text-lg font-bold text-text-main-light dark:text-text-main-dark flex-1">
                    {otherUserName}
                </Text>
            </View>

            {loading ? (
                <View className="flex-1 items-center justify-center">
                    <ActivityIndicator size="large" color="#30bae8" />
                </View>
            ) : (
                <FlatList
                    ref={flatListRef}
                    data={messages}
                    renderItem={renderMessage}
                    keyExtractor={item => item.id}
                    inverted
                    contentContainerStyle={{ paddingVertical: 16 }}
                />
            )}

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
            >
                <View className="flex-row items-center p-4 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">
                    <TextInput
                        className="flex-1 bg-gray-100 dark:bg-gray-800 text-text-main-light dark:text-text-main-dark rounded-full px-4 py-3 mr-3 max-h-24"
                        placeholder="Type a message..."
                        placeholderTextColor="#9ca3af"
                        value={newMessage}
                        onChangeText={setNewMessage}
                        multiline
                    />
                    <TouchableOpacity
                        onPress={handleSend}
                        disabled={sending || !newMessage.trim()}
                        className={`w-12 h-12 rounded-full items-center justify-center ${!newMessage.trim() ? 'bg-gray-300 dark:bg-gray-700' : 'bg-primary'
                            }`}
                    >
                        {sending ? (
                            <ActivityIndicator size="small" color="#white" />
                        ) : (
                            <Icon name="send" size={20} color="white" />
                        )}
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};
