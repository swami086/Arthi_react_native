import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute, useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useAuth } from '../../auth/hooks/useAuth';
import { approveTherapist, rejectTherapist } from '../../../api/adminService';

export const TherapistReviewScreen = () => {
    const route = useRoute<any>();
    const navigation = useNavigation<any>();
    const { therapist } = route.params;
    const { user } = useAuth();
    const [actionLoading, setActionLoading] = useState(false);

    const handleApprove = async () => {
        if (!user?.id) return;
        setActionLoading(true);
        try {
            await approveTherapist(therapist.user_id, user.id);
            Alert.alert("Success", "Therapist approved successfully", [
                { text: "OK", onPress: () => navigation.goBack() }
            ]);
        } catch (error: any) {
            Alert.alert("Error", error.message);
        } finally {
            setActionLoading(false);
        }
    };

    const handleReject = async () => {
        if (!user?.id) return;
        Alert.prompt(
            "Reject Application",
            "Please provide a reason for rejection:",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Reject",
                    style: "destructive",
                    onPress: async (reason: string | undefined) => {
                        if (!reason) return;
                        setActionLoading(true);
                        try {
                            await rejectTherapist(therapist.user_id, user.id, reason);
                            Alert.alert("Success", "Therapist rejected", [
                                { text: "OK", onPress: () => navigation.goBack() }
                            ]);
                        } catch (error: any) {
                            Alert.alert("Error", error.message);
                        } finally {
                            setActionLoading(false);
                        }
                    }
                }
            ],
            "plain-text"
        );
    };

    return (
        <SafeAreaView className="flex-1 bg-background-light dark:bg-background-dark">
            <View className="px-6 py-4 flex-row items-center bg-white dark:bg-gray-800 shadow-sm z-10">
                <TouchableOpacity onPress={() => navigation.goBack()} className="mr-4">
                    <Icon name="arrow-left" size={24} color="#4e8597" />
                </TouchableOpacity>
                <Text className="text-xl font-bold text-text-main-light dark:text-white">Review Therapist</Text>
            </View>

            <ScrollView contentContainerStyle={{ padding: 24 }}>
                <View className="items-center mb-6">
                    <View className="h-24 w-24 bg-gray-200 rounded-full overflow-hidden mb-3">
                        {therapist.avatar_url ? (
                            <Image source={{ uri: therapist.avatar_url }} className="h-full w-full" />
                        ) : (
                            <View className="h-full w-full items-center justify-center bg-gray-300">
                                <Icon name="account" size={48} color="#666" />
                            </View>
                        )}
                    </View>
                    <Text className="text-2xl font-bold text-text-main-light dark:text-white">{therapist.full_name}</Text>
                    <Text className="text-text-sub-light dark:text-gray-400">{therapist.email}</Text>
                    <View className="mt-2 bg-yellow-100 px-3 py-1 rounded-full">
                        <Text className="text-yellow-800 text-xs font-bold uppercase">{therapist.approval_status}</Text>
                    </View>
                </View>

                <View className="bg-white dark:bg-gray-800 rounded-xl p-4 mb-4">
                    <Text className="text-lg font-bold mb-2 text-text-main-light dark:text-white">Professional Info</Text>
                    <Field label="Specialization" value={therapist.specialization} />
                    <Field label="Experience" value={therapist.years_of_experience ? `${therapist.years_of_experience} years` : 'N/A'} />
                    <Field label="Bio" value={therapist.bio} />
                    <Field label="Detailed Bio" value={therapist.therapist_bio_extended} />
                </View>

                {therapist.certifications && therapist.certifications.length > 0 && (
                    <View className="bg-white dark:bg-gray-800 rounded-xl p-4 mb-4">
                        <Text className="text-lg font-bold mb-2 text-text-main-light dark:text-white">Certifications</Text>
                        {therapist.certifications.map((cert: string, index: number) => (
                            <Text key={index} className="text-text-sub-light dark:text-gray-400 mb-1">• {cert}</Text>
                        ))}
                    </View>
                )}
            </ScrollView>

            <View className="p-4 bg-white dark:bg-gray-800 border-t border-gray-100 dark:border-gray-700 flex-row gap-4 safe-mb">
                <TouchableOpacity
                    onPress={handleReject}
                    disabled={actionLoading}
                    className="flex-1 bg-red-50 dark:bg-red-900/20 py-3 rounded-xl items-center"
                >
                    <Text className="text-red-600 font-bold">Reject</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    onPress={handleApprove}
                    disabled={actionLoading}
                    className="flex-1 bg-green-600 py-3 rounded-xl items-center"
                >
                    <Text className="text-white font-bold">Approve</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
};

const Field = ({ label, value }: { label: string, value: string | null }) => (
    <View className="mb-3">
        <Text className="text-xs text-gray-500 uppercase font-bold mb-1">{label}</Text>
        <Text className="text-text-main-light dark:text-gray-300">{value || 'Not provided'}</Text>
    </View>
);
