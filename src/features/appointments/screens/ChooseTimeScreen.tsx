import React, { useState, useEffect } from 'react';
import { View, Text, SafeAreaView, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { format } from 'date-fns';
import { MotiView } from 'moti';

import { RootStackParamList, RootNavigationProp } from '../../../navigation/types';
import { ProgressIndicator } from '../components/ProgressIndicator';
import { TimeSlotButton } from '../components/TimeSlotButton';
import { useBookingFlow } from '../hooks/useBookingFlow';
import { TimeSlot } from '../utils/timeSlots';

type ChooseTimeRouteProp = RouteProp<RootStackParamList, 'ChooseTime'>;

export default function ChooseTimeScreen() {
    const navigation = useNavigation<RootNavigationProp>();
    const route = useRoute<ChooseTimeRouteProp>();
    const { mentorId, mentorName, mentorAvatar, selectedDate, selectedTime, selectedTimeEnd } = route.params;

    // Initialize with pre-selected time if passed
    const [selectedTimeSlot, setSelectedTimeSlot] = useState<TimeSlot | null>(
        selectedTime && selectedTimeEnd ? { time: selectedTime, endTime: selectedTimeEnd, available: true } : null
    );
    const [timeOfDay, setTimeOfDay] = useState<'morning' | 'afternoon' | 'evening'>('morning');
    const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);

    const { loading, getAvailableTimeSlots } = useBookingFlow();

    useEffect(() => {
        loadSlots();
        // Only reset if we don't have a pre-selection or if the date changes
        // But since date is fixed for this screen instance usually, we focus on timeOfDay changes.
        // If we switch to 'Morning' and we had 'Evening' slot selected, we might want to keep it or clear.
        // For now, let's keep it simple: don't auto-clear on filter change to avoid annoyance, 
        // or clear if it's not in the new list?
        // Let's NOT clear it automatically.
    }, [selectedDate, timeOfDay]);

    const loadSlots = async () => {
        const slots = await getAvailableTimeSlots(mentorId, selectedDate, timeOfDay);
        setAvailableSlots(slots);
    };

    const handleNext = () => {
        if (selectedTimeSlot) {
            navigation.navigate('ConfirmAppointment', {
                mentorId,
                mentorName,
                mentorAvatar,
                selectedDate,
                selectedTime: selectedTimeSlot.time,
                selectedTimeEnd: selectedTimeSlot.endTime
            });
        }
    };

    const formattedDate = format(new Date(selectedDate), 'EEE, MMM d');

    return (
        <SafeAreaView className="flex-1 bg-gray-50 dark:bg-gray-900">
            <View className="flex-row items-center p-4">
                <TouchableOpacity onPress={() => navigation.goBack()} className="mr-4">
                    <MaterialCommunityIcons name="arrow-left" size={24} className="text-gray-900 dark:text-white" color="#30bae8" />
                </TouchableOpacity>
                <Text className="text-xl font-bold text-gray-900 dark:text-white">{formattedDate}</Text>
            </View>

            <ScrollView className="flex-1 px-4">
                <ProgressIndicator currentStep={2} />

                <MotiView
                    from={{ opacity: 0, translateY: 10 }}
                    animate={{ opacity: 1, translateY: 0 }}
                    transition={{ type: 'timing', duration: 400 }}
                >
                    <Text className="text-2xl font-bold text-gray-900 dark:text-white mb-2">When works best for you?</Text>
                    <Text className="text-gray-500 dark:text-gray-400 mb-6">Select a time for your mentoring session.</Text>
                </MotiView>

                {/* Filter */}
                <MotiView
                    from={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ type: 'timing', duration: 400, delay: 100 }}
                >
                    <View className="flex-row bg-gray-200 dark:bg-gray-800 rounded-full p-1 mb-6">
                        {['morning', 'afternoon', 'evening'].map((period) => (
                            <TouchableOpacity
                                key={period}
                                onPress={() => setTimeOfDay(period as any)}
                                className={`flex-1 py-2 rounded-full items-center ${timeOfDay === period ? 'bg-white dark:bg-gray-700 shadow-sm' : ''
                                    }`}
                            >
                                <Text className={`font-medium capitalize ${timeOfDay === period ? 'text-primary dark:text-white font-bold' : 'text-gray-500 dark:text-gray-400'
                                    }`}>
                                    {period}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </MotiView>

                {loading ? (
                    <ActivityIndicator color="#30bae8" size="large" className="mt-10" />
                ) : (
                    <MotiView
                        from={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ type: 'timing', duration: 400, delay: 200 }}
                    >
                        <View className="flex-row flex-wrap justify-between">
                            {availableSlots.length === 0 ? (
                                <Text className="w-full text-center text-gray-500 py-10">No slots available for this time of day.</Text>
                            ) : (
                                availableSlots.map((slot, index) => (
                                    <View key={index} style={{ width: '48%', marginBottom: 8 }}>
                                        <TimeSlotButton
                                            time={slot.time}
                                            duration="45 mins"
                                            isSelected={selectedTimeSlot?.time === slot.time}
                                            onPress={() => setSelectedTimeSlot(slot)}
                                            disabled={!slot.available}
                                        />
                                    </View>
                                ))
                            )}
                        </View>
                    </MotiView>
                )}

                <Text className="text-gray-400 text-xs text-center mt-4 mb-2">Times shown in your local timezone</Text>

                {/* Info Banner */}
                <View className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl flex-row items-center justify-between mb-8 mt-4 border border-blue-100 dark:border-blue-800">
                    <Text className="text-blue-800 dark:text-blue-300 font-medium">Need a different day?</Text>
                    <TouchableOpacity onPress={() => navigation.goBack()}>
                        <Text className="text-primary font-bold" style={{ color: '#30bae8' }}>View Calendar</Text>
                    </TouchableOpacity>
                </View>

            </ScrollView>

            <View className="p-4 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 flex-row space-x-3">
                <TouchableOpacity
                    onPress={() => navigation.goBack()}
                    className="flex-1 py-4 rounded-xl border border-gray-300 dark:border-gray-600 items-center mr-2"
                >
                    <Text className="font-bold text-gray-700 dark:text-gray-300">Back</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    onPress={handleNext}
                    disabled={!selectedTimeSlot}
                    className={`flex-1 py-4 rounded-xl items-center flex-row justify-center ${selectedTimeSlot ? 'bg-primary' : 'bg-gray-300 dark:bg-gray-600'
                        }`}
                >
                    <Text className="text-white font-bold mr-2">Next Step</Text>
                    <MaterialCommunityIcons name="arrow-right" size={20} color="white" />
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}
