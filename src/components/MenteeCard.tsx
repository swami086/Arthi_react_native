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
            className="bg-surface dark:bg-surface-dark p-4 rounded-2xl mb-3 shadow-soft dark:shadow-none border border-border dark:border-border-dark flex-row items-center gap-4"
        >
            <View className="relative">
                <GradientAvatar
                    source={avatar ? { uri: avatar } : { uri: 'https://via.placeholder.com/150' }}
                    size={64}
                    online={true}
                />
            </View>

            <View className="flex-1 gap-2">
                <View className="flex-row justify-between items-start">
                    <View>
                        <Text className="text-text-primary dark:text-text-primary-dark font-bold text-lg leading-tight font-primary">{name}</Text>
                        <Text className="text-text-secondary dark:text-text-secondary-dark text-xs font-medium font-primary">
                            {age ? `${age} yrs` : ''}
                            {education ? ` • ${education}` : ''}
                        </Text>
                    </View>
                    <View className={`px-2 py-1 rounded-full bg-opacity-10`} style={{ backgroundColor: `${statusColor}20` }}>
                        <Text style={{ color: statusColor }} className="text-xs font-bold font-primary capitalize">{status}</Text>
                    </View>
                </View>

                {nextInfo && (
                    <View className="flex-row items-center gap-1">
                        <MaterialCommunityIcons name="calendar-clock" size={14} className="text-text-secondary dark:text-text-secondary-dark" color="#4f626b" />
                        <Text className="text-text-secondary dark:text-text-secondary-dark text-xs font-primary">{nextInfo}</Text>
                    </View>
                )}

                <View className="flex-row gap-2 mt-1">
                    <TouchableOpacity
                        onPress={onMessage}
                        className="bg-background dark:bg-background-dark px-3 py-2 rounded-xl flex-1 items-center justify-center border border-border dark:border-border-dark"
                    >
                        <Text className="text-text-primary dark:text-text-primary-dark font-semibold text-xs font-primary">Message</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={onViewProfile}
                        className="bg-primary/10 dark:bg-primary-dark/20 px-3 py-2 rounded-xl flex-1 items-center justify-center"
                    >
                        <Text className="text-primary dark:text-primary-dark font-semibold text-xs font-primary">Profile</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </TouchableOpacity>
    );
};
