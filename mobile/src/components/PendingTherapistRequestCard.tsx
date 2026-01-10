import React from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

interface PendingTherapistRequestCardProps {
    request: any;
    onAccept: (id: string) => void;
    onDecline: (id: string) => void;
    isProcessing: boolean;
}

export const PendingTherapistRequestCard = ({ request, onAccept, onDecline, isProcessing }: PendingTherapistRequestCardProps) => {
    const therapist = request.therapist;

    return (
        <View className="bg-white dark:bg-gray-800 p-4 rounded-xl mb-4 shadow-sm border border-gray-100 dark:border-gray-700">
            <View className="flex-row items-start mb-3">
                <View className="h-12 w-12 bg-gray-200 rounded-full overflow-hidden mr-3">
                    {therapist?.avatar_url ? (
                        <Image source={{ uri: therapist.avatar_url }} className="h-full w-full" />
                    ) : (
                        <View className="h-full w-full items-center justify-center bg-primary-100 dark:bg-primary-900">
                            <Text className="text-xl font-bold text-primary-700 dark:text-primary-300">
                                {therapist?.full_name?.charAt(0) || '?'}
                            </Text>
                        </View>
                    )}
                </View>
                <View className="flex-1">
                    <View className="flex-row justify-between items-center">
                        <Text className="font-bold text-lg text-text-main-light dark:text-white">
                            {therapist?.full_name || 'Unknown Therapist'}
                        </Text>
                        <Text className="text-xs text-text-sub-light dark:text-gray-400">
                            {new Date(request.created_at).toLocaleDateString()}
                        </Text>
                    </View>
                    <Text className="text-sm text-text-sub-light dark:text-gray-400">
                        {therapist?.specialization || 'Therapist'}
                    </Text>
                </View>
            </View>

            {request.notes && (
                <View className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg mb-4">
                    <Text className="text-sm text-gray-600 dark:text-gray-300 italic">
                        "{request.notes}"
                    </Text>
                </View>
            )}

            {therapist?.expertise_areas && (
                <View className="flex-row flex-wrap gap-2 mb-4">
                    {therapist.expertise_areas.slice(0, 3).map((area: string, i: number) => (
                        <View key={i} className="bg-blue-50 dark:bg-blue-900 px-2 py-1 rounded-md">
                            <Text className="text-xs text-blue-700 dark:text-blue-300">{area}</Text>
                        </View>
                    ))}
                </View>
            )}

            <View className="flex-row gap-3">
                <TouchableOpacity
                    onPress={() => onDecline(request.id)}
                    disabled={isProcessing}
                    className="flex-1 py-3 rounded-xl border border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-900/20 items-center justify-center flex-row"
                >
                    <Icon name="close" size={20} color="#EF4444" style={{ marginRight: 4 }} />
                    <Text className="text-red-500 font-bold">Decline</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    onPress={() => onAccept(request.id)}
                    disabled={isProcessing}
                    className="flex-1 py-3 rounded-xl bg-primary-500 items-center justify-center flex-row shadow-sm"
                >
                    <Icon name="check" size={20} color="white" style={{ marginRight: 4 }} />
                    <Text className="text-white font-bold">Accept</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};
