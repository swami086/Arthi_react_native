import React from 'react';
import { View, Text, TouchableOpacity, Linking, Alert } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { GradientAvatar } from './GradientAvatar';

interface SessionCardProps {
    title: string;
    date: string;
    duration: string;
    status: 'confirmed' | 'pending' | 'completed' | 'cancelled';
    menteeName: string;
    menteeAvatar?: string | null;
    meetingLink?: string | null;
    feedback?: string | null;
    onPress: () => void;
}

export const SessionCard: React.FC<SessionCardProps> = ({
    title, date, duration, status, menteeName, menteeAvatar, meetingLink, feedback, onPress
}) => {
    const getStatusColor = () => {
        switch (status) {
            case 'confirmed': return '#10B981';
            case 'pending': return '#F59E0B';
            case 'completed': return '#3B82F6';
            case 'cancelled': return '#EF4444';
            default: return '#9CA3AF';
        }
    };
    const statusColor = getStatusColor();

    return (
        <TouchableOpacity
            onPress={onPress}
            className="bg-white dark:bg-gray-800 p-4 rounded-xl mb-3 shadow-sm border-l-4"
            style={{ borderLeftColor: statusColor }}
        >
            <View className="flex-row justify-between items-start mb-2">
                <View>
                    <Text className="font-bold text-gray-900 dark:text-white text-base">{title}</Text>
                    <View className="flex-row items-center mt-1">
                        <MaterialCommunityIcons name="clock-outline" size={14} color="#6B7280" />
                        <Text className="text-gray-500 dark:text-gray-400 text-xs ml-1">{date} • {duration}</Text>
                    </View>
                </View>
                <View className={`px-2 py-1 rounded-full bg-opacity-10`} style={{ backgroundColor: `${statusColor}20` }}>
                    <MaterialCommunityIcons
                        name={
                            status === 'confirmed' ? 'check-circle' :
                                status === 'pending' ? 'clock' :
                                    status === 'completed' ? 'checkbox-marked-circle' : 'close-circle'
                        }
                        size={16}
                        color={statusColor}
                    />
                </View>
            </View>

            <View className="flex-row items-center mt-2 pt-2 border-t border-gray-100 dark:border-gray-700 justify-between">
                <View className="flex-row items-center">
                    <GradientAvatar
                        source={menteeAvatar ? { uri: menteeAvatar } : { uri: 'https://via.placeholder.com/150' }}
                        size={24}
                    />
                    <Text className="text-gray-600 dark:text-gray-400 text-sm ml-2 font-medium">with {menteeName}</Text>
                </View>

                {status === 'confirmed' && meetingLink && (
                    <TouchableOpacity
                        className="bg-blue-50 dark:bg-blue-900/30 px-3 py-1.5 rounded-full"
                        onPress={() => {
                            if (meetingLink) {
                                Linking.openURL(meetingLink).catch(err => Alert.alert("Error", "Could not open link"));
                            }
                        }}
                    >
                        <Text className="text-primary font-bold text-xs">Join Call</Text>
                    </TouchableOpacity>
                )}
            </View>

            {feedback && (status === 'completed' || status === 'confirmed') && (
                <View className="mt-2 bg-gray-50 dark:bg-gray-700 p-2 rounded-lg">
                    <Text className="text-gray-500 dark:text-gray-400 text-xs italic" numberOfLines={2}>"{feedback}"</Text>
                </View>
            )}
        </TouchableOpacity>
    );
};
