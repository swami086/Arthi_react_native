import React, { useState, useEffect } from 'react';
import { View, Text, SafeAreaView, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { Calendar, DateData, LocaleConfig } from 'react-native-calendars';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { format } from 'date-fns';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { MotiView } from 'moti';

import { RootStackParamList, RootNavigationProp } from '../../../navigation/types';
import { ProgressIndicator } from '../components/ProgressIndicator';
import { TimeSlotButton } from '../components/TimeSlotButton';
import { useBookingFlow } from '../hooks/useBookingFlow';
import { TimeSlot } from '../utils/timeSlots';

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

import { useColorScheme } from '../../../hooks/useColorScheme';

export default function SelectDateScreen() {
    const navigation = useNavigation<RootNavigationProp>();
    const route = useRoute<SelectDateRouteProp>();
    const { mentorId, mentorName, mentorAvatar } = route.params;
    const { isDark } = useColorScheme();

    const [selectedDate, setSelectedDate] = useState<string>('');
    const [selectedTimeSlot, setSelectedTimeSlot] = useState<TimeSlot | null>(null);
    const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);

    // Fake current month for custom header
    const [currentMonth, setCurrentMonth] = useState(new Date());

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
        <View className="flex-1 bg-gray-50 dark:bg-background-dark">
            <SafeAreaView className="flex-1">
                {/* Header */}
                <View className="flex-row items-center px-6 py-4 bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700 z-10">
                    <TouchableOpacity onPress={() => navigation.goBack()} className="mr-4 p-2 -ml-2 rounded-full bg-gray-50 dark:bg-gray-700">
                        <MaterialCommunityIcons name="arrow-left" size={24} color={isDark ? "#fff" : "#333"} />
                    </TouchableOpacity>
                    <Text className="text-xl font-bold text-gray-900 dark:text-white">New Session</Text>
                </View>

                <ScrollView className="flex-1 px-6 pt-6" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
                    <ProgressIndicator currentStep={1} />

                    <Text className="text-2xl font-bold text-gray-900 dark:text-white mb-2 leading-8">Pick a day that works for you.</Text>
                    <Text className="text-gray-500 dark:text-gray-400 mb-8 leading-5">Mentors are available Monday through Saturday. All times are in your local timezone.</Text>

                    {/* Calendar Card */}
                    <MotiView
                        from={{ opacity: 0, translateY: 20 }}
                        animate={{ opacity: 1, translateY: 0 }}
                        transition={{ type: 'timing', duration: 500 }}
                    >
                        <View className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm p-4 mb-8 border border-gray-100 dark:border-gray-700">
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
                                    monthTextColor: isDark ? '#ffffff' : '#1F2937',
                                    textMonthFontWeight: 'bold',
                                    textMonthFontSize: 18,
                                    textDayFontFamily: 'System',
                                    textMonthFontFamily: 'System',
                                    textDayHeaderFontFamily: 'System',
                                    textDayFontWeight: '600',
                                    textDayHeaderFontWeight: '600',
                                    selectedDayBackgroundColor: '#30bae8',
                                    selectedDayTextColor: '#ffffff',
                                    backgroundColor: 'transparent',
                                    calendarBackground: 'transparent', // Important for dark mode
                                    dayTextColor: isDark ? '#e5e7eb' : '#2d4150',
                                    textDisabledColor: isDark ? '#4b5563' : '#d9e1e8',
                                }}
                                minDate={new Date().toISOString().split('T')[0]}
                                enableSwipeMonths={true}
                                style={{ borderRadius: 16 }}
                            />
                        </View>
                    </MotiView>

                    {/* Time Slots */}
                    {selectedDate ? (
                        <MotiView
                            from={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ type: 'timing', duration: 400, delay: 200 }}
                        >
                            <View className="mb-8">
                                <View className="flex-row items-center mb-4">
                                    <View className="bg-blue-50 dark:bg-blue-900/30 p-2 rounded-full mr-3">
                                        <MaterialCommunityIcons name="clock-outline" size={20} color="#30bae8" />
                                    </View>
                                    <Text className="text-lg font-bold text-gray-900 dark:text-white">
                                        Available times
                                    </Text>
                                </View>

                                {loading ? (
                                    <ActivityIndicator color="#30bae8" size="large" className="py-8" />
                                ) : (
                                    <View className="flex-row flex-wrap justify-between">
                                        {availableSlots.length > 0 ? availableSlots.map((slot, index) => (
                                            <View key={index} style={{ width: '31%' }}>
                                                <TimeSlotButton
                                                    time={slot.time}
                                                    duration="45m"
                                                    isSelected={selectedTimeSlot?.time === slot.time}
                                                    onPress={() => setSelectedTimeSlot(slot)}
                                                    disabled={!slot.available}
                                                />
                                            </View>
                                        )) : (
                                            <Text className="text-gray-500 dark:text-gray-400 py-4 w-full text-center">No slots available for this date.</Text>
                                        )}
                                    </View>
                                )}
                            </View>
                        </MotiView>
                    ) : null}
                </ScrollView>

                {/* Bottom Bar */}
                <View className="absolute bottom-0 left-0 right-0">
                    <BlurView intensity={80} tint={isDark ? 'dark' : 'light'} className="flex-row p-6 pt-4 pb-8 border-t border-gray-200/50 dark:border-gray-700/50">
                        <TouchableOpacity
                            onPress={handleNext}
                            disabled={!selectedDate || !selectedTimeSlot}
                            className={`flex-1 flex-row items-center justify-center py-4 rounded-xl shadow-lg ${selectedDate && selectedTimeSlot ? 'bg-primary shadow-blue-200' : 'bg-gray-200 dark:bg-gray-700'
                                }`}
                        >
                            <Text className={`font-bold text-lg mr-2 ${selectedDate && selectedTimeSlot ? 'text-white' : 'text-gray-400 dark:text-gray-500'}`}>
                                Next Step
                            </Text>
                            <MaterialCommunityIcons
                                name="arrow-right"
                                size={20}
                                color={selectedDate && selectedTimeSlot ? "white" : (isDark ? "#6b7280" : "#9CA3AF")}
                            />
                        </TouchableOpacity>
                    </BlurView>
                </View>
            </SafeAreaView>
        </View>
    );
}
