import React from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useMessages, Conversation } from '../hooks/useMessages';

import { useNavigation } from '@react-navigation/native';
import { MainTabCompositeProp } from '../../../navigation/types';

export const MessagesScreen = () => {
    const { conversations, loading, error } = useMessages();
    const navigation = useNavigation<MainTabCompositeProp>();

    const renderConversation = ({ item }: { item: Conversation }) => (
        <TouchableOpacity
            onPress={() => navigation.navigate('ChatDetail', {
                otherUserId: item.otherUser?.user_id || item.otherUserId,
                otherUserName: item.otherUser?.full_name || 'Unknown User'
            })}
            className="bg-white dark:bg-gray-800 p-4 rounded-xl mb-3 flex-row items-center border border-gray-100 dark:border-gray-700"
        >
            <View className="w-12 h-12 bg-primary/20 rounded-full items-center justify-center mr-4">
                <Text className="text-primary font-bold text-lg">
                    {item.otherUser?.full_name?.charAt(0) || '?'}
                </Text>
            </View>
            <View className="flex-1">
                <View className="flex-row justify-between items-center mb-1">
                    <Text className="font-bold text-text-main-light dark:text-text-main-dark text-base">
                        {item.otherUser?.full_name || 'Unknown User'}
                    </Text>
                    <Text className="text-xs text-text-sub-light dark:text-text-sub-dark">
                        {new Date(item.lastMessage.created_at).toLocaleDateString()}
                    </Text>
                </View>
                <Text className="text-text-sub-light dark:text-text-sub-dark" numberOfLines={1}>
                    {item.lastMessage.content}
                </Text>
            </View>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView className="flex-1 bg-background-light dark:bg-background-dark p-6" edges={['top']}>
            <Text className="text-2xl font-bold mb-6 text-text-main-light dark:text-text-main-dark">Messages</Text>

            {loading ? (
                <ActivityIndicator size="large" color="#30bae8" />
            ) : error ? (
                <Text className="text-red-500 text-center">{error}</Text>
            ) : (
                <FlatList
                    data={conversations}
                    renderItem={renderConversation}
                    keyExtractor={item => item.otherUserId}
                />
            )}
        </SafeAreaView>
    );
};
