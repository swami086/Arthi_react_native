import React from 'react';
import { View, Text, FlatList, TouchableOpacity, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { usePendingTherapistRequests } from '../hooks/usePendingTherapistRequests';
import { PendingTherapistRequestCard } from '../../../components/PendingTherapistRequestCard';
import { ErrorBoundary } from '../../../components/ErrorBoundary';

export const PendingTherapistRequestsScreen = () => {
    const navigation = useNavigation();
    const { requests, loading, processingId, refetch, acceptRequest, declineRequest } = usePendingTherapistRequests();

    const renderEmpty = () => (
        <View className="items-center justify-center mt-20 px-8">
            <View className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full items-center justify-center mb-4">
                <Icon name="account-check-outline" size={40} color="#9CA3AF" />
            </View>
            <Text className="text-xl font-bold text-text-main-light dark:text-white mb-2 text-center">
                No Pending Requests
            </Text>
            <Text className="text-gray-500 text-center">
                You don't have any pending therapistship requests at the moment.
            </Text>
        </View>
    );

    return (
        <SafeAreaView className="flex-1 bg-background-light dark:bg-background-dark">
            <View className="px-6 py-4 bg-white dark:bg-gray-800 shadow-sm z-10 flex-row items-center justify-between">
                <View className="flex-row items-center">
                    <TouchableOpacity onPress={() => navigation.goBack()} className="mr-3">
                        <Icon name="arrow-left" size={24} color="#333" />
                    </TouchableOpacity>
                    <View>
                        <Text className="text-xl font-bold text-text-main-light dark:text-white">Pending Requests</Text>
                        <Text className="text-xs text-text-sub-light dark:text-gray-400">Manage incoming invitations</Text>
                    </View>
                </View>
                {requests.length > 0 && (
                    <View className="bg-red-500 rounded-full px-2 py-1">
                        <Text className="text-white text-xs font-bold">{requests.length}</Text>
                    </View>
                )}
            </View>

            <ErrorBoundary>
                <FlatList
                    data={requests}
                    renderItem={({ item }) => (
                        <PendingTherapistRequestCard
                            request={item}
                            onAccept={acceptRequest}
                            onDecline={declineRequest}
                            isProcessing={processingId === item.id}
                        />
                    )}
                    keyExtractor={(item, index) => `${item.id}-${index}`}
                    contentContainerStyle={{ padding: 24 }}
                    ListEmptyComponent={!loading ? renderEmpty : null}
                    refreshControl={
                        <RefreshControl refreshing={loading} onRefresh={refetch} />
                    }
                />
            </ErrorBoundary>
        </SafeAreaView>
    );
};
