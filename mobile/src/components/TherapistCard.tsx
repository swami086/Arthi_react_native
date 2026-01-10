import React, { useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { GradientAvatar } from './GradientAvatar';
import { TagPill } from './TagPill';
import { MotiView } from 'moti';

interface TherapistCardProps {
    name: string;
    role: string;
    imageUrl?: string;
    rating?: number;
    bio: string;
    expertise: string[];
    isOnline?: boolean;
    onPress: () => void;
}



export const TherapistCard: React.FC<TherapistCardProps> = ({
    name,
    role,
    imageUrl,
    rating = 4.8, // Default
    bio,
    expertise,
    isOnline = false,
    onPress
}) => {
    const [pressed, setPressed] = useState(false);

    return (
        <MotiView
            animate={pressed ? { scale: 0.98, shadowOpacity: 0.3 } : { scale: 1, shadowOpacity: 0.1 }}
            transition={{ type: 'spring', damping: 15 }}
            style={{ marginBottom: 16 }}
        >
            <Pressable
                onPress={onPress}
                onPressIn={() => setPressed(true)}
                onPressOut={() => setPressed(false)}
                className="bg-white dark:bg-gray-800 p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex-row"
            >
                <View className="mr-4">
                    <GradientAvatar
                        source={{ uri: imageUrl || 'https://via.placeholder.com/150' }}
                        size={80}
                        online={isOnline}
                    />
                </View>

                <View className="flex-1 justify-center">
                    <View className="flex-row justify-between items-start">
                        <View>
                            <Text className="text-primary font-bold text-xs uppercase tracking-wider mb-1">
                                {role || 'Therapist'}
                            </Text>
                            <Text className="text-lg font-bold text-gray-900 dark:text-white mb-1 leading-6">
                                {name}
                            </Text>
                        </View>
                        <View className="bg-yellow-50 dark:bg-yellow-900/30 px-2 py-0.5 rounded-md flex-row items-center border border-yellow-100 dark:border-yellow-800">
                            <MaterialCommunityIcons name="star" size={14} color="#FFD700" />
                            <Text className="text-xs font-bold text-gray-800 dark:text-gray-200 ml-1">{rating}</Text>
                        </View>
                    </View>

                    <Text className="text-gray-500 dark:text-gray-400 text-sm leading-5 mb-3" numberOfLines={2}>
                        {bio || 'No bio available.'}
                    </Text>

                    <View className="flex-row flex-wrap">
                        {expertise.slice(0, 3).map((tag, index) => (
                            <MotiView
                                key={index}
                                from={{ opacity: 0, translateY: 10 }}
                                animate={{ opacity: 1, translateY: 0 }}
                                transition={{ type: 'timing', duration: 300, delay: index * 50 }}
                            >
                                <TagPill label={tag} color="blue" />
                            </MotiView>
                        ))}
                        {expertise.length > 3 && (
                            <MotiView
                                from={{ opacity: 0, translateY: 10 }}
                                animate={{ opacity: 1, translateY: 0 }}
                                transition={{ type: 'timing', duration: 300, delay: 150 }}
                            >
                                <TagPill label={`+${expertise.length - 3}`} color="gray" />
                            </MotiView>
                        )}
                    </View>
                </View>
            </Pressable>
        </MotiView>
    );
};
