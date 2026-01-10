import React from 'react';
import { View, Text, TouchableOpacity, Linking, Alert } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { GradientAvatar } from './GradientAvatar';
import { MotiView } from 'moti';
import { tokens } from '../design-system/tokens';

interface SessionCardProps {
    title: string;
    date: string;
    duration: string;
    status: 'confirmed' | 'pending' | 'completed' | 'cancelled';
    patientName: string;
    patientAvatar?: string | null;
    meetingLink?: string | null;
    feedback?: string | null;
    onPress: () => void;
}

export const SessionCard: React.FC<SessionCardProps> = ({
    title, date, duration, status, patientName, patientAvatar, meetingLink, feedback, onPress
}) => {
    const getStatusColor = () => {
        switch (status) {
            case 'confirmed': return tokens.colors.status.success;
            case 'pending': return tokens.colors.status.warning;
            case 'completed': return tokens.colors.status.info;
            case 'cancelled': return tokens.colors.status.error;
            default: return tokens.colors.text.disabled.light;
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
                className="bg-surface dark:bg-surface-dark p-4 rounded-2xl mb-4 shadow-card border-l-[6px] relative overflow-hidden active:opacity-95 border-r border-t border-b border-border dark:border-border-dark"
                style={{ borderLeftColor: statusColor }}
            >
                <View className="flex-row justify-between items-start mb-3 gap-2">
                    <View className="flex-1">
                        <Text className="font-bold text-text-primary dark:text-text-primary-dark text-lg font-primary leading-tight">{title}</Text>
                        <View className="flex-row items-center mt-1.5 gap-1.5">
                            <MaterialCommunityIcons name="clock-time-four-outline" size={16} color={statusColor} />
                            <Text className="text-text-secondary dark:text-text-secondary-dark text-sm font-medium font-primary">{date} • {duration}</Text>
                        </View>
                    </View>

                    <View
                        className="px-2.5 py-1 rounded-md"
                        style={{ backgroundColor: `${statusColor}15` }}
                    >
                        <Text
                            className="text-[10px] font-bold uppercase tracking-wider font-primary"
                            style={{ color: statusColor }}
                        >
                            {status}
                        </Text>
                    </View>
                </View>

                <View className="flex-row items-center mt-3 pt-3 border-t border-border dark:border-border-dark justify-between">
                    <View className="flex-row items-center gap-3">
                        <View className="shadow-soft rounded-full">
                            <GradientAvatar
                                source={patientAvatar ? { uri: patientAvatar } : { uri: 'https://via.placeholder.com/150' }}
                                size={32}
                            />
                        </View>
                        <Text className="text-text-primary dark:text-text-primary-dark text-sm font-bold font-primary">with {patientName}</Text>
                    </View>

                    {status === 'confirmed' && meetingLink && (
                        <TouchableOpacity
                            className="bg-primary flex-row items-center px-4 py-2 rounded-xl shadow-soft"
                            onPress={() => {
                                if (meetingLink) {
                                    Linking.openURL(meetingLink).catch(err => Alert.alert("Error", "Could not open link"));
                                }
                            }}
                        >
                            <MaterialCommunityIcons name="video" size={16} color="white" style={{ marginRight: 6 }} />
                            <Text className="text-white font-bold text-xs font-primary">Join</Text>
                        </TouchableOpacity>
                    )}
                </View>

                {feedback && (status === 'completed' || status === 'confirmed') && (
                    <View className="mt-3 bg-background dark:bg-background-dark p-3 rounded-xl border border-border dark:border-border-dark">
                        <Text className="text-text-secondary dark:text-text-secondary-dark text-xs italic leading-relaxed font-primary" numberOfLines={2}>"{feedback}"</Text>
                    </View>
                )}
            </TouchableOpacity>
        </MotiView>
    );
};
