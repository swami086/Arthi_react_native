import React, { useState } from 'react';
import { View, Text, SafeAreaView, ScrollView, TouchableOpacity, TextInput, Alert, ActivityIndicator } from 'react-native';
import { useNavigation, useRoute, RouteProp, CommonActions } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { format } from 'date-fns';
import { MotiView } from 'moti';

import { RootStackParamList, RootNavigationProp } from '../../../navigation/types';
import { ProgressIndicator } from '../components/ProgressIndicator';
import { AppointmentSummaryCard } from '../components/AppointmentSummaryCard';
import { AppointmentDetailsCard } from '../components/AppointmentDetailsCard';
import { useBookingFlow } from '../hooks/useBookingFlow';
import { Button } from '../../../components/Button';
import { Input } from '../../../components/Input';
import { useColorScheme } from '../../../hooks/useColorScheme';

type ConfirmAppointmentRouteProp = RouteProp<RootStackParamList, 'ConfirmAppointment'>;

export default function ConfirmAppointmentScreen() {
    const navigation = useNavigation<RootNavigationProp>();
    const route = useRoute<ConfirmAppointmentRouteProp>();
    const { mentorId, mentorName, mentorAvatar, selectedDate, selectedTime, selectedTimeEnd } = route.params;
    const { isDark } = useColorScheme();

    const [notes, setNotes] = useState('');
    const { loading, createAppointment } = useBookingFlow();

    // Mock price for demonstration - in real app, fetch from mentor profile
    const sessionPrice = 0; // Set to 500 for paid testing, 0 for free

    const handleConfirm = async () => {
        try {
            // In a real implementation, we would create the appointment first and get the ID
            // Here we simulate the process

            if (sessionPrice > 0) {
                // Mock appointment ID
                const mockAppointmentId = 'temp-id-' + Date.now();

                navigation.navigate('PaymentCheckout', {
                    appointmentId: mockAppointmentId,
                    mentorId,
                    mentorName,
                    mentorAvatar,
                    amount: sessionPrice,
                    selectedDate,
                    selectedTime
                });
            } else {
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
            }
        } catch (error) {
            Alert.alert("Error", "Failed to book appointment. Please try again.");
        }
    };

    const formattedDate = format(new Date(selectedDate), 'MMMM d, yyyy');

    return (
        <SafeAreaView className="flex-1 bg-background-light dark:bg-background-dark">
            <View className="flex-row items-center justify-between p-4 px-6">
                <TouchableOpacity onPress={() => navigation.goBack()} className="p-2 -ml-2 rounded-full active:bg-gray-100 dark:active:bg-gray-800">
                    <MaterialCommunityIcons name="arrow-left" size={24} color={isDark ? "#fff" : "#0e181b"} />
                </TouchableOpacity>
                <Text className="text-lg font-bold text-text-main-light dark:text-text-main-dark">Confirm Booking</Text>
                <View className="w-10" />
            </View>

            <ScrollView className="flex-1 px-6 pt-2" showsVerticalScrollIndicator={false}>
                {/* Add progress indicator with "Step 3 of 3" label */}
                <ProgressIndicator currentStep={3} />

                <MotiView
                    from={{ opacity: 0, translateY: 10 }}
                    animate={{ opacity: 1, translateY: 0 }}
                    transition={{ type: 'timing', duration: 400 }}
                >
                    {/* Enhance headline */}
                    <Text className="text-3xl font-bold text-text-main-light dark:text-text-main-dark mb-2 leading-tight tracking-tight">
                        Review Details
                    </Text>
                    <Text className="text-text-sub-light dark:text-text-sub-dark mb-6 text-base font-medium">
                        You're almost there! Check everything before confirming.
                    </Text>
                </MotiView>

                <MotiView
                    from={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ type: 'timing', duration: 400, delay: 100 }}
                >
                    {/* Redesign mentor card with edit button is inside the component */}
                    <AppointmentSummaryCard
                        mentorName={mentorName}
                        mentorAvatar={mentorAvatar}
                        mentorExpertise="Mentoring Session"
                        onEdit={() => navigation.navigate('SelectDate', { mentorId, mentorName, mentorAvatar })}
                    />
                </MotiView>

                <MotiView
                    from={{ opacity: 0, translateY: 20 }}
                    animate={{ opacity: 1, translateY: 0 }}
                    transition={{ type: 'timing', duration: 400, delay: 200 }}
                >
                    <AppointmentDetailsCard
                        date={formattedDate}
                        time={selectedTime}
                        duration="45 minutes"
                        format="Video Call"
                        onEdit={() => navigation.navigate('SelectDate', { mentorId, mentorName, mentorAvatar })}
                    />

                    {/* Cost banner */}
                    <View className="bg-primary p-4 rounded-2xl flex-row items-center justify-between mb-6 shadow-lg shadow-primary/20">
                        <View className="flex-row items-center">
                            <View className="bg-white/20 p-2 rounded-full mr-3">
                                <MaterialCommunityIcons name="tag-outline" size={20} color="white" />
                            </View>
                            <View>
                                {sessionPrice > 0 ? (
                                    <>
                                        <Text className="font-bold text-white text-base">Paid Session</Text>
                                        <Text className="text-white/80 text-xs font-medium">Standard consultation fee</Text>
                                    </>
                                ) : (
                                    <>
                                        <Text className="font-bold text-white text-base">Free Introductory Session</Text>
                                        <Text className="text-white/80 text-xs font-medium">First session is on us!</Text>
                                    </>
                                )}
                            </View>
                        </View>
                        <Text className="text-white font-bold text-lg">
                            {sessionPrice > 0 ? `₹${sessionPrice}` : 'Free'}
                        </Text>
                    </View>
                </MotiView>

                <MotiView
                    from={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ type: 'timing', duration: 400, delay: 300 }}
                >
                    <Text className="font-bold text-text-main-light dark:text-text-main-dark mb-3 ml-1">Add a note (optional)</Text>
                    <TextInput
                        className="bg-white dark:bg-surface-dark border border-gray-200 dark:border-gray-700 rounded-2xl p-4 min-h-[120px] mb-8 text-text-main-light dark:text-text-main-dark font-sans text-base leading-relaxed"
                        placeholder="Share any specific topics you'd like to discuss..."
                        placeholderTextColor={isDark ? "#94aeb8" : "#9ca3af"}
                        multiline
                        textAlignVertical="top"
                        value={notes}
                        onChangeText={setNotes}
                    />
                </MotiView>
            </ScrollView>

            <View className="p-6 pt-4 bg-background-light dark:bg-background-dark border-t border-gray-200/50 dark:border-gray-700/50">
                {/* Add security badge above action buttons */}
                <View className="flex-row items-center justify-center mb-6 bg-green-50 dark:bg-green-900/20 py-2 px-4 rounded-full self-center">
                    <MaterialCommunityIcons name="shield-check" size={16} color="#10B981" />
                    <Text className="text-green-700 dark:text-green-400 text-xs font-bold ml-2 uppercase tracking-wide">Secure Booking</Text>
                </View>

                <Button
                    title={sessionPrice > 0 ? "Proceed to Pay" : "Confirm Booking"}
                    onPress={handleConfirm}
                    loading={loading}
                    variant="primary"
                    icon={sessionPrice > 0 ? "credit-card" : "check"}
                    iconPosition="right"
                    className="w-full mb-3 shadow-lg shadow-primary/30"
                />

                <Button
                    title="Back to Selection"
                    onPress={() => navigation.goBack()}
                    disabled={loading}
                    variant="ghost"
                    className="w-full"
                />
            </View>
        </SafeAreaView>
    );
}
