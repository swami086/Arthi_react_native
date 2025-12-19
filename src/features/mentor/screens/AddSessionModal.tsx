import React, { useState, useEffect } from 'react';
import { View, Text, Modal, TouchableOpacity, TextInput, Alert, ScrollView, ActivityIndicator, StyleSheet } from 'react-native';
import { Calendar } from 'react-native-calendars';
import Icon from 'react-native-vector-icons/Feather';
import { getMenteeList, createSession, checkAppointmentConflict } from '../../../api/mentorService';
import { MenteeWithActivity } from '../../../api/types';
import { supabase } from '../../../api/supabase';
import { useColorScheme } from '../../../hooks/useColorScheme';

interface AddSessionModalProps {
    visible: boolean;
    onClose: () => void;
    onSuccess: () => void;
    mentorId: string;
}

export const AddSessionModal: React.FC<AddSessionModalProps> = ({ visible, onClose, onSuccess, mentorId }) => {
    const [mentees, setMentees] = useState<MenteeWithActivity[]>([]);
    const [loadingMentees, setLoadingMentees] = useState(false);
    const [selectedMentee, setSelectedMentee] = useState<string | null>(null);
    const [selectedDate, setSelectedDate] = useState<string>('');
    const [selectedTime, setSelectedTime] = useState<string>('09:00');
    const [duration, setDuration] = useState<number>(45);
    const [notes, setNotes] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const { isDark } = useColorScheme();

    useEffect(() => {
        if (visible) {
            fetchMentees();
        }
    }, [visible]);

    const fetchMentees = async () => {
        setLoadingMentees(true);
        try {
            const data = await getMenteeList(mentorId);
            setMentees(data);
        } catch (error) {
            Alert.alert('Error', 'Failed to load mentees');
        } finally {
            setLoadingMentees(false);
        }
    };

    const handleCreate = async () => {
        if (!selectedMentee || !selectedDate || !selectedTime) {
            Alert.alert('Missing Fields', 'Please select a mentee, date, and time.');
            return;
        }

        setSubmitting(true);
        try {
            // Combine date and time
            const dateParts = selectedDate.split('-').map(Number);
            const timeParts = selectedTime.split(':').map(Number);
            const sessionStart = new Date(dateParts[0], dateParts[1] - 1, dateParts[2], timeParts[0], timeParts[1]);

            const endTime = new Date(sessionStart.getTime() + duration * 60000);
            if (await checkAppointmentConflict(mentorId, sessionStart.toISOString(), endTime.toISOString())) {
                Alert.alert('Scheduling Conflict', 'This time overlaps with an existing session. Please choose another slot.');
                setSubmitting(false);
                return;
            }

            await createSession(mentorId, selectedMentee, sessionStart, duration, notes);

            Alert.alert('Success', 'Session created successfully!');
            onSuccess();
            onClose();
            resetForm();
        } catch (error) {
            console.error(error);
            Alert.alert('Error', 'Failed to create session. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    const resetForm = () => {
        setSelectedMentee(null);
        setSelectedDate('');
        setSelectedTime('09:00');
        setNotes('');
        setDuration(45);
    };

    const timeSlots = [
        '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
        '12:00', '13:00', '13:30', '14:00', '14:30', '15:00',
        '15:30', '16:00', '16:30', '17:00'
    ];

    return (
        <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
            <View className="flex-1 bg-white dark:bg-gray-900 p-4">
                <View className="flex-row justify-between items-center mb-4 mt-4">
                    <Text className="text-xl font-bold text-gray-900 dark:text-white">Add New Session</Text>
                    <TouchableOpacity onPress={onClose}>
                        <Icon name="x" size={24} color={isDark ? "#fff" : "#666"} />
                    </TouchableOpacity>
                </View>

                <ScrollView contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>

                    {/* Mentee Selection */}
                    <Text className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Select Mentee</Text>
                    {loadingMentees ? (
                        <ActivityIndicator size="small" color={isDark ? "#fff" : "#000"} />
                    ) : mentees.length === 0 ? (
                        <View className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg mb-4 border border-dashed border-gray-300 dark:border-gray-700">
                            <Text className="text-gray-500 dark:text-gray-400 text-center italic">
                                No active mentees found. Connect with a mentee to schedule a session.
                            </Text>
                        </View>
                    ) : (
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-4">
                            {Array.from(new Map(mentees.map(m => [m.mentee_id, m])).values()).map((mentee) => (
                                <TouchableOpacity
                                    key={mentee.mentee_id}
                                    onPress={() => setSelectedMentee(mentee.mentee_id)}
                                    className={`mr-3 p-3 rounded-lg border ${selectedMentee !== null && selectedMentee === mentee.mentee_id ? 'bg-indigo-50 dark:bg-indigo-900/30 border-indigo-500' : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'}`}
                                >
                                    <Text className={`font-medium ${selectedMentee !== null && selectedMentee === mentee.mentee_id ? 'text-indigo-700 dark:text-indigo-300' : 'text-gray-700 dark:text-gray-300'}`}>
                                        {mentee.full_name || 'Unknown'}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    )}

                    {/* Date Selection */}
                    <Text className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Date</Text>
                    <Calendar
                        onDayPress={(day: any) => setSelectedDate(day.dateString)}
                        markedDates={{
                            [selectedDate]: { selected: true, selectedColor: '#6366f1' }
                        }}
                        theme={{
                            todayTextColor: '#6366f1',
                            arrowColor: '#6366f1',
                            calendarBackground: 'transparent',
                            monthTextColor: isDark ? '#fff' : '#000',
                            dayTextColor: isDark ? '#fff' : '#000',
                            textDisabledColor: isDark ? '#444' : '#d9e1e8',
                        }}
                        style={{ borderRadius: 10, borderWidth: 1, borderColor: isDark ? '#333' : '#eee', marginBottom: 16 }}
                    />

                    {/* Time Selection */}
                    <Text className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Time</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-4">
                        {timeSlots.map(time => (
                            <TouchableOpacity
                                key={time}
                                onPress={() => setSelectedTime(time)}
                                className={`mr-2 px-4 py-2 rounded-full border ${selectedTime === time ? 'bg-indigo-600 border-indigo-600' : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'}`}
                            >
                                <Text className={`${selectedTime === time ? 'text-white' : 'text-gray-700 dark:text-gray-300'}`}>{time}</Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>

                    {/* Duration Selection */}
                    <Text className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Duration</Text>
                    <View className="flex-row mb-4">
                        {[30, 45, 60].map(d => (
                            <TouchableOpacity
                                key={d}
                                onPress={() => setDuration(d)}
                                className={`mr-2 px-4 py-2 rounded-full border ${duration === d ? 'bg-indigo-600 border-indigo-600' : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'}`}
                            >
                                <Text className={`${duration === d ? 'text-white' : 'text-gray-700 dark:text-gray-300'}`}>{d} min</Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    {/* Notes */}
                    <Text className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Notes</Text>
                    <TextInput
                        className="border border-gray-200 dark:border-gray-700 rounded-lg p-3 h-24 text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-800 mb-6"
                        multiline
                        textAlignVertical="top"
                        placeholder="Add session agenda or notes..."
                        value={notes}
                        onChangeText={setNotes}
                    />

                    {/* Action Button */}
                    <TouchableOpacity
                        onPress={handleCreate}
                        disabled={submitting}
                        className={`py-4 rounded-xl items-center ${submitting ? 'bg-indigo-400' : 'bg-indigo-600'}`}
                    >
                        {submitting ? (
                            <ActivityIndicator color="white" />
                        ) : (
                            <Text className="text-white font-bold text-lg">Create Session</Text>
                        )}
                    </TouchableOpacity>

                </ScrollView>
            </View>
        </Modal>
    );
};
