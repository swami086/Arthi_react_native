import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { formatDistanceToNow } from 'date-fns';

interface ConversationCardProps {
    name: string;
    avatarUrl?: string;
    lastMessage: string;
    timestamp: string;
    unreadCount?: number;
    isOnline?: boolean;
    onPress: () => void;
}

export const ConversationCard: React.FC<ConversationCardProps> = ({
    name,
    avatarUrl,
    lastMessage,
    timestamp,
    unreadCount = 0,
    isOnline = false,
    onPress
}) => {
    return (
        <TouchableOpacity
            onPress={onPress}
            activeOpacity={0.7}
            className={`flex-row items-center p-4 mb-2 rounded-2xl ${unreadCount > 0 ? 'bg-blue-50/50 dark:bg-blue-900/20' : 'bg-white dark:bg-gray-800'
                }`}
        >
            <View className="relative mr-4">
                <View className="w-14 h-14 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
                    {avatarUrl ? (
                        <Image source={{ uri: avatarUrl }} className="w-full h-full" />
                    ) : (
                        <View className="w-full h-full items-center justify-center bg-blue-100 dark:bg-blue-900">
                            <Text className="text-xl font-bold text-primary">{name.charAt(0)}</Text>
                        </View>
                    )}
                </View>
                {isOnline && (
                    <View className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-white dark:border-gray-800" />
                )}
            </View>

            <View className="flex-1">
                <View className="flex-row justify-between items-center mb-1">
                    <Text className={`text-base text-gray-900 dark:text-white ${unreadCount > 0 ? 'font-bold' : 'font-semibold'}`}>
                        {name}
                    </Text>
                    <Text className={`text-xs ${unreadCount > 0 ? 'text-primary font-bold' : 'text-gray-400 dark:text-gray-500'}`}>
                        {formatDistanceToNow(new Date(timestamp), { addSuffix: true }).replace('about ', '')}
                    </Text>
                </View>
                <View className="flex-row justify-between items-center">
                    <Text
                        className={`text-sm flex-1 mr-4 ${unreadCount > 0 ? 'text-gray-900 dark:text-white font-medium' : 'text-gray-500 dark:text-gray-400'}`}
                        numberOfLines={1}
                    >
                        {lastMessage}
                    </Text>
                    {unreadCount > 0 ? (
                        <View className="bg-primary rounded-full min-w-[20px] h-5 items-center justify-center px-1.5">
                            <Text className="text-white text-xs font-bold">{unreadCount}</Text>
                        </View>
                    ) : (
                        <MaterialCommunityIcons name="check-all" size={16} color="#30bae8" />
                    )}
                </View>
            </View>
        </TouchableOpacity>
    );
};
