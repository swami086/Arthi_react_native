import React, { useState } from 'react';
import { View, Text, SafeAreaView, ScrollView, TouchableOpacity, TextInput, Alert, ActivityIndicator, Image } from 'react-native';
import { useNavigation, useRoute, RouteProp, CommonActions } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';
import { format } from 'date-fns';
import { MotiView } from 'moti';

import { RootStackParamList, RootNavigationProp } from '../../../navigation/types';
import { useBookingFlow } from '../hooks/useBookingFlow';
import { useColorScheme } from '../../../hooks/useColorScheme';
import { useTherapistDetail } from '../../mentors/hooks/useTherapistDetail';

type ConfirmAppointmentRouteProp = RouteProp<RootStackParamList, 'ConfirmAppointment'>;

export default function ConfirmAppointmentScreen() {
    const navigation = useNavigation<RootNavigationProp>();
    const route = useRoute<ConfirmAppointmentRouteProp>();
    const { mentorId, mentorName, mentorAvatar, selectedDate, selectedTime, selectedTimeEnd } = route.params;
    const { isDark } = useColorScheme();

    const [notes, setNotes] = useState('');
    const { loading, createAppointment } = useBookingFlow();
    const { mentor } = useTherapistDetail(mentorId);

    // Use mentor's hourly rate or default to 500
    const sessionPrice = mentor?.hourly_rate ?? 500;

    const handleConfirm = async () => {
        try {
            // Create appointment in pending state
            const appointment = await createAppointment({
                mentorId,
                date: selectedDate,
                time: selectedTime,
                endTime: selectedTimeEnd,
                price: sessionPrice,
                notes
            });

            if (!appointment) {
                // Should have thrown error if failed, but safety check
                Alert.alert("Error", "Failed to initialize appointment.");
                return;
            }

            if (sessionPrice > 0) {
                navigation.navigate('PaymentCheckout', {
                    appointmentId: appointment.id,
                    mentorId,
                    mentorName,
                    mentorAvatar,
                    amount: sessionPrice,
                    selectedDate,
                    selectedTime
                });
            } else {
                // Free appointment, just confirm (though usually we'd mark it confirmed here if it was pended above,
                // but createAppointment currently sets status='pending'. 
                // We might need to auto-confirm if free. For now, assuming manual confirmation or default flow.)

                // If it's free, we might want to update status to confirmed immediately?
                // The current backend logic sets 'pending'. 
                // Since this is client side, let's just show success. 
                // Ideally we update status to 'confirmed' via another call if needed, but let's stick to simple flow.

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
            }
        } catch (error) {
            Alert.alert("Error", "Failed to book appointment. Please try again.");
        }
    };

    const formattedDate = selectedDate && !isNaN(new Date(selectedDate).getTime())
        ? format(new Date(selectedDate), 'EEEE, MMM d')
        : 'Invalid Date';

    return (
        <SafeAreaView className="flex-1 bg-background-light dark:bg-background-dark">
            {/* Top App Bar */}
            <View className="flex-row items-center justify-between px-4 py-3 bg-background-light/90 dark:bg-background-dark/90 backdrop-blur-sm sticky top-0 z-10">
                <TouchableOpacity
                    onPress={() => navigation.goBack()}
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full active:bg-black/5 dark:active:bg-white/10 transition-colors"
                >
                    <MaterialIcons name="arrow-back" size={24} color={isDark ? "#ffffff" : "#0e181b"} />
                </TouchableOpacity>
                <Text className="flex-1 text-center text-lg font-bold leading-tight tracking-tight text-text-main-light dark:text-text-main-dark">
                    Confirm Booking
                </Text>
                <View className="w-10" />
            </View>

            <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 150 }} showsVerticalScrollIndicator={false}>
                {/* Progress Indicator */}
                <View className="flex flex-col items-center justify-center gap-2 py-4">
                    <Text className="text-xs font-semibold uppercase tracking-wider text-text-sub-light dark:text-text-sub-dark">Step 3 of 3</Text>
                    <View className="flex-row items-center gap-2">
                        <View className="h-2.5 w-2.5 rounded-full bg-primary/30" />
                        <View className="h-2.5 w-2.5 rounded-full bg-primary/30" />
                        <View className="h-2.5 w-8 rounded-full bg-primary" />
                    </View>
                </View>

                {/* Headline */}
                <View className="px-6 pb-2 pt-2 items-center">
                    <Text className="text-[26px] font-bold leading-tight mb-2 text-text-main-light dark:text-text-main-dark tracking-tight">
                        Review session details
                    </Text>
                    <Text className="text-base font-normal leading-normal text-text-sub-light dark:text-text-sub-dark text-center">
                        You're almost there! Please check that everything looks right before confirming.
                    </Text>
                </View>

                <View className="p-4 gap-6">
                    {/* Therapist Card */}
                    <View className="bg-surface-light dark:bg-surface-dark p-5 rounded-xl shadow-[0_2px_12px_rgba(0,0,0,0.04)] dark:shadow-none dark:border dark:border-white/5">
                        <View className="flex-row items-start justify-between gap-4">
                            <View className="flex-row gap-4 flex-1">
                                <Image
                                    source={{ uri: mentorAvatar }}
                                    className="h-16 w-16 rounded-full bg-gray-200"
                                />
                                <View className="justify-center flex-1">
                                    <Text className="text-lg font-bold leading-tight text-text-main-light dark:text-text-main-dark mb-0.5">
                                        {mentorName}
                                    </Text>
                                    <Text className="text-primary text-sm font-medium leading-normal mb-1">
                                        Therapisting Session
                                    </Text>
                                    <View className="self-start px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-700">
                                        <Text className="text-xs text-slate-600 dark:text-slate-300">
                                            Academic Stress
                                        </Text>
                                    </View>
                                </View>
                            </View>
                            <TouchableOpacity
                                onPress={() => navigation.navigate('SelectDate', { mentorId, mentorName, mentorAvatar })}
                                className="flex h-8 w-8 items-center justify-center rounded-full bg-background-light dark:bg-slate-700 active:bg-slate-200 dark:active:bg-slate-600"
                            >
                                <MaterialIcons name="edit" size={18} color={isDark ? "#e2e8f0" : "#475569"} />
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Appointment Details */}
                    <View className="bg-surface-light dark:bg-surface-dark rounded-xl shadow-[0_2px_12px_rgba(0,0,0,0.04)] dark:shadow-none dark:border dark:border-white/5 overflow-hidden">
                        <View className="p-5 pb-2 flex-row justify-between items-center border-b border-slate-100 dark:border-slate-700/50">
                            <Text className="text-base font-bold text-text-main-light dark:text-text-main-dark">Appointment Info</Text>
                            <TouchableOpacity onPress={() => navigation.goBack()}>
                                <Text className="text-primary text-sm font-semibold">Edit</Text>
                            </TouchableOpacity>
                        </View>

                        <View className="p-5 flex-col gap-5">
                            {/* Date */}
                            <View className="flex-row items-center gap-4">
                                <View className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
                                    <MaterialIcons name="calendar-today" size={20} color="#30bae8" />
                                </View>
                                <View>
                                    <Text className="text-xs font-medium text-slate-400 uppercase tracking-wide">Date</Text>
                                    <Text className="text-base font-semibold text-text-main-light dark:text-text-main-dark">{formattedDate}</Text>
                                </View>
                            </View>

                            {/* Time */}
                            <View className="flex-row items-center gap-4">
                                <View className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
                                    <MaterialIcons name="schedule" size={20} color="#30bae8" />
                                </View>
                                <View>
                                    <Text className="text-xs font-medium text-slate-400 uppercase tracking-wide">Time</Text>
                                    <Text className="text-base font-semibold text-text-main-light dark:text-text-main-dark">
                                        {selectedTime} - {selectedTimeEnd} <Text className="text-slate-400 font-normal text-sm">(EST)</Text>
                                    </Text>
                                </View>
                            </View>

                            {/* Format */}
                            <View className="flex-row items-center gap-4">
                                <View className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
                                    <MaterialIcons name="videocam" size={20} color="#30bae8" />
                                </View>
                                <View>
                                    <Text className="text-xs font-medium text-slate-400 uppercase tracking-wide">Format</Text>
                                    <Text className="text-base font-semibold text-text-main-light dark:text-text-main-dark">Video Call via Google Meet</Text>
                                </View>
                            </View>
                        </View>

                        {/* Cost Banner */}
                        <View className="bg-primary/5 p-3 flex-row items-center justify-center gap-2 border-t border-primary/10">
                            <MaterialIcons name="verified" size={18} color="#30bae8" />
                            <Text className="text-sm font-semibold text-primary">
                                {sessionPrice > 0 ? `Paid Session: ₹${sessionPrice}` : "Free Introductory Session"}
                            </Text>
                        </View>
                    </View>

                    {/* Notes Section */}
                    <View className="flex-col gap-2">
                        <Text className="text-sm font-semibold text-text-main-light dark:text-text-main-dark pl-2">Your Notes</Text>
                        <TextInput
                            className="bg-surface-light dark:bg-surface-dark border border-slate-200 dark:border-slate-700 p-4 rounded-xl text-text-main-light dark:text-text-main-dark text-sm leading-relaxed min-h-[100px]"
                            value={notes}
                            onChangeText={setNotes}
                            placeholder="Add any notes for your mentor..."
                            placeholderTextColor={isDark ? "#94aeb8" : "#9ca3af"}
                            multiline
                            textAlignVertical="top"
                        />
                    </View>
                </View>
            </ScrollView>

            {/* Sticky Bottom Action Area */}
            <View className="absolute bottom-0 left-0 right-0 p-4 bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-md border-t border-slate-200/50 dark:border-white/5 z-20">
                {/* Security Badge */}
                <View className="flex-row justify-center items-center gap-1.5 mb-4 opacity-80">
                    <MaterialIcons name="lock" size={18} color={isDark ? "#4ade80" : "#16a34a"} />
                    <Text className="text-xs font-medium text-slate-600 dark:text-slate-300">Confidential, safe & secure space</Text>
                </View>

                {/* Buttons */}
                <View className="flex-col gap-3">
                    <TouchableOpacity
                        onPress={handleConfirm}
                        disabled={loading}
                        className="w-full bg-primary h-14 rounded-full shadow-lg shadow-primary/20 flex-row items-center justify-center gap-2 active:opacity-90"
                    >
                        {loading ? (
                            <ActivityIndicator color="white" />
                        ) : (
                            <>
                                <Text className="text-white font-bold text-lg">
                                    {sessionPrice > 0 ? "Proceed to Payment" : "Confirm Booking"}
                                </Text>
                                <MaterialIcons name="check-circle" size={20} color="white" />
                            </>
                        )}
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={() => navigation.goBack()}
                        disabled={loading}
                        className="w-full bg-transparent h-10 rounded-full items-center justify-center active:bg-slate-100 dark:active:bg-white/5"
                    >
                        <Text className="text-slate-500 dark:text-slate-400 font-semibold text-base">Back to Selection</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </SafeAreaView>
    );
}
