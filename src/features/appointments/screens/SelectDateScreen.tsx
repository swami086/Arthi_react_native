import React, { useState, useEffect } from 'react';
import { View, Text, SafeAreaView, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { Calendar, DateData, LocaleConfig } from 'react-native-calendars';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { MotiView } from 'moti';
import { BlurView } from 'expo-blur';

import { RootStackParamList, RootNavigationProp } from '../../../navigation/types';
import { ProgressIndicator } from '../components/ProgressIndicator';
import { TimeSlotButton } from '../components/TimeSlotButton';
import { useBookingFlow } from '../hooks/useBookingFlow';
import { TimeSlot } from '../utils/timeSlots';
import { useColorScheme } from '../../../hooks/useColorScheme';
import { Button } from '../../../components/Button';

type SelectDateRouteProp = RouteProp<RootStackParamList, 'SelectDate'>;

// Configure calendar theme
LocaleConfig.locales['en'] = {
    monthNames: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
    monthNamesShort: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    dayNames: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
    dayNamesShort: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
    today: 'Today'
};
LocaleConfig.defaultLocale = 'en';

export default function SelectDateScreen() {
    const navigation = useNavigation<RootNavigationProp>();
    const route = useRoute<SelectDateRouteProp>();
    const { mentorId, mentorName, mentorAvatar } = route.params;
    const { isDark } = useColorScheme();

    const [selectedDate, setSelectedDate] = useState<string>('');
    const [selectedTimeSlot, setSelectedTimeSlot] = useState<TimeSlot | null>(null);
    const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);

    const { loading, getAvailableTimeSlots } = useBookingFlow();

    useEffect(() => {
        if (selectedDate) {
            loadSlots(selectedDate);
            setSelectedTimeSlot(null);
        }
    }, [selectedDate]);

    const loadSlots = async (date: string) => {
        const slots = await getAvailableTimeSlots(mentorId, date);
        setAvailableSlots(slots);
    };

    const handleNext = () => {
        if (selectedDate && selectedTimeSlot) {
            navigation.navigate('ChooseTime', {
                mentorId,
                mentorName,
                mentorAvatar,
                selectedDate,
                selectedTime: selectedTimeSlot?.time,
                selectedTimeEnd: selectedTimeSlot?.endTime
            });
        }
    };

    return (
        <View className="flex-1 bg-background-light dark:bg-background-dark">
            <SafeAreaView className="flex-1">
                {/* Header */}
                <View className="flex-row items-center justify-between px-6 py-4 z-10">
                    <TouchableOpacity onPress={() => navigation.goBack()} className="p-2 -ml-2 rounded-full active:bg-gray-100 dark:active:bg-gray-800">
                        <MaterialCommunityIcons name="arrow-left" size={24} color={isDark ? "#fff" : "#0e181b"} />
                    </TouchableOpacity>
                    <Text className="text-lg font-bold text-text-main-light dark:text-text-main-dark">Book Session</Text>
                    <View className="w-10" />
                </View>

                <ScrollView className="flex-1 px-6 pt-2" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 140 }}>
                    <ProgressIndicator currentStep={1} />

                    <Text className="text-3xl font-bold text-text-main-light dark:text-text-main-dark mb-2 leading-tight tracking-tight">Select Date</Text>
                    <Text className="text-text-sub-light dark:text-text-sub-dark mb-8 leading-relaxed font-medium">
                        Pick a day that works for you.
                    </Text>

                    {/* Calendar Card */}
                    <MotiView
                        from={{ opacity: 0, translateY: 20 }}
                        animate={{ opacity: 1, translateY: 0 }}
                        transition={{ type: 'timing', duration: 500 }}
                    >
                        <View className="bg-white dark:bg-surface-dark rounded-3xl shadow-card p-4 mb-8 border border-gray-100 dark:border-gray-700">
                            <Calendar
                                onDayPress={(day: DateData) => setSelectedDate(day.dateString)}
                                markedDates={{
                                    [selectedDate]: {
                                        selected: true,
                                        selectedColor: '#30bae8',
                                        customStyles: {
                                            container: {
                                                borderRadius: 12,
                                                elevation: 4
                                            }
                                        }
                                    }
                                }}
                                theme={{
                                    todayTextColor: '#30bae8',
                                    arrowColor: '#30bae8',
                                    monthTextColor: isDark ? '#ffffff' : '#0e181b',
                                    textMonthFontWeight: '800',
                                    textMonthFontSize: 18,
                                    textDayFontFamily: 'Plus Jakarta Sans',
                                    textMonthFontFamily: 'Plus Jakarta Sans',
                                    textDayHeaderFontFamily: 'Plus Jakarta Sans',
                                    textDayFontWeight: '600',
                                    textDayHeaderFontWeight: '700',
                                    selectedDayBackgroundColor: '#30bae8',
                                    selectedDayTextColor: '#ffffff',
                                    backgroundColor: 'transparent',
                                    calendarBackground: 'transparent', // Important for dark mode
                                    dayTextColor: isDark ? '#e5e7eb' : '#0e181b',
                                    textDisabledColor: isDark ? '#4b5563' : '#d9e1e8',
                                }}
                                minDate={new Date().toISOString().split('T')[0]}
                                enableSwipeMonths={true}
                                style={{ borderRadius: 16 }}
                            />
                        </View>
                    </MotiView>

                    {/* Time Slots */}
                    {selectedDate && (
                        <MotiView
                            from={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ type: 'timing', duration: 400, delay: 200 }}
                        >
                            <View className="mb-4">
                                <View className="flex-row items-center mb-4">
                                    <View className="bg-primary/10 p-2 rounded-full mr-3">
                                        <MaterialCommunityIcons name="clock-time-four-outline" size={20} color="#30bae8" />
                                    </View>
                                    <Text className="text-lg font-bold text-text-main-light dark:text-text-main-dark">
                                        Available Times
                                    </Text>
                                </View>

                                <View className="bg-blue-50 dark:bg-blue-900/20 px-4 py-3 rounded-xl mb-6 flex-row items-start">
                                    <MaterialCommunityIcons name="information-outline" size={20} color="#30bae8" style={{ marginTop: 2 }} />
                                    <Text className="ml-2 text-sm text-text-sub-light dark:text-text-sub-dark flex-1">
                                        All times are shown in your local timezone. Select a slot to proceed.
                                    </Text>
                                </View>

                                {loading ? (
                                    <ActivityIndicator color="#30bae8" size="large" className="py-8" />
                                ) : (
                                    <View className="flex-row flex-wrap justify-between -mx-1">
                                        {availableSlots.length > 0 ? availableSlots.map((slot, index) => (
                                            <View key={index} style={{ width: '33.33%', paddingHorizontal: 4 }}>
                                                <TimeSlotButton
                                                    time={slot.time}
                                                    duration="45m"
                                                    isSelected={selectedTimeSlot?.time === slot.time}
                                                    onPress={() => setSelectedTimeSlot(slot)}
                                                    disabled={!slot.available}
                                                />
                                            </View>
                                        )) : (
                                            <Text className="text-text-sub-light dark:text-text-sub-dark py-4 w-full text-center">No slots available for this date.</Text>
                                        )}
                                    </View>
                                )}
                            </View>
                        </MotiView>
                    )}
                </ScrollView>

                {/* Bottom Bar */}
                <View className="absolute bottom-0 left-0 right-0">
                     {/* @ts-ignore */}
                    <BlurView intensity={80} tint={isDark ? 'dark' : 'light'} className="p-6 pb-10 border-t border-gray-200/50 dark:border-gray-700/50">
                        <Button
                            title="Next Step"
                            onPress={handleNext}
                            disabled={!selectedDate || !selectedTimeSlot}
                            variant="primary"
                            icon="arrow-right"
                            iconPosition="right"
                            className="w-full shadow-lg shadow-primary/30"
                        />
                    </BlurView>
                </View>
            </SafeAreaView>
        </View>
    );
}
