import React, { useState } from 'react';
import { View, Text, Alert, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RouteProp, useRoute, useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../../navigation/types';
import { Button } from '../../../components/Button';
import { Input } from '../../../components/Input';
import { supabase } from '../../../api/supabase';
import { useAuth } from '../../auth/hooks/useAuth';

type BookingScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Booking'>;
type BookingScreenRouteProp = RouteProp<RootStackParamList, 'Booking'>;

export const BookingScreen = () => {
    const route = useRoute<BookingScreenRouteProp>();
    const navigation = useNavigation<BookingScreenNavigationProp>();
    const { mentorId, mentorName } = route.params;
    const { user } = useAuth();

    const [date, setDate] = useState(''); // YYYY-MM-DD
    const [time, setTime] = useState(''); // HH:MM
    const [loading, setLoading] = useState(false);

    const handleBook = async () => {
        if (!date || !time) {
            Alert.alert('Error', 'Please enter both date and time');
            return;
        }

        // Basic validation regex
        const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
        const timeRegex = /^\d{2}:\d{2}$/;

        if (!dateRegex.test(date)) {
            Alert.alert('Error', 'Invalid date format. Use YYYY-MM-DD');
            return;
        }
        if (!timeRegex.test(time)) {
            Alert.alert('Error', 'Invalid time format. Use HH:MM');
            return;
        }

        setLoading(true);
        try {
            // Construct timestamp
            const startDateTime = new Date(`${date}T${time}:00`);
            const endDateTime = new Date(startDateTime.getTime() + 60 * 60 * 1000); // 1 hour duration

            if (isNaN(startDateTime.getTime())) {
                throw new Error('Invalid date/time');
            }

            const { error } = await supabase
                .from('appointments')
                .insert({
                    mentor_id: mentorId,
                    mentee_id: user!.id,
                    start_time: startDateTime.toISOString(),
                    end_time: endDateTime.toISOString(),
                    status: 'pending',
                });

            if (error) throw error;

            Alert.alert('Success', 'Appointment request sent!', [
                { text: 'OK', onPress: () => navigation.goBack() }
            ]);

        } catch (error: any) {
            Alert.alert('Error', error.message || 'Failed to book appointment');
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-background-light dark:bg-background-dark p-6" edges={['top']}>
            <View className="flex-row items-center mb-6">
                <Button
                    title="Back"
                    onPress={() => navigation.goBack()}
                    variant="ghost"
                    className="mr-4"
                />
                <Text className="text-2xl font-bold text-text-main-light dark:text-text-main-dark flex-1">
                    Book Appointment
                </Text>
            </View>

            <ScrollView>
                <View className="bg-white dark:bg-gray-800 p-6 rounded-xl mb-6 shadow-sm">
                    <Text className="text-text-sub-light dark:text-text-sub-dark mb-1 font-bold">MENTOR</Text>
                    <Text className="text-xl text-text-main-light dark:text-text-main-dark mb-4">{mentorName}</Text>

                    <View className="h-[1px] bg-gray-200 dark:bg-gray-700 mb-4" />

                    <Text className="text-sm text-gray-500 italic">
                        Session duration: 1 hour
                    </Text>
                </View>

                <View className="mb-6">
                    <Input
                        label="Date (YYYY-MM-DD)"
                        value={date}
                        onChangeText={setDate}
                        placeholder="2024-01-01"
                        keyboardType="numbers-and-punctuation"
                    />
                    <Input
                        label="Time (HH:MM)"
                        value={time}
                        onChangeText={setTime}
                        placeholder="14:00"
                        keyboardType="numbers-and-punctuation"
                    />
                </View>

                <Button
                    title="Confirm Booking"
                    onPress={handleBook}
                    loading={loading}
                />
            </ScrollView>
        </SafeAreaView>
    );
};
