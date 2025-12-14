import React from 'react';
import { View, Text } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { format } from 'date-fns';

interface MessageBubbleProps {
    content: string;
    timestamp: string;
    isMyMessage: boolean;
    isRead?: boolean;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({
    content,
    timestamp,
    isMyMessage,
    isRead = false
}) => {
    return (
        <View
            className={`max-w-[80%] mb-3 px-4 py-3 shadow-sm ${isMyMessage
                    ? 'bg-primary self-end rounded-2xl rounded-br-sm'
                    : 'bg-white self-start rounded-2xl rounded-bl-sm border border-gray-100'
                }`}
        >
            <Text className={`text-base ${isMyMessage ? 'text-white' : 'text-gray-800'}`}>
                {content}
            </Text>
            <View className="flex-row items-center justify-end mt-1 space-x-1">
                <Text className={`text-[10px] ${isMyMessage ? 'text-blue-100' : 'text-gray-400'}`}>
                    {format(new Date(timestamp), 'h:mm a')}
                </Text>
                {isMyMessage && (
                    <MaterialCommunityIcons
                        name={isRead ? "check-all" : "check"}
                        size={12}
                        color={isRead ? "#fff" : "rgba(255,255,255,0.7)"}
                    />
                )}
            </View>
        </View>
    );
};
