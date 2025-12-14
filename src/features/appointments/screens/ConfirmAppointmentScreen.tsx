import React, { useState } from 'react';
import { View, Text, SafeAreaView, ScrollView, TouchableOpacity, TextInput, Alert, ActivityIndicator } from 'react-native';
import { useNavigation, useRoute, RouteProp, CommonActions } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { format } from 'date-fns';

import { RootStackParamList, RootNavigationProp } from '../../../navigation/types';
import { ProgressIndicator } from '../components/ProgressIndicator';
import { AppointmentSummaryCard } from '../components/AppointmentSummaryCard';
import { AppointmentDetailsCard } from '../components/AppointmentDetailsCard';
import { useBookingFlow } from '../hooks/useBookingFlow';

type ConfirmAppointmentRouteProp = RouteProp<RootStackParamList, 'ConfirmAppointment'>;

export default function ConfirmAppointmentScreen() {
    const navigation = useNavigation<RootNavigationProp>();
    const route = useRoute<ConfirmAppointmentRouteProp>();
    const { mentorId, mentorName, mentorAvatar, selectedDate, selectedTime, selectedTimeEnd } = route.params;

    const [notes, setNotes] = useState('');
    const { loading, createAppointment } = useBookingFlow();

    const handleConfirm = async () => {
        try {
            await createAppointment({
                mentorId,
                date: selectedDate,
                time: selectedTime,
                endTime: selectedTimeEnd,
                notes
            });

            Alert.alert(
                "Appointment Confirmed",
                "Your session has been successfully booked.",
                [
                    {
                        text: "Done",
                        onPress: () => {
                            navigation.dispatch(
                                CommonActions.reset({
                                    index: 0,
                                    routes: [
                                        { name: 'Main', params: { screen: 'Appointments' } },
                                    ],
                                })
                            );
                        }
                    }
                ]
            );
        } catch (error) {
            Alert.alert("Error", "Failed to book appointment. Please try again.");
        }
    };

    const formattedDate = format(new Date(selectedDate), 'MMMM d, yyyy');

    return (
        <SafeAreaView className="flex-1 bg-gray-50 dark:bg-gray-900">
            <View className="flex-row items-center p-4">
                <TouchableOpacity onPress={() => navigation.goBack()} className="mr-4">
                    <MaterialCommunityIcons name="arrow-left" size={24} className="text-gray-900 dark:text-white" color="#30bae8" />
                </TouchableOpacity>
                <Text className="text-xl font-bold text-gray-900 dark:text-white">Confirm Booking</Text>
            </View>

            <ScrollView className="flex-1 px-4">
                <ProgressIndicator currentStep={3} />

                <Text className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Review session details</Text>
                <Text className="text-gray-500 dark:text-gray-400 mb-6">You're almost there! Please check that everything looks right before confirming.</Text>

                <AppointmentSummaryCard
                    mentorName={mentorName}
                    mentorAvatar={mentorAvatar}
                    mentorExpertise="Mentoring Session"
                    onEdit={() => navigation.navigate('SelectDate', { mentorId, mentorName, mentorAvatar })}
                />

                <AppointmentDetailsCard
                    date={formattedDate}
                    time={selectedTime}
                    duration="45 minutes"
                    format="Video Call"
                />

                <View className="bg-green-50 dark:bg-green-900/20 p-4 rounded-xl flex-row items-center mb-6 border border-green-100 dark:border-green-800">
                    <MaterialCommunityIcons name="check-decagram" size={24} color="#10B981" className="mr-3" />
                    <View>
                        <Text className="font-bold text-green-800 dark:text-green-300">Free Introductory Session</Text>
                        <Text className="text-green-600 dark:text-green-400 text-xs">First session is on us!</Text>
                    </View>
                </View>

                <Text className="font-bold text-gray-900 dark:text-white mb-2">Add a note (optional)</Text>
                <TextInput
                    className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4 min-h-[100px] mb-8 text-gray-900 dark:text-white"
                    placeholder="Share any specific topics you'd like to discuss..."
                    placeholderTextColor="#9CA3AF"
                    multiline
                    textAlignVertical="top"
                    value={notes}
                    onChangeText={setNotes}
                />
            </ScrollView>

            <View className="p-4 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
                <View className="flex-row items-center justify-center mb-4">
                    <MaterialCommunityIcons name="lock" size={16} color="#9CA3AF" />
                    <Text className="text-gray-400 text-xs ml-1">Confidential, safe & secure space</Text>
                </View>

                <TouchableOpacity
                    onPress={handleConfirm}
                    disabled={loading}
                    className="bg-primary p-4 rounded-xl flex-row items-center justify-center mb-3"
                >
                    {loading ? (
                        <ActivityIndicator color="white" />
                    ) : (
                        <>
                            <Text className="text-white font-bold text-lg mr-2">Confirm Booking</Text>
                            <MaterialCommunityIcons name="check" size={20} color="white" />
                        </>
                    )}
                </TouchableOpacity>

                <TouchableOpacity
                    onPress={() => navigation.goBack()}
                    disabled={loading}
                    className="p-2 items-center"
                >
                    <Text className="text-gray-500 font-medium">Back to Selection</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}
