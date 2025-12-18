import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface AppointmentDetailsCardProps {
    date: string;
    time: string;
    duration: string;
    format: string;
    onEdit?: () => void; // Optional edit capability for the whole block
}

export const AppointmentDetailsCard: React.FC<AppointmentDetailsCardProps> = ({
    date,
    time,
    duration,
    format,
    onEdit
}) => {
    const DetailRow = ({ icon, label, value, subtext }: { icon: string; label: string; value: string; subtext?: string }) => (
        <View className="flex-row items-center mb-5 last:mb-0">
            {/* Update icon styling: h-10 w-10 rounded-full bg-primary/10 */}
            <View className="w-12 h-12 rounded-full bg-primary/10 items-center justify-center mr-4 shadow-sm shadow-primary/10">
                <MaterialCommunityIcons name={icon as any} size={22} color="#30bae8" />
            </View>
            <View className="flex-1 border-b border-gray-100 dark:border-gray-700/50 pb-4">
                {/* Improve text hierarchy with labels and values */}
                <Text className="text-text-sub-light dark:text-text-sub-dark text-xs font-bold uppercase tracking-wider mb-1">
                    {label}
                </Text>
                <Text className="font-bold text-text-main-light dark:text-text-main-dark text-lg font-sans">
                    {value}
                </Text>
                {subtext && (
                    <Text className="text-text-sub-light dark:text-text-sub-dark text-sm mt-0.5 font-medium">{subtext}</Text>
                )}
            </View>
        </View>
    );

    return (
        // Add card header with "Appointment Info" title and "Edit" button
        <View className="bg-white dark:bg-surface-dark p-6 rounded-2xl shadow-card mb-6 border border-gray-100 dark:border-gray-700">
            <View className="flex-row justify-between items-center mb-6">
                <Text className="text-lg font-bold text-text-main-light dark:text-text-main-dark">Appointment Info</Text>
                {onEdit && (
                    <TouchableOpacity onPress={onEdit}>
                        <Text className="text-primary font-bold text-sm">Edit</Text>
                    </TouchableOpacity>
                )}
            </View>

            {/* Redesign detail rows with icon containers */}
            <View>
                <DetailRow icon="calendar-month" label="Date" value={date} />
                <DetailRow icon="clock-time-four-outline" label="Time" value={time} subtext={duration} />
                <DetailRow icon="video-outline" label="Format" value={format} subtext="Link provided after confirmation" />
            </View>
        </View>
    );
};
