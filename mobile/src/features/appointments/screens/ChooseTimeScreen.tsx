import React, { useState, useEffect } from 'react';
import { View, Text, SafeAreaView, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';
import { format } from 'date-fns';
import { MotiView } from 'moti';

import { RootStackParamList, RootNavigationProp } from '../../../navigation/types';
import { useBookingFlow } from '../hooks/useBookingFlow';
import { TimeSlot } from '../utils/timeSlots';
import { useColorScheme } from '../../../hooks/useColorScheme';

type ChooseTimeRouteProp = RouteProp<RootStackParamList, 'ChooseTime'>;

export default function ChooseTimeScreen() {
    const navigation = useNavigation<RootNavigationProp>();
    const route = useRoute<ChooseTimeRouteProp>();
    const { therapistId, therapistName, therapistAvatar, selectedDate, selectedTime, selectedTimeEnd } = route.params;
    const { isDark } = useColorScheme();

    // Initialize with pre-selected time if passed
    const [selectedTimeSlot, setSelectedTimeSlot] = useState<TimeSlot | null>(
        selectedTime && selectedTimeEnd ? { time: selectedTime, endTime: selectedTimeEnd, available: true } : null
    );
    const [timeOfDay, setTimeOfDay] = useState<'morning' | 'afternoon' | 'evening'>('morning');
    const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);

    const { loading, getAvailableTimeSlots } = useBookingFlow();

    useEffect(() => {
        loadSlots();
    }, [selectedDate, timeOfDay]);

    const loadSlots = async () => {
        const slots = await getAvailableTimeSlots(therapistId, selectedDate, timeOfDay);
        setAvailableSlots(slots);
        if (selectedTimeSlot && !slots.some(s => s.time === selectedTimeSlot.time)) {
            setSelectedTimeSlot(null);
        }
    };

    const handleNext = () => {
        if (selectedTimeSlot && availableSlots.some(slot => slot.time === selectedTimeSlot.time)) {
            navigation.navigate('ConfirmAppointment', {
                therapistId,
                therapistName,
                therapistAvatar,
                selectedDate,
                selectedTime: selectedTimeSlot.time,
                selectedTimeEnd: selectedTimeSlot.endTime
            });
        }
    };

    const formattedDate = selectedDate && !isNaN(new Date(selectedDate).getTime())
        ? format(new Date(selectedDate), 'EEE, MMM d')
        : 'Invalid Date';

    return (
        <SafeAreaView className="flex-1 bg-background-light dark:bg-background-dark">
            {/* Top App Bar */}
            <View className="flex-row items-center justify-between px-4 py-4 border-b border-gray-100 dark:border-gray-800 bg-background-light/95 dark:bg-background-dark/95 backdrop-blur-md sticky top-0 z-20">
                <TouchableOpacity
                    onPress={() => navigation.goBack()}
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full active:bg-gray-100 dark:active:bg-gray-800 transition-colors"
                >
                    <MaterialIcons name="arrow-back" size={24} color={isDark ? "#f0f4f5" : "#0e181b"} />
                </TouchableOpacity>
                <Text className="flex-1 text-center pr-10 text-lg font-bold leading-tight tracking-tight text-text-main-light dark:text-text-main-dark">
                    {formattedDate}
                </Text>
            </View>

            <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
                {/* Progress Indicator */}
                <View className="flex flex-col items-center justify-center pt-6 pb-2 px-4">
                    <Text className="text-xs font-semibold text-primary tracking-wider uppercase mb-2">Step 2 of 3</Text>
                    <View className="flex-row items-center gap-2">
                        <View className="h-2 w-2 rounded-full bg-primary/30" />
                        <View className="h-2 w-8 rounded-full bg-primary" />
                        <View className="h-2 w-2 rounded-full bg-gray-200 dark:bg-gray-700" />
                    </View>
                </View>

                {/* Headline & Context */}
                <View className="px-6 pt-6 pb-4">
                    <Text className="text-3xl font-bold leading-tight text-text-main-light dark:text-text-main-dark mb-2">
                        When works best for you?
                    </Text>
                    <Text className="text-base font-medium text-text-sub-light dark:text-text-sub-dark">
                        Select a time for your therapisting session.
                    </Text>
                </View>

                {/* Time of Day Filter (Segmented Control) */}
                <View className="px-6 py-2">
                    <View className="flex-row p-1 bg-gray-100 dark:bg-surface-dark rounded-full">
                        {['morning', 'afternoon', 'evening'].map((period) => {
                            const isActive = timeOfDay === period;
                            return (
                                <TouchableOpacity
                                    key={period}
                                    onPress={() => setTimeOfDay(period as any)}
                                    className="flex-1"
                                    activeOpacity={0.8}
                                >
                                    <View className={`py-2.5 px-4 items-center justify-center rounded-full transition-all ${isActive
                                        ? 'bg-white dark:bg-gray-700 shadow-sm'
                                        : 'bg-transparent'
                                        }`}>
                                        <Text className={`text-sm font-semibold capitalize ${isActive
                                            ? 'text-primary'
                                            : 'text-text-sub-light dark:text-text-sub-dark'
                                            }`}>
                                            {period}
                                        </Text>
                                    </View>
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                </View>

                {/* Time Slots Grid */}
                <View className="flex-1 px-6 py-6">
                    <Text className="text-sm font-semibold text-text-sub-light dark:text-text-sub-dark mb-4 pl-1">
                        Available slots (EST)
                    </Text>

                    {loading ? (
                        <View className="py-20 items-center justify-center">
                            <ActivityIndicator color="#30bae8" size="large" />
                        </View>
                    ) : (
                        <View className="flex-row flex-wrap -mx-1.5">
                            {availableSlots.length === 0 ? (
                                <Text className="w-full text-center text-text-sub-light dark:text-text-sub-dark py-10 font-medium">
                                    No slots available for this time of day.
                                </Text>
                            ) : (
                                availableSlots.map((slot, index) => {
                                    const isSelected = selectedTimeSlot?.time === slot.time;
                                    return (
                                        <View key={index} className="w-1/2 px-1.5 mb-3">
                                            <TouchableOpacity
                                                onPress={() => setSelectedTimeSlot(slot)}
                                                disabled={!slot.available}
                                                activeOpacity={0.7}
                                                className={`group relative flex rounded-xl border p-4 shadow-sm transition-all ${isSelected
                                                    ? 'bg-primary border-primary shadow-lg shadow-primary/30'
                                                    : 'bg-surface-light dark:bg-surface-dark border-gray-200 dark:border-gray-700'
                                                    }`}
                                            >
                                                <View className="w-full items-center justify-center gap-1">
                                                    <Text className={`text-lg font-bold ${isSelected
                                                        ? 'text-white'
                                                        : 'text-text-main-light dark:text-text-main-dark'
                                                        }`}>
                                                        {slot.time}
                                                    </Text>
                                                    <Text className={`text-xs font-medium ${isSelected
                                                        ? 'text-white/90'
                                                        : 'text-text-sub-light dark:text-text-sub-dark'
                                                        }`}>
                                                        45 mins
                                                    </Text>
                                                </View>
                                                {isSelected && (
                                                    <View className="absolute top-3 right-3">
                                                        <MaterialIcons name="check-circle" size={18} color="white" />
                                                    </View>
                                                )}
                                            </TouchableOpacity>
                                        </View>
                                    );
                                })
                            )}
                        </View>
                    )}

                    {/* Info Banner */}
                    <View className="mt-8 flex-row items-center justify-center gap-2 rounded-xl bg-blue-50 dark:bg-blue-900/20 p-4 border border-blue-100 dark:border-blue-900/30">
                        <MaterialIcons name="info" size={20} color="#30bae8" />
                        <Text className="text-sm text-text-sub-light dark:text-text-sub-dark leading-tight flex-shrink">
                            Need a different day? <Text className="font-bold text-primary underline decoration-primary/30">View Calendar</Text>
                        </Text>
                    </View>
                </View>
            </ScrollView>

            {/* Sticky Footer */}
            <View className="absolute bottom-0 w-full px-4 py-4 pb-8 bg-surface-light dark:bg-surface-dark border-t border-gray-100 dark:border-gray-800 flex-row items-center gap-4">
                <TouchableOpacity
                    onPress={() => navigation.goBack()}
                    className="flex-1 rounded-full border border-gray-200 dark:border-gray-700 bg-transparent py-3.5 px-6 items-center justify-center active:bg-gray-50 dark:active:bg-gray-800"
                >
                    <Text className="text-base font-bold text-text-main-light dark:text-text-main-dark">
                        Back
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    onPress={handleNext}
                    disabled={!selectedTimeSlot}
                    className={`flex-[2] rounded-full py-3.5 px-6 flex-row items-center justify-center gap-2 shadow-lg shadow-primary/30 ${selectedTimeSlot ? 'bg-primary' : 'bg-gray-300 dark:bg-gray-700'
                        }`}
                >
                    <Text className="text-base font-bold text-white">
                        Next Step
                    </Text>
                    <MaterialIcons name="arrow-forward" size={18} color="white" />
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}
