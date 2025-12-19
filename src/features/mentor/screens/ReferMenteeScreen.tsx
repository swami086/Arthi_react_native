import React, { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, Image, TextInput, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute, useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useAllMentors } from '../../admin/hooks/useAllMentors'; // Reusing admin hook
import { useAuth } from '../../auth/hooks/useAuth';
import { referMenteeToMentor } from '../../../api/mentorService';
import { Button } from '../../../components/Button';

export const ReferMenteeScreen = () => {
    const route = useRoute<any>();
    const navigation = useNavigation<any>();
    const { menteeId } = route.params;
    const { user } = useAuth();
    const { mentors, loading, fetchMentors } = useAllMentors();
    const [search, setSearch] = useState('');
    const [referring, setReferring] = useState<string | null>(null);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [referralReason, setReferralReason] = useState('');
    const [targetMentorId, setTargetMentorId] = useState<string | null>(null);

    // Filter out self and apply search
    const filteredMentors = mentors.filter(m =>
        m.user_id !== user?.id &&
        (m.full_name?.toLowerCase().includes(search.toLowerCase()) ||
            m.specialization?.toLowerCase().includes(search.toLowerCase()))
    );

    const openReferralModal = (id: string) => {
        setTargetMentorId(id);
        setReferralReason('');
        setIsModalVisible(true);
    };

    const confirmReferral = async () => {
        if (!user?.id || !targetMentorId) return;
        setIsModalVisible(false);
        setReferring(targetMentorId);

        try {
            await referMenteeToMentor(menteeId, user.id, targetMentorId, referralReason || 'No reason provided');
            Alert.alert("Success", "Referral sent successfully", [
                { text: "OK", onPress: () => navigation.goBack() }
            ]);
        } catch (error: any) {
            Alert.alert("Error", error.message);
        } finally {
            setReferring(null);
            setTargetMentorId(null);
        }
    };

    const renderItem = ({ item }: { item: any }) => (
        <View className="bg-white dark:bg-gray-800 p-4 rounded-xl mb-3 shadow-sm flex-row items-center">
            <View className="h-12 w-12 bg-gray-200 rounded-full overflow-hidden mr-3">
                {item.avatar_url && (
                    <Image source={{ uri: item.avatar_url }} className="h-full w-full" />
                )}
            </View>
            <View className="flex-1 mr-2">
                <Text className="font-bold text-base text-text-main-light dark:text-white">{item.full_name}</Text>
                <Text className="text-xs text-text-sub-light dark:text-gray-400">{item.specialization}</Text>
            </View>
            <Button
                title="Refer"
                onPress={() => openReferralModal(item.user_id)}
                loading={referring === item.user_id}
                variant="outline"
            />
        </View>
    );

    return (
        <SafeAreaView className="flex-1 bg-background-light dark:bg-background-dark">
            <View className="px-6 py-4 bg-white dark:bg-gray-800 shadow-sm z-10">
                <View className="flex-row items-center mb-4">
                    <TouchableOpacity onPress={() => navigation.goBack()} className="mr-4">
                        <Icon name="arrow-left" size={24} color="#4e8597" />
                    </TouchableOpacity>
                    <Text className="text-xl font-bold text-text-main-light dark:text-white">Refer Mentee</Text>
                </View>
                <View className="bg-gray-100 dark:bg-gray-700 rounded-lg flex-row items-center px-3 py-2">
                    <Icon name="magnify" size={20} color="#999" />
                    <TextInput
                        placeholder="Search mentors..."
                        value={search}
                        onChangeText={setSearch}
                        className="flex-1 ml-2 text-text-main-light dark:text-white"
                        placeholderTextColor="#999"
                    />
                </View>
            </View>

            <FlatList
                data={filteredMentors}
                renderItem={renderItem}
                keyExtractor={(item, index) => `${item.user_id}-${index}`}
                contentContainerStyle={{ padding: 24 }}
                refreshing={loading}
                onRefresh={fetchMentors}
            />

            {/* Referral Reason Modal */}
            {isModalVisible && (
                <View className="absolute inset-0 bg-black/50 justify-center items-center p-4 z-50">
                    <View className="bg-white dark:bg-gray-800 p-6 rounded-xl w-full max-w-sm">
                        <Text className="text-lg font-bold mb-4 text-text-main-light dark:text-white">Confirm Referral</Text>
                        <Text className="text-sm text-gray-500 mb-2">Reason for referral (optional):</Text>
                        <TextInput
                            value={referralReason}
                            onChangeText={setReferralReason}
                            placeholder="e.g. Specialized expertise needed"
                            className="bg-gray-100 dark:bg-gray-700 p-3 rounded-lg mb-4 text-text-main-light dark:text-white"
                            multiline
                        />
                        <View className="flex-row justify-end space-x-3 gap-3">
                            <TouchableOpacity onPress={() => setIsModalVisible(false)} className="py-2 px-4">
                                <Text className="text-gray-500 font-bold">Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={confirmReferral} className="bg-primary py-2 px-4 rounded-lg">
                                <Text className="text-white font-bold">Refer</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            )}
        </SafeAreaView>
    );
};
