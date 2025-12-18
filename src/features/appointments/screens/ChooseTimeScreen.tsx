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
import { useColorScheme } from '../../../hooks/useColorScheme';
import { Button } from '../../../components/Button';

type ChooseTimeRouteProp = RouteProp<RootStackParamList, 'ChooseTime'>;

export default function ChooseTimeScreen() {
    const navigation = useNavigation<RootNavigationProp>();
    const route = useRoute<ChooseTimeRouteProp>();
    const { mentorId, mentorName, mentorAvatar, selectedDate, selectedTime, selectedTimeEnd } = route.params;
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
        const slots = await getAvailableTimeSlots(mentorId, selectedDate, timeOfDay);
        setAvailableSlots(slots);
        if (selectedTimeSlot && !slots.some(s => s.time === selectedTimeSlot.time)) {
            setSelectedTimeSlot(null);
        }
    };

    const handleNext = () => {
        if (selectedTimeSlot && availableSlots.some(slot => slot.time === selectedTimeSlot.time)) {
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
        <SafeAreaView className="flex-1 bg-background-light dark:bg-background-dark">
            {/* Update header with formatted date display */}
            <View className="flex-row items-center justify-between p-4 px-6">
                <TouchableOpacity onPress={() => navigation.goBack()} className="p-2 -ml-2 rounded-full active:bg-gray-100 dark:active:bg-gray-800">
                    <MaterialCommunityIcons name="arrow-left" size={24} color={isDark ? "#fff" : "#0e181b"} />
                </TouchableOpacity>
                <Text className="text-lg font-bold text-text-main-light dark:text-text-main-dark">{formattedDate}</Text>
                <View className="w-10" />
            </View>

            <ScrollView className="flex-1 px-6 pt-2" showsVerticalScrollIndicator={false}>
                {/* Add progress indicator with "Step 2 of 3" label */}
                <ProgressIndicator currentStep={2} />

                <MotiView
                    from={{ opacity: 0, translateY: 10 }}
                    animate={{ opacity: 1, translateY: 0 }}
                    transition={{ type: 'timing', duration: 400 }}
                >
                    {/* Enhance headline: text-3xl font-bold leading-tight */}
                    <Text className="text-3xl font-bold text-text-main-light dark:text-text-main-dark mb-2 leading-tight tracking-tight">
                        Choose Time
                    </Text>
                    <Text className="text-text-sub-light dark:text-text-sub-dark mb-6 text-base font-medium">
                        Select a time for your mentoring session.
                    </Text>
                </MotiView>

                {/* Filter */}
                <MotiView
                    from={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ type: 'timing', duration: 400, delay: 100 }}
                >
                    {/* Redesign time-of-day filter as segmented control */}
                    <View className="flex-row bg-gray-100 dark:bg-surface-dark rounded-full p-1.5 mb-8">
                        {['morning', 'afternoon', 'evening'].map((period) => {
                            const isActive = timeOfDay === period;
                            return (
                                <TouchableOpacity
                                    key={period}
                                    onPress={() => setTimeOfDay(period as any)}
                                    className={`flex-1 py-3 rounded-full items-center ${
                                        isActive ? 'bg-white dark:bg-gray-700 shadow-sm' : ''
                                    }`}
                                >
                                    <Text className={`font-bold text-sm capitalize ${
                                        isActive
                                            ? 'text-primary dark:text-white'
                                            : 'text-text-sub-light dark:text-text-sub-dark'
                                    }`}>
                                        {period}
                                    </Text>
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                </MotiView>

                <View className="flex-row justify-between items-center mb-4">
                    <Text className="text-sm font-bold uppercase tracking-wider text-text-sub-light dark:text-text-sub-dark">
                        Available slots (EST)
                    </Text>
                </View>

                {loading ? (
                    <ActivityIndicator color="#30bae8" size="large" className="mt-10" />
                ) : (
                    <MotiView
                        from={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ type: 'timing', duration: 400, delay: 200 }}
                    >
                        {/* Update time slots grid to 2-column layout */}
                        <View className="flex-row flex-wrap justify-between -mx-2">
                            {availableSlots.length === 0 ? (
                                <Text className="w-full text-center text-text-sub-light dark:text-text-sub-dark py-10 font-medium">
                                    No slots available for this time of day.
                                </Text>
                            ) : (
                                availableSlots.map((slot, index) => (
                                    <View key={index} style={{ width: '50%', paddingHorizontal: 6, marginBottom: 4 }}>
                                        {/* Enhance time slot buttons with new design */}
                                        <TimeSlotButton
                                            time={slot.time}
                                            duration="45 min"
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

                {/* Improve info banner with better styling */}
                <View className="bg-primary/5 dark:bg-primary/10 p-5 rounded-2xl flex-row items-center justify-between mt-8 mb-8 border border-primary/10">
                    <View className="flex-1 mr-4">
                        <Text className="text-text-main-light dark:text-text-main-dark font-bold text-base mb-1">
                            Not finding a time?
                        </Text>
                        <Text className="text-text-sub-light dark:text-text-sub-dark text-sm">
                            Check another date or contact support.
                        </Text>
                    </View>
                    <TouchableOpacity
                        onPress={() => navigation.goBack()}
                        className="bg-white dark:bg-gray-700 px-4 py-2 rounded-lg shadow-sm"
                    >
                        <Text className="text-primary font-bold text-sm">Change Date</Text>
                    </TouchableOpacity>
                </View>

            </ScrollView>

            {/* Update footer with "Back" and "Next Step" buttons */}
            <View className="p-6 pt-4 bg-background-light dark:bg-background-dark border-t border-gray-200/50 dark:border-gray-700/50 flex-row space-x-4">
                <View className="flex-1">
                     <Button
                        title="Back"
                        onPress={() => navigation.goBack()}
                        variant="secondary"
                        className="w-full"
                    />
                </View>
                <View className="flex-1">
                    <Button
                        title="Next Step"
                        onPress={handleNext}
                        disabled={!selectedTimeSlot}
                        variant="primary"
                        icon="arrow-right"
                        iconPosition="right"
                        className={`w-full ${selectedTimeSlot ? 'shadow-lg shadow-primary/30' : ''}`}
                    />
                </View>
            </View>
        </SafeAreaView>
    );
}
