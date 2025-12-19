import React, { useState, useEffect, useRef } from 'react';
import { View, Text, FlatList, TextInput, TouchableOpacity, ActivityIndicator, KeyboardAvoidingView, Platform, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute, useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { MotiView } from 'moti';

import { RootStackParamList } from '../../../navigation/types';
import { supabase } from '../../../api/supabase';
import { useAuth } from '../../auth/hooks/useAuth';
import { Message } from '../../../api/types';
import { MessageBubble } from '../../../components/MessageBubble';
import { GradientAvatar } from '../../../components/GradientAvatar';
import { useColorScheme } from '../../../hooks/useColorScheme';

type ChatDetailScreenNavigationProp = StackNavigationProp<RootStackParamList, 'ChatDetail'>;

export const ChatDetailScreen = () => {
    const route = useRoute<any>();
    const navigation = useNavigation<ChatDetailScreenNavigationProp>();
    const { otherUserId, otherUserName } = route.params;
    const { user } = useAuth();
    const { isDark } = useColorScheme();

    const [messages, setMessages] = useState<Message[]>([]);
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [newMessage, setNewMessage] = useState('');
    const flatListRef = useRef<FlatList>(null);
    const [isTyping, setIsTyping] = useState(false); // Mock typing state

    useEffect(() => {
        if (!user || !otherUserId) return;

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
            if (channel) {
                supabase.removeChannel(channel);
            }
        };
    }, [user?.id, otherUserId]);

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

    const renderDateSeparator = (date: Date) => (
        <View className="items-center my-4">
            <View className="bg-gray-200 dark:bg-gray-700 rounded-full px-3 py-1">
                <Text className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">
                    {date.toDateString() === new Date().toDateString() ? 'Today' : date.toLocaleDateString()}
                </Text>
            </View>
        </View>
    );

    return (
        <View className="flex-1 bg-white dark:bg-gray-900">
            <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />
            <SafeAreaView className="flex-1" edges={['top']}>
                {/* Header */}
                <View className="flex-row items-center px-4 py-3 border-b border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-800 z-10 shadow-sm">
                    <TouchableOpacity onPress={() => navigation.goBack()} className="mr-3 p-2 -ml-2 rounded-full active:bg-gray-50 dark:active:bg-gray-700">
                        <MaterialCommunityIcons name="arrow-left" size={24} color={isDark ? "#fff" : "#333"} />
                    </TouchableOpacity>


                    <TouchableOpacity
                        className="flex-1 flex-row items-center"
                        onPress={() => {
                            // Navigate to Mentor Profile if needed
                            // navigation.navigate('MentorDetail', { mentorId: otherUserId, ... })
                        }}
                    >
                        <View className="mr-3">
                            <GradientAvatar
                                source={{ uri: 'https://via.placeholder.com/150' }} // Fallback or pass avatar
                                size={40}
                                online={true}
                            />
                        </View>
                        <View>
                            <Text className="text-base font-bold text-gray-900 dark:text-white">{otherUserName}</Text>
                            <Text className="text-xs text-green-500 font-medium">Online</Text>
                        </View>
                    </TouchableOpacity>

                    <TouchableOpacity className="bg-red-50 dark:bg-red-900/20 p-2 rounded-full border border-red-100 dark:border-red-900/30">
                        <MaterialCommunityIcons name="alert-circle-outline" size={24} color="#EF4444" />
                    </TouchableOpacity>
                </View>

                {loading ? (
                    <View className="flex-1 items-center justify-center bg-gray-50 dark:bg-gray-900">
                        <ActivityIndicator size="large" color="#30bae8" />
                    </View>
                ) : (
                    <FlatList
                        ref={flatListRef}
                        data={messages}
                        renderItem={({ item, index }) => {
                            const isMyMessage = item.sender_id === user?.id;
                            // Logic to show date separator could go here by comparing with next item
                            return (
                                <MotiView
                                    from={{ opacity: 0, scale: 0.9, translateY: 10 }}
                                    animate={{ opacity: 1, scale: 1, translateY: 0 }}
                                    transition={{ type: 'timing', duration: 300, delay: index * 50 }}
                                >
                                    <MessageBubble
                                        content={item.content}
                                        timestamp={item.created_at}
                                        isMyMessage={isMyMessage}
                                        isRead={true} // Mock read receipt
                                    />
                                </MotiView>
                            );
                        }}
                        keyExtractor={(item, index) => `${item.id}-${index}`}
                        inverted
                        contentContainerStyle={{ paddingVertical: 16, paddingHorizontal: 16 }}
                        className="bg-gray-50 dark:bg-background-dark"
                        ListFooterComponent={
                            <View className="items-center py-4">
                                {isTyping && (
                                    <Text className="text-xs text-gray-400 italic">{otherUserName} is typing...</Text>
                                )}
                            </View>
                        }
                    />
                )}

                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                    keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
                    className="bg-white dark:bg-gray-800 border-t border-gray-100 dark:border-gray-700"
                >
                    <View className="flex-row items-end px-4 py-3 space-x-2">
                        <TouchableOpacity className="mb-3 p-2 text-gray-400">
                            <MaterialCommunityIcons name="plus" size={24} color="#9CA3AF" />
                        </TouchableOpacity>

                        <View className="flex-1 bg-gray-100 dark:bg-gray-700 rounded-2xl px-4 py-2 min-h-[48px] justify-center border border-gray-200 dark:border-gray-600 focus:border-primary">
                            <TextInput
                                className="text-base text-gray-900 dark:text-white max-h-24"
                                placeholder="Message..."
                                placeholderTextColor={isDark ? "#9CA3AF" : "#9CA3AF"}
                                value={newMessage}
                                onChangeText={setNewMessage}
                                multiline
                            />
                        </View>

                        <TouchableOpacity
                            onPress={handleSend}
                            disabled={sending || !newMessage.trim()}
                            className={`w-12 h-12 rounded-full items-center justify-center mb-1 ${!newMessage.trim() ? 'bg-gray-200 dark:bg-gray-700' : 'bg-primary shadow-lg shadow-blue-200'
                                }`}
                        >
                            {sending ? (
                                <ActivityIndicator size="small" color="#fff" />
                            ) : (
                                <MaterialCommunityIcons name="send" size={20} color="white" />
                            )}
                        </TouchableOpacity>
                    </View>
                </KeyboardAvoidingView>
            </SafeAreaView>
        </View>
    );
};
