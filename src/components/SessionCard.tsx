import React from 'react';
import { View, Text, TouchableOpacity, Linking, Alert } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { GradientAvatar } from './GradientAvatar';
import { MotiView } from 'moti';

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
        <MotiView
            animate={{ scale: 1 }}
            transition={{ type: 'timing', duration: 200 }}
        >
            <TouchableOpacity
                onPress={onPress}
                // Redesign card layout with left border color coding
                // Improve shadow and border effects
                className="bg-white dark:bg-surface-dark p-5 rounded-2xl mb-4 shadow-card border-l-[6px] relative overflow-hidden active:opacity-95"
                style={{ borderLeftColor: statusColor }}
            >
                <View className="flex-row justify-between items-start mb-3">
                    <View className="flex-1 mr-2">
                        {/* Enhance text hierarchy */}
                        <Text className="font-bold text-text-main-light dark:text-text-main-dark text-lg font-sans leading-tight">{title}</Text>
                        <View className="flex-row items-center mt-1.5">
                            <MaterialCommunityIcons name="clock-time-four-outline" size={16} color={statusColor} />
                            <Text className="text-text-sub-light dark:text-text-sub-dark text-sm ml-1.5 font-medium">{date} • {duration}</Text>
                        </View>
                    </View>

                    {/* Status Badge */}
                    <View
                        className="px-2.5 py-1 rounded-md"
                        style={{ backgroundColor: `${statusColor}15` }}
                    >
                        <Text
                            className="text-[10px] font-bold uppercase tracking-wider"
                            style={{ color: statusColor }}
                        >
                            {status}
                        </Text>
                    </View>
                </View>

                <View className="flex-row items-center mt-3 pt-3 border-t border-gray-100 dark:border-gray-700/50 justify-between">
                    <View className="flex-row items-center">
                        <View className="shadow-sm shadow-black/10 rounded-full">
                            {/* Update avatar styling with status indicator */}
                            <GradientAvatar
                                source={menteeAvatar ? { uri: menteeAvatar } : { uri: 'https://via.placeholder.com/150' }}
                                size={32}
                            />
                        </View>
                        <Text className="text-text-main-light dark:text-text-main-dark text-sm ml-3 font-bold">with {menteeName}</Text>
                    </View>

                    {/* Add action buttons with proper styling */}
                    {status === 'confirmed' && meetingLink && (
                        <TouchableOpacity
                            className="bg-primary flex-row items-center px-4 py-2 rounded-xl shadow-md shadow-primary/20"
                            onPress={() => {
                                if (meetingLink) {
                                    Linking.openURL(meetingLink).catch(err => Alert.alert("Error", "Could not open link"));
                                }
                            }}
                        >
                            <MaterialCommunityIcons name="video" size={16} color="white" style={{marginRight: 6}} />
                            <Text className="text-white font-bold text-xs">Join</Text>
                        </TouchableOpacity>
                    )}
                </View>

                {feedback && (status === 'completed' || status === 'confirmed') && (
                    <View className="mt-3 bg-gray-50 dark:bg-gray-800/50 p-3 rounded-xl border border-gray-100 dark:border-gray-700/50">
                        <Text className="text-text-sub-light dark:text-text-sub-dark text-xs italic leading-relaxed" numberOfLines={2}>"{feedback}"</Text>
                    </View>
                )}
            </TouchableOpacity>
        </MotiView>
    );
};
