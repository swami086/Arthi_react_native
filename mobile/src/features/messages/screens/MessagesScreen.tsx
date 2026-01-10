import React, { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, StatusBar, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useMessages, Conversation } from '../hooks/useMessages';
import { useProfile } from '../../profile/hooks/useProfile';
import { ConversationCard } from '../../../components/ConversationCard';
import { MainTabCompositeProp } from '../../../navigation/types';

import { MotiView } from 'moti';
import { useColorScheme } from '../../../hooks/useColorScheme';

import { withRollbarPerformance } from '../../../services/rollbar';

export const MessagesScreen = () => {
    const { conversations, loading, error } = useMessages();
    const { profile } = useProfile();
    const { isDark } = useColorScheme();
    const navigation = useNavigation<MainTabCompositeProp>();
    const [searchQuery, setSearchQuery] = useState('');

    const filteredConversations = conversations.filter(c => {
        const matchesSearch = c.otherUser?.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            c.lastMessage?.content?.toLowerCase()?.includes(searchQuery.toLowerCase());

        let matchesRole = true;
        if (profile?.role === 'therapist') {
            matchesRole = c.otherUser?.role === 'patient';
        } else if (profile?.role === 'patient') {
            matchesRole = c.otherUser?.role === 'therapist';
        }

        return matchesSearch && matchesRole;
    });

    const renderConversation = ({ item, index }: { item: Conversation, index: number }) => (
        <MotiView
            from={{ opacity: 0, translateY: 20 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ delay: index * 100, type: 'timing', duration: 350 }}
        >
            <ConversationCard
                name={item.otherUser?.full_name || 'Unknown User'}
                avatarUrl={undefined} // Add avatar to schema if available
                lastMessage={item.lastMessage?.content || ''}
                timestamp={item.lastMessage?.created_at || new Date().toISOString()}
                unreadCount={0}
                isOnline={Math.random() > 0.7} // Mock online status
                onPress={() => navigation.navigate('ChatDetail', {
                    otherUserId: item.otherUser?.user_id || item.otherUserId,
                    otherUserName: item.otherUser?.full_name || 'Unknown User'
                })}
            />
        </MotiView>
    );

    return (
        <View className="flex-1 bg-gray-50 dark:bg-background-dark">
            <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />
            <SafeAreaView className="flex-1" edges={['top']}>
                {/* Header */}
                <View className="px-6 py-4 bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700 mb-2">
                    <View className="flex-row justify-between items-center mb-4">
                        <Text className="text-2xl font-bold text-gray-900 dark:text-white">Messages</Text>
                        <TouchableOpacity className="p-2 bg-blue-50 dark:bg-blue-900/30 rounded-full">
                            <MaterialCommunityIcons name="square-edit-outline" size={20} color="#30bae8" />
                        </TouchableOpacity>
                    </View>

                    {/* Search Bar */}
                    <View className="flex-row items-center bg-gray-100 dark:bg-gray-700 rounded-xl px-4 py-3">
                        <MaterialCommunityIcons name="magnify" size={20} color={isDark ? "#9CA3AF" : "#9CA3AF"} />
                        <TextInput
                            className="flex-1 ml-2 text-base text-gray-900 dark:text-white"
                            placeholder="Search messages..."
                            placeholderTextColor={isDark ? "#9CA3AF" : "#9CA3AF"}
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                        />
                    </View>
                </View>

                {loading ? (
                    <View className="flex-1 items-center justify-center">
                        <ActivityIndicator size="large" color="#30bae8" />
                    </View>
                ) : error ? (
                    <Text className="text-red-500 text-center mt-10">{error}</Text>
                ) : (
                    <FlatList
                        data={filteredConversations}
                        renderItem={renderConversation}
                        keyExtractor={(item, index) => `${item.otherUserId}-${index}`}
                        contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 10 }}
                        ListFooterComponent={
                            <View className="mt-8 mb-10 items-center flex-row justify-center opacity-60">
                                <MaterialCommunityIcons name="shield-lock-outline" size={16} color="#6B7280" />
                                <Text className="text-gray-500 text-xs ml-2">Messages are private and secure</Text>
                            </View>
                        }
                        ListEmptyComponent={
                            <View className="items-center justify-center mt-20">
                                <MaterialCommunityIcons name="message-text-outline" size={48} color={isDark ? "#4B5563" : "#D1D5DB"} />
                                <Text className="text-gray-400 dark:text-gray-500 mt-4 font-medium">No messages yet</Text>
                            </View>
                        }
                    />
                )}
            </SafeAreaView>
        </View>
    );
};

export default withRollbarPerformance(MessagesScreen, 'Messages');
