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
import { tokens } from '../../../design-system/tokens';

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
        <View className="flex-1 bg-background dark:bg-background-dark">
            <SafeAreaView className="flex-1">
                {/* Header */}
                <View className="flex-row items-center justify-between px-6 py-4 z-10 h-[72px]">
                    <TouchableOpacity onPress={() => navigation.goBack()} className="w-10 h-10 items-center justify-center rounded-full bg-surface dark:bg-surface-dark border border-border dark:border-border-dark">
                        <MaterialCommunityIcons name="arrow-left" size={24} color={isDark ? tokens.colors.text.primary.dark : tokens.colors.text.primary.light} />
                    </TouchableOpacity>
                    <Text className="text-lg font-bold text-text-primary dark:text-text-primary-dark font-primary">Book Session</Text>
                    <View className="w-10" />
                </View>

                <ScrollView className="flex-1 px-6 pt-2" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 140 }}>
                    <ProgressIndicator currentStep={1} />

                    <View className="mb-6">
                        <Text className="text-xxxl font-bold text-text-primary dark:text-text-primary-dark mb-2 leading-tight tracking-tight font-primary">Select Date</Text>
                        <Text className="text-text-secondary dark:text-text-secondary-dark leading-relaxed font-medium font-primary">
                            Pick a day that works for you.
                        </Text>
                    </View>

                    {/* Calendar Card */}
                    <MotiView
                        from={{ opacity: 0, translateY: 20 }}
                        animate={{ opacity: 1, translateY: 0 }}
                        transition={{ type: 'timing', duration: 500 }}
                    >
                        <View className="bg-surface dark:bg-surface-elevated-dark rounded-3xl shadow-soft dark:shadow-none p-4 mb-8 border border-border dark:border-border-dark">
                            <Calendar
                                onDayPress={(day: DateData) => setSelectedDate(day.dateString)}
                                markedDates={{
                                    [selectedDate]: {
                                        selected: true,
                                        selectedColor: tokens.colors.primary.light,
                                        customStyles: {
                                            container: {
                                                borderRadius: 12,
                                                elevation: 4
                                            }
                                        }
                                    }
                                }}
                                theme={{
                                    todayTextColor: tokens.colors.primary.light,
                                    arrowColor: tokens.colors.primary.light,
                                    monthTextColor: isDark ? tokens.colors.text.primary.dark : tokens.colors.text.primary.light,
                                    textMonthFontWeight: '800',
                                    textMonthFontSize: 18,
                                    textDayFontFamily: 'Plus Jakarta Sans',
                                    textMonthFontFamily: 'Plus Jakarta Sans',
                                    textDayHeaderFontFamily: 'Plus Jakarta Sans',
                                    textDayFontWeight: '600',
                                    textDayHeaderFontWeight: '700',
                                    selectedDayBackgroundColor: tokens.colors.primary.light,
                                    selectedDayTextColor: '#ffffff',
                                    backgroundColor: 'transparent',
                                    calendarBackground: 'transparent',
                                    dayTextColor: isDark ? tokens.colors.text.primary.dark : tokens.colors.text.primary.light,
                                    textDisabledColor: isDark ? tokens.colors.text.disabled.dark : tokens.colors.text.disabled.light,
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
                                <View className="flex-row items-center mb-4 gap-3">
                                    <View className="bg-primary/10 dark:bg-primary-dark/20 p-2.5 rounded-full">
                                        <MaterialCommunityIcons name="clock-time-four-outline" size={20} color={tokens.colors.primary.light} />
                                    </View>
                                    <Text className="text-xl font-bold text-text-primary dark:text-text-primary-dark font-primary">
                                        Available Times
                                    </Text>
                                </View>

                                <View className="bg-primary/5 dark:bg-primary-dark/10 px-4 py-3 rounded-xl mb-6 flex-row items-start border border-primary/10 dark:border-primary-dark/10">
                                    <MaterialCommunityIcons name="information-outline" size={20} color={tokens.colors.primary.light} style={{ marginTop: 2 }} />
                                    <Text className="ml-2 text-sm text-text-secondary dark:text-text-secondary-dark flex-1 font-primary leading-relaxed">
                                        All times are shown in your local timezone. Select a slot to proceed.
                                    </Text>
                                </View>

                                {loading ? (
                                    <ActivityIndicator color={tokens.colors.primary.light} size="large" className="py-8" />
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
                                            <View className="w-full py-8 items-center bg-surface dark:bg-surface-elevated-dark rounded-2xl border border-dashed border-border dark:border-border-dark">
                                                <Text className="text-text-secondary dark:text-text-secondary-dark font-primary">No slots available for this date.</Text>
                                            </View>
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
                    <BlurView intensity={80} tint={isDark ? 'dark' : 'light'} className="p-6 pb-10 border-t border-border dark:border-border-dark">
                        <Button
                            title="Next Step"
                            onPress={handleNext}
                            disabled={!selectedDate || !selectedTimeSlot}
                            variant="primary"
                            icon="arrow-right"
                            iconPosition="right"
                            className="w-full shadow-elevated"
                        />
                    </BlurView>
                </View>
            </SafeAreaView>
        </View>
    );
}
