import React, { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../auth/hooks/useAuth';
import { useReferrals } from '../hooks/useReferrals';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';

export const ReferralManagementScreen = () => {
    const { user } = useAuth();
    const navigation = useNavigation<any>();
    const { received, sent, loading, fetchReferrals, handleResponse } = useReferrals(user?.id);
    const [viewMode, setViewMode] = useState<'received' | 'sent'>('received');

    const handleAction = async (referralId: string, action: 'accepted' | 'declined') => {
        try {
            await handleResponse(referralId, action);
            Alert.alert("Success", `Referral ${action}`);
        } catch (error: any) {
            Alert.alert("Error", error.message);
        }
    };

    const renderItem = ({ item }: { item: any }) => (
        <View className="bg-white dark:bg-gray-800 p-4 rounded-xl mb-3 shadow-sm">
            <View className="flex-row justify-between mb-2">
                <Text className="font-bold text-base text-text-main-light dark:text-white">
                    {viewMode === 'received' ? `From: ${item.referring_mentor?.full_name}` : `To: ${item.referred_to_mentor?.full_name}`}
                </Text>
                <View className={`px-2 py-1 rounded ${item.status === 'pending' ? 'bg-yellow-100' :
                    item.status === 'accepted' ? 'bg-green-100' : 'bg-red-100'
                    }`}>
                    <Text className={`text-xs font-bold capitalize ${item.status === 'pending' ? 'text-yellow-700' :
                        item.status === 'accepted' ? 'text-green-700' : 'text-red-700'
                        }`}>{item.status}</Text>
                </View>
            </View>

            <Text className="text-sm font-semibold mb-1 text-text-main-light dark:text-gray-300">Mentee: {item.mentee_name || 'Mentee'}</Text>
            <Text className="text-xs text-text-sub-light dark:text-gray-400 italic mb-3">"{item.referral_reason}"</Text>

            {viewMode === 'received' && item.status === 'pending' && (
                <View className="flex-row gap-2 mt-2">
                    <TouchableOpacity
                        onPress={() => handleAction(item.id, 'declined')}
                        className="flex-1 py-2 bg-red-50 dark:bg-red-900/20 rounded-lg items-center"
                    >
                        <Text className="text-red-600 font-bold text-sm">Decline</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={() => handleAction(item.id, 'accepted')}
                        className="flex-1 py-2 bg-green-50 dark:bg-green-900/20 rounded-lg items-center"
                    >
                        <Text className="text-green-600 font-bold text-sm">Accept</Text>
                    </TouchableOpacity>
                </View>
            )}
        </View>
    );

    return (
        <SafeAreaView className="flex-1 bg-background-light dark:bg-background-dark">
            <View className="px-6 py-4 bg-white dark:bg-gray-800 shadow-sm z-10">
                <View className="flex-row items-center mb-4">
                    <TouchableOpacity onPress={() => navigation.goBack()} className="mr-4">
                        <Icon name="arrow-left" size={24} color="#4e8597" />
                    </TouchableOpacity>
                    <Text className="text-xl font-bold text-text-main-light dark:text-white">Referrals</Text>
                </View>

                <View className="flex-row bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                    <TouchableOpacity
                        onPress={() => setViewMode('received')}
                        className={`flex-1 py-2 rounded-md items-center ${viewMode === 'received' ? 'bg-white dark:bg-gray-600 shadow-sm' : ''}`}
                    >
                        <Text className={`font-bold ${viewMode === 'received' ? 'text-primary' : 'text-gray-500'}`}>Received</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={() => setViewMode('sent')}
                        className={`flex-1 py-2 rounded-md items-center ${viewMode === 'sent' ? 'bg-white dark:bg-gray-600 shadow-sm' : ''}`}
                    >
                        <Text className={`font-bold ${viewMode === 'sent' ? 'text-primary' : 'text-gray-500'}`}>Sent</Text>
                    </TouchableOpacity>
                </View>
            </View>

            <FlatList
                data={viewMode === 'received' ? received : sent}
                renderItem={renderItem}
                keyExtractor={(item, index) => `${item.id}-${index}`}
                contentContainerStyle={{ padding: 24 }}
                refreshing={loading}
                onRefresh={fetchReferrals}
                ListEmptyComponent={
                    <View className="items-center justify-center mt-20">
                        <Text className="text-gray-400 text-center">No referrals found.</Text>
                    </View>
                }
            />
        </SafeAreaView>
    );
};
