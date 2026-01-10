import React from 'react';
import { View, Text, FlatList, TouchableOpacity, Image, Alert, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { usePendingTherapists } from '../hooks/usePendingTherapists';
import { useAuth } from '../../auth/hooks/useAuth';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';

export const PendingApprovalsScreen = () => {
    const { user } = useAuth();
    const { pendingTherapists, loading, fetchPending, handleApprove, handleReject, actionLoading, error } = usePendingTherapists(user?.id);
    const navigation = useNavigation<any>();

    const [modalVisible, setModalVisible] = React.useState(false);
    const [actionType, setActionType] = React.useState<'approve' | 'reject' | null>(null);
    const [selectedTherapist, setSelectedTherapist] = React.useState<{ id: string, name: string } | null>(null);
    const [inputReason, setInputReason] = React.useState('');

    const openActionModal = (therapist: { user_id: string, full_name: string }, type: 'approve' | 'reject') => {
        setSelectedTherapist({ id: therapist.user_id, name: therapist.full_name });
        setActionType(type);
        setInputReason('');
        setModalVisible(true);
    };

    const confirmAction = () => {
        if (!selectedTherapist || !actionType) return;
        setModalVisible(false);
        if (actionType === 'approve') {
            handleApprove(selectedTherapist.id, inputReason); // Reason acts as notes for approval
        } else {
            handleReject(selectedTherapist.id, inputReason || 'No reason provided');
        }
    };

    const renderItem = ({ item }: { item: any }) => (
        <View className="bg-white dark:bg-gray-800 p-4 rounded-xl mb-3 shadow-sm">
            <View className="flex-row items-center mb-3">
                <View className="h-12 w-12 bg-gray-200 rounded-full overflow-hidden mr-3">
                    {item.avatar_url && (
                        <Image source={{ uri: item.avatar_url }} className="h-full w-full" />
                    )}
                </View>
                <View className="flex-1">
                    <Text className="font-bold text-lg text-text-main-light dark:text-white">{item.full_name}</Text>
                    <Text className="text-sm text-text-sub-light dark:text-gray-400">{item.specialization || 'No Specialization'}</Text>
                </View>
                <View className="bg-yellow-100 dark:bg-yellow-900/30 px-2 py-1 rounded">
                    <Text className="text-xs font-bold text-yellow-700 dark:text-yellow-400 capitalize">{item.approval_status}</Text>
                </View>
            </View>

            <View className="flex-row justify-end space-x-2 mt-2">
                <TouchableOpacity
                    onPress={() => navigation.navigate('TherapistReview', { therapist: item })} // Detail view
                    className="bg-gray-100 dark:bg-gray-700 px-4 py-2 rounded-lg mr-2"
                >
                    <Text className="text-gray-700 dark:text-gray-300 font-semibold">Review</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    onPress={() => openActionModal(item, 'reject')}
                    disabled={actionLoading === item.user_id}
                    className="bg-red-50 dark:bg-red-900/20 px-4 py-2 rounded-lg mr-2"
                >
                    <Text className="text-red-600 dark:text-red-400 font-semibold">Reject</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    onPress={() => openActionModal(item, 'approve')}
                    disabled={actionLoading === item.user_id}
                    className="bg-green-50 dark:bg-green-900/20 px-4 py-2 rounded-lg"
                >
                    <Text className="text-green-600 dark:text-green-400 font-semibold">Approve</Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    return (
        <SafeAreaView className="flex-1 bg-background-light dark:bg-background-dark">
            <View className="px-6 py-4 flex-row items-center bg-white dark:bg-gray-800 shadow-sm z-10">
                <TouchableOpacity onPress={() => navigation.goBack()} className="mr-4">
                    <Icon name="arrow-left" size={24} color="#4e8597" />
                </TouchableOpacity>
                <Text className="text-xl font-bold text-text-main-light dark:text-white">Pending Approvals</Text>
            </View>

            {error && (
                <View className="mx-6 mt-4 p-3 bg-red-100 dark:bg-red-900/30 rounded-lg">
                    <Text className="text-red-800 dark:text-red-200">{error}</Text>
                </View>
            )}

            <FlatList
                data={pendingTherapists}
                renderItem={renderItem}
                keyExtractor={(item, index) => `${item.user_id}-${index}`}
                contentContainerStyle={{ padding: 24 }}
                refreshing={loading}
                onRefresh={fetchPending}
                ListEmptyComponent={
                    <View className="items-center justify-center mt-20">
                        <Icon name="check-circle-outline" size={64} color="#ccc" />
                        <Text className="text-gray-400 mt-4 text-center">No pending approvals found.{'\n'}All caught up!</Text>
                    </View>
                }
            />

            {/* Action Modal */}
            {modalVisible && (
                <View className="absolute inset-0 bg-black/50 justify-center items-center p-4 z-50">
                    <View className="bg-white dark:bg-gray-800 p-6 rounded-xl w-full max-w-sm">
                        <Text className="text-lg font-bold mb-4 text-text-main-light dark:text-white">
                            {actionType === 'approve' ? 'Approve Therapist' : 'Reject Therapist'}
                        </Text>
                        <Text className="text-sm text-gray-500 mb-2">
                            {actionType === 'approve'
                                ? `Add approval notes for ${selectedTherapist?.name} (optional):`
                                : `Reason for rejecting ${selectedTherapist?.name}:`
                            }
                        </Text>
                        <TextInput
                            value={inputReason}
                            onChangeText={setInputReason}
                            placeholder={actionType === 'approve' ? "e.g. Verified via call" : "e.g. Incomplete profile"}
                            className="bg-gray-100 dark:bg-gray-700 p-3 rounded-lg mb-4 text-text-main-light dark:text-white"
                            multiline
                        />
                        <View className="flex-row justify-end space-x-3 gap-3">
                            <TouchableOpacity onPress={() => setModalVisible(false)} className="py-2 px-4">
                                <Text className="text-gray-500 font-bold">Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={confirmAction}
                                className={`py-2 px-4 rounded-lg ${actionType === 'approve' ? 'bg-green-600' : 'bg-red-600'}`}
                            >
                                <Text className="text-white font-bold">
                                    {actionType === 'approve' ? 'Approve' : 'Reject'}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            )}
        </SafeAreaView>
    );
};
