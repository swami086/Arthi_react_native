import React from 'react';
import { View, Text } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface AppointmentDetailsCardProps {
    date: string;
    time: string;
    duration: string;
    format: string;
}

export const AppointmentDetailsCard: React.FC<AppointmentDetailsCardProps> = ({
    date,
    time,
    duration,
    format
}) => {
    const DetailRow = ({ icon, text, subtext }: { icon: string; text: string; subtext?: string }) => (
        <View className="flex-row items-center mb-4 last:mb-0">
            <View className="w-10 h-10 rounded-full bg-primary/10 items-center justify-center mr-3">
                <MaterialCommunityIcons name={icon as any} size={20} color="#30bae8" />
            </View>
            <View>
                <Text className="font-bold text-gray-900 dark:text-white text-base">
                    {text}
                </Text>
                {subtext && (
                    <Text className="text-gray-500 dark:text-gray-400 text-sm">{subtext}</Text>
                )}
            </View>
        </View>
    );

    return (
        <View className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm mb-4">
            <DetailRow icon="calendar" text={date} />
            <DetailRow icon="clock-outline" text={time} subtext={duration} />
            <DetailRow icon="video" text={format} />
        </View>
    );
};
