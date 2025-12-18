import React, { useEffect, useState } from 'react';
import { View, Text, StatusBar, TouchableOpacity, ScrollView, TextInput, Alert, ActivityIndicator, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { RootStackParamList } from '../../../navigation/types';
import { Appointment } from '../../../api/types';
import { supabase } from '../../../api/supabase';
import { GradientAvatar } from '../../../components/GradientAvatar';
import { updateAppointmentStatus } from '../../../api/mentorService';
import { useColorScheme } from '../../../hooks/useColorScheme';

type SessionDetailRouteProp = RouteProp<RootStackParamList, 'SessionDetail'>;

export default function SessionDetailScreen() {
    const navigation = useNavigation();
    const route = useRoute<SessionDetailRouteProp>();
    const { appointmentId } = route.params || {};
    const { isDark } = useColorScheme();

    const [appointment, setAppointment] = useState<any | null>(null);
    const [loading, setLoading] = useState(true);
    const [notes, setNotes] = useState('');
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (!appointmentId) return;

        const fetchAppointment = async () => {
            try {
                const { data, error } = await supabase
                    .from('appointments')
                    .select('*, profiles:mentee_id(full_name, avatar_url)')
                    .eq('id', appointmentId)
                    .single();

                if (error) throw error;
                setAppointment(data);
                setNotes(data.notes || '');
            } catch (err) {
                Alert.alert("Error", "Failed to fetch appointment details");
                navigation.goBack();
            } finally {
                setLoading(false);
            }
        };

        fetchAppointment();
    }, [appointmentId]);

    const handleUpdateStatus = async (status: string) => {
        try {
            setSaving(true);
            await updateAppointmentStatus(appointmentId, status, notes);
            setAppointment((prev: any) => ({ ...prev, status, notes }));
            Alert.alert("Success", `Session marked as ${status}`);
        } catch (err) {
            Alert.alert("Error", "Failed to update session");
        } finally {
            setSaving(false);
        }
    };

    const handleSaveNotes = async () => {
        try {
            setSaving(true);
            await updateAppointmentStatus(appointmentId, appointment.status, notes); // Only update notes
            Alert.alert("Success", "Notes saved");
        } catch (err) {
            Alert.alert("Error", "Failed to save notes");
        } finally {
            setSaving(false);
        }
    }

    if (loading) {
        return (
            <View className="flex-1 items-center justify-center bg-white dark:bg-gray-900">
                <ActivityIndicator size="large" color="#30bae8" />
            </View>
        );
    }

    if (!appointment) return null;

    const mentee = appointment.profiles;

    return (
        <View className="flex-1 bg-white dark:bg-gray-900">
            <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />
            <SafeAreaView className="flex-1">
                <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
                    {/* Header */}
                    <View className="px-6 py-4 flex-row items-center border-b border-gray-100 dark:border-gray-700 mb-6">
                        <TouchableOpacity onPress={() => navigation.goBack()} className="mr-4">
                            <MaterialCommunityIcons name="arrow-left" size={24} color={isDark ? "#fff" : "#333"} />
                        </TouchableOpacity>
                        <Text className="text-xl font-bold text-gray-900 dark:text-white">Session Details</Text>
                    </View>

                    {/* Mentee Info */}
                    <View className="px-6 items-center mb-8">
                        <GradientAvatar
                            source={mentee?.avatar_url ? { uri: mentee.avatar_url } : { uri: 'https://via.placeholder.com/150' }}
                            size={80}
                        />
                        <Text className="text-xl font-bold text-gray-900 dark:text-white mt-3">{mentee?.full_name || 'Mentee'}</Text>
                        <View className={`px-3 py-1 rounded-full mt-2 bg-gray-100 dark:bg-gray-800`}>
                            <Text className="text-gray-600 dark:text-gray-300 font-bold uppercase text-xs">{appointment.status}</Text>
                        </View>
                    </View>

                    {/* Meta Data */}
                    <View className="px-6 mb-8 flex-row justify-around">
                        <View className="items-center">
                            <MaterialCommunityIcons name="calendar" size={24} color="#30bae8" />
                            <Text className="text-gray-900 dark:text-white font-bold mt-1">{new Date(appointment.start_time).toLocaleDateString()}</Text>
                            <Text className="text-gray-400 dark:text-gray-500 text-xs">Date</Text>
                        </View>
                        <View className="items-center">
                            <MaterialCommunityIcons name="clock-outline" size={24} color="#30bae8" />
                            <Text className="text-gray-900 dark:text-white font-bold mt-1">{new Date(appointment.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
                            <Text className="text-gray-400 dark:text-gray-500 text-xs">Time</Text>
                        </View>
                        <View className="items-center">
                            <MaterialCommunityIcons name="video" size={24} color={appointment.meeting_link ? "#10B981" : "#9CA3AF"} />
                            <Text className="text-gray-900 dark:text-white font-bold mt-1">{appointment.meeting_link ? 'Online' : 'TBD'}</Text>
                            <Text className="text-gray-400 dark:text-gray-500 text-xs">Location</Text>
                        </View>
                    </View>

                    {/* Meeting Link */}
                    {appointment.meeting_link && (appointment.status === 'confirmed' || appointment.status === 'pending') && (
                        <View className="px-6 mb-8">
                            <TouchableOpacity
                                className="bg-blue-500 py-4 rounded-xl flex-row justify-center items-center shadow-md shadow-blue-200"
                                onPress={() => Linking.openURL(appointment.meeting_link)}
                            >
                                <MaterialCommunityIcons name="video" size={24} color="white" className="mr-2" />
                                <Text className="text-white font-bold text-lg">Join Meeting</Text>
                            </TouchableOpacity>
                        </View>
                    )}

                    {/* Notes Section */}
                    <View className="px-6 mb-6">
                        <View className="flex-row justify-between items-center mb-2">
                            <Text className="text-lg font-bold text-gray-900 dark:text-white">Session Notes</Text>
                            <TouchableOpacity onPress={handleSaveNotes} disabled={saving}>
                                <Text className="text-primary font-bold">{saving ? 'Saving...' : 'Save'}</Text>
                            </TouchableOpacity>
                        </View>
                        <TextInput
                            className="bg-gray-50 dark:bg-gray-800 p-4 rounded-xl text-gray-800 dark:text-white min-h-[120px] text-base"
                            placeholder="Add private notes about this session..."
                            multiline
                            textAlignVertical="top"
                            value={notes}
                            onChangeText={setNotes}
                        />
                    </View>

                    {/* Feedback Section (if completed) */}
                    {appointment.feedback && (
                        <View className="px-6 mb-8">
                            <Text className="text-lg font-bold text-gray-900 dark:text-white mb-2">Mentee Feedback</Text>
                            <View className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-xl border border-purple-100 dark:border-purple-800">
                                <Text className="text-gray-700 dark:text-gray-300 italic">"{appointment.feedback}"</Text>
                            </View>
                        </View>
                    )}

                    {/* Action Buttons */}
                    <View className="px-6 mt-4 gap-3">
                        {appointment.status === 'pending' && (
                            <TouchableOpacity
                                className="bg-green-500 py-3 rounded-xl items-center"
                                onPress={() => handleUpdateStatus('confirmed')}
                            >
                                <Text className="text-white font-bold text-base">Confirm Session</Text>
                            </TouchableOpacity>
                        )}
                        {appointment.status === 'confirmed' && (
                            <TouchableOpacity
                                className="bg-gray-900 py-3 rounded-xl items-center"
                                onPress={() => handleUpdateStatus('completed')}
                            >
                                <Text className="text-white font-bold text-base">Mark as Completed</Text>
                            </TouchableOpacity>
                        )}
                        {(appointment.status === 'pending' || appointment.status === 'confirmed') && (
                            <TouchableOpacity
                                className="bg-red-50 py-3 rounded-xl items-center border border-red-100"
                                onPress={() => handleUpdateStatus('cancelled')}
                            >
                                <Text className="text-red-500 font-bold text-base">Cancel Session</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                </ScrollView>
            </SafeAreaView>
        </View>
    );
}
