import React from 'react';
import { View, Text, TouchableOpacity, Animated } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { GradientAvatar } from './GradientAvatar';
import { TagPill } from './TagPill';

interface MentorCardProps {
    name: string;
    role: string;
    imageUrl?: string;
    rating?: number;
    bio: string;
    expertise: string[];
    isOnline?: boolean;
    onPress: () => void;
}

export const MentorCard: React.FC<MentorCardProps> = ({
    name,
    role,
    imageUrl,
    rating = 4.8, // Default
    bio,
    expertise,
    isOnline = false,
    onPress
}) => {
    const scaleValue = React.useRef(new Animated.Value(1)).current;

    const handlePressIn = () => {
        Animated.spring(scaleValue, {
            toValue: 0.98,
            useNativeDriver: true,
        }).start();
    };

    const handlePressOut = () => {
        Animated.spring(scaleValue, {
            toValue: 1,
            useNativeDriver: true,
        }).start();
    };

    return (
        <Animated.View style={{ transform: [{ scale: scaleValue }] }}>
            <TouchableOpacity
                onPress={onPress}
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}
                activeOpacity={0.9}
                className="bg-white p-5 rounded-2xl mb-4 shadow-sm border border-gray-100 flex-row"
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
                                {role || 'Mentor'}
                            </Text>
                            <Text className="text-lg font-bold text-gray-900 mb-1 leading-6">
                                {name}
                            </Text>
                        </View>
                        <View className="bg-yellow-50 px-2 py-0.5 rounded-md flex-row items-center border border-yellow-100">
                            <MaterialCommunityIcons name="star" size={14} color="#FFD700" />
                            <Text className="text-xs font-bold text-gray-800 ml-1">{rating}</Text>
                        </View>
                    </View>

                    <Text className="text-gray-500 text-sm leading-5 mb-3" numberOfLines={2}>
                        {bio || 'No bio available.'}
                    </Text>

                    <View className="flex-row flex-wrap">
                        {expertise.slice(0, 3).map((tag, index) => (
                            <TagPill key={index} label={tag} color="blue" />
                        ))}
                        {expertise.length > 3 && (
                            <TagPill label={`+${expertise.length - 3}`} color="gray" />
                        )}
                    </View>
                </View>
            </TouchableOpacity>
        </Animated.View>
    );
};
