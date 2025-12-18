import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { GradientAvatar } from './GradientAvatar';

interface MenteeCardProps {
    name: string;
    age?: number | null;
    education?: string | null;
    avatar?: string | null;
    status: string;
    statusColor: string;
    nextInfo?: string;
    onMessage: () => void;
    onViewProfile: () => void;
}

export const MenteeCard: React.FC<MenteeCardProps> = ({
    name, age, education, avatar, status, statusColor, nextInfo, onMessage, onViewProfile
}) => {
    return (
        <TouchableOpacity
            onPress={onViewProfile}
            className="bg-white dark:bg-gray-800 p-4 rounded-2xl mb-3 shadow-sm border border-gray-100 dark:border-gray-700 flex-row items-center"
        >
            <View className="relative mr-4">
                <GradientAvatar
                    source={avatar ? { uri: avatar } : { uri: 'https://via.placeholder.com/150' }}
                    size={60}
                    online={true}
                />
            </View>

            <View className="flex-1">
                <View className="flex-row justify-between items-start mb-1">
                    <Text className="text-gray-900 dark:text-white font-bold text-lg">{name}</Text>
                    <View className={`px-2 py-1 rounded-full bg-opacity-10`} style={{ backgroundColor: `${statusColor}20` }}>
                        <Text style={{ color: statusColor }} className="text-xs font-bold">{status}</Text>
                    </View>
                </View>

                <Text className="text-gray-500 dark:text-gray-400 text-xs mb-2">
                    {age ? `${age} yrs` : ''}
                    {education ? ` • ${education}` : ''}
                </Text>

                {nextInfo && (
                    <View className="flex-row items-center mb-2">
                        <MaterialCommunityIcons name="calendar-clock" size={12} color="#9CA3AF" />
                        <Text className="text-gray-400 dark:text-gray-500 text-xs ml-1">{nextInfo}</Text>
                    </View>
                )}

                <View className="flex-row mt-1">
                    <TouchableOpacity onPress={onMessage} className="bg-gray-50 dark:bg-gray-700 px-4 py-2 rounded-lg mr-2 flex-1 items-center">
                        <Text className="text-gray-700 dark:text-gray-200 font-bold text-xs">Message</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={onViewProfile} className="bg-blue-50 dark:bg-blue-900/30 px-4 py-2 rounded-lg flex-1 items-center">
                        <Text className="text-blue-600 dark:text-blue-400 font-bold text-xs">Profile</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </TouchableOpacity>
    );
};
