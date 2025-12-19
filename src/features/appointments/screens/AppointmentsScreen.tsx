import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, FlatList, ActivityIndicator, TouchableOpacity, RefreshControl, Image, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Appointment } from '../../../api/types';
import { useAppointments } from '../hooks/useAppointments';
import { useNavigation, CommonActions } from '@react-navigation/native';
import { MainTabCompositeProp } from '../../../navigation/types';
import { getVideoRoom, createVideoRoom } from '../../../api/videoService';
import { ErrorBoundary } from '../../../components/ErrorBoundary';
import { MotiView } from 'moti';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Button } from '../../../components/Button';
import { useColorScheme } from '../../../hooks/useColorScheme';

export const AppointmentsScreen = () => {
    const { appointments, loading, error, refetch: refreshAppointments } = useAppointments();
    const navigation = useNavigation<any>();
    const { isDark } = useColorScheme();
    const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>('upcoming');

    // Filter appointments based on tab
    const filteredAppointments = React.useMemo(() => {
        const now = new Date();
        if (activeTab === 'upcoming') {
            return appointments.filter(a => new Date(a.end_time) >= now).sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime());
        } else {
            return appointments.filter(a => new Date(a.end_time) < now).sort((a, b) => new Date(b.start_time).getTime() - new Date(a.start_time).getTime());
        }
    }, [appointments, activeTab]);

    const handleJoinSession = async (appointment: Appointment) => {
        try {
            // Get or create video room
            let videoRoom = await getVideoRoom(appointment.id);

            if (!videoRoom) {
                videoRoom = await createVideoRoom(appointment.id);
            }

            // Navigate to waiting room
            navigation.navigate('VideoCallWaitingRoom', {
                appointmentId: appointment.id,
                roomId: videoRoom.id
            });
        } catch (error) {
            console.error('Error joining session:', error);
            Alert.alert('Error', 'Failed to join session. Please try again.');
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'confirmed': return '#10B981'; // green
            case 'pending': return '#F59E0B'; // yellow/amber
            case 'cancelled': return '#EF4444'; // red
            default: return '#30bae8'; // blue
        }
    };

    const getStatusBgColor = (status: string, isDark: boolean) => {
        switch (status) {
            case 'confirmed': return isDark ? 'rgba(16, 185, 129, 0.2)' : '#ECFDF5';
            case 'pending': return isDark ? 'rgba(245, 158, 11, 0.2)' : '#FFFBEB';
            case 'cancelled': return isDark ? 'rgba(239, 68, 68, 0.2)' : '#FEF2F2';
            default: return isDark ? 'rgba(48, 186, 232, 0.2)' : '#F0F9FF';
        }
    };

    const handleJoinSession = async (appointment: Appointment) => {
        try {
            // Check for payment if required
            if (appointment.payment_required && appointment.payment_status !== 'paid') {
                navigation.navigate('PaymentCheckout', {
                    appointmentId: appointment.id,
                    mentorId: appointment.mentor_id,
                    mentorName: 'Mentor', // Ideally fetch from profile
                    amount: appointment.price || 0,
                    selectedDate: appointment.start_time,
                    selectedTime: new Date(appointment.start_time).toLocaleTimeString()
                });
                return;
            }

            // Navigate to waiting room
            // In a real scenario, fetch room ID from DB or service
            const roomId = appointment.video_room_id || `room-${appointment.id}`;

            navigation.navigate('VideoCallWaitingRoom', {
                appointmentId: appointment.id,
                roomId
            });
        } catch (error) {
            Alert.alert('Error', 'Failed to join session. Please try again.');
        }
    };

    const renderAppointment = useCallback(({ item, index }: { item: Appointment; index: number }) => {
        const startTime = new Date(item.start_time);
        const endTime = new Date(item.end_time);
        const statusColor = getStatusColor(item.status);
        const statusBg = getStatusBgColor(item.status, isDark);

        return (
            <MotiView
                from={{ opacity: 0, translateY: 20 }}
                animate={{ opacity: 1, translateY: 0 }}
                transition={{ delay: index * 100, type: 'timing', duration: 400 }}
                // Redesign appointment cards with left border color coding
                className="bg-white dark:bg-surface-dark p-5 rounded-2xl mb-4 shadow-card border-l-[6px] relative overflow-hidden"
                style={{ borderLeftColor: statusColor }}
            >
                {/* Status Badge */}
                <View
                    className="absolute top-4 right-4 px-2.5 py-1 rounded-md"
                    style={{ backgroundColor: statusBg }}
                >
                    <Text
                        className="text-[10px] font-bold uppercase tracking-wider"
                        style={{ color: statusColor }}
                    >
                        {item.status}
                    </Text>
                </View>

                {/* Card Header with Mentor Avatar and details */}
                <View className="flex-row items-center mb-4">
                    {/* Placeholder for mentor avatar if available in appointment object, else initial or default */}
                    <View className="w-12 h-12 rounded-full bg-gray-200 dark:bg-gray-700 items-center justify-center mr-3 border border-gray-100 dark:border-gray-600">
                        {/* Assuming appointment has mentor info, if not we might need to fetch or use placeholder */}
                        <MaterialCommunityIcons name="account" size={24} color="#9ca3af" />
                    </View>
                    <View>
                        <Text className="text-lg font-bold text-text-main-light dark:text-text-main-dark font-sans">
                            Session with Mentor
                            {/* {item.mentor?.fullName || "Mentor"} */}
                        </Text>
                        <View className="flex-row items-center mt-1">
                            <MaterialCommunityIcons name="calendar-blank" size={14} color={isDark ? "#94aeb8" : "#4e8597"} />
                            <Text className="text-text-sub-light dark:text-text-sub-dark text-xs ml-1 font-medium">
                                {startTime.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                            </Text>
                        </View>
                    </View>
                </View>

                {/* Time Display */}
                <View className="flex-row items-center mb-4 bg-gray-50 dark:bg-gray-800/50 p-3 rounded-xl border border-gray-100 dark:border-gray-700/50">
                    <MaterialCommunityIcons name="clock-time-four-outline" size={20} color={statusColor} />
                    <Text className="text-text-main-light dark:text-text-main-dark ml-2 font-bold text-base">
                        {startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </Text>
                    <Text className="text-text-sub-light dark:text-text-sub-dark mx-2">-</Text>
                    <Text className="text-text-sub-light dark:text-text-sub-dark font-medium">
                        {endTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </Text>
                </View>

                {/* Action Buttons */}
                <View className="flex-row gap-3 mt-2">
                    {item.status === 'pending' && (
                        <>
                            <TouchableOpacity className="flex-1 bg-red-50 dark:bg-red-900/20 py-3 rounded-xl items-center border border-red-100 dark:border-red-900/30">
                                <Text className="text-red-600 dark:text-red-400 font-bold text-sm">Decline</Text>
                            </TouchableOpacity>
                            <TouchableOpacity className="flex-1 bg-green-50 dark:bg-green-900/20 py-3 rounded-xl items-center border border-green-100 dark:border-green-900/30">
                                <Text className="text-green-600 dark:text-green-400 font-bold text-sm">Confirm</Text>
                            </TouchableOpacity>
                        </>
                    )}
                    {item.status === 'confirmed' && activeTab === 'upcoming' && (
                        <View className="flex-col w-full gap-2">
                            <View className="flex-row gap-2">
                                <TouchableOpacity className="flex-1 bg-blue-50 dark:bg-blue-900/20 py-3 px-4 rounded-xl items-center border border-blue-100 dark:border-blue-900/30 flex-row justify-center">
                                    <MaterialCommunityIcons name="calendar-edit" size={18} color="#30bae8" />
                                    <Text className="text-primary font-bold text-sm ml-1">Reschedule</Text>
                                </TouchableOpacity>
                                <TouchableOpacity className="flex-1 bg-red-50 dark:bg-red-900/20 py-3 px-4 rounded-xl items-center border border-red-100 dark:border-red-900/30 flex-row justify-center">
                                    <MaterialCommunityIcons name="close-circle-outline" size={18} color="#EF4444" />
                                    <Text className="text-red-600 dark:text-red-400 font-bold text-sm ml-1">Cancel</Text>
                                </TouchableOpacity>
                            </View>
                            <TouchableOpacity
                                className="bg-primary py-3 rounded-xl items-center shadow-md shadow-primary/20 flex-row justify-center"
                                onPress={() => handleJoinSession(item)}
                            >
                                <MaterialCommunityIcons name="video" size={18} color="white" style={{ marginRight: 6 }} />
                                <Text className="text-white font-bold text-sm">Join Session</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                    {item.status === 'confirmed' && activeTab === 'past' && (
                        <TouchableOpacity className="flex-1 bg-gray-100 dark:bg-gray-700 py-3 rounded-xl items-center border border-gray-200 dark:border-gray-600">
                            <Text className="text-text-main-light dark:text-text-main-dark font-bold text-sm">View Notes</Text>
                        </TouchableOpacity>
                    )}
                </View>
            </MotiView>
        );
    }, [isDark, activeTab]);

    const renderEmptyComponent = useCallback(() => (
        <MotiView
            from={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="items-center mt-20 px-6"
        >
            <View className="w-24 h-24 bg-gray-100 dark:bg-gray-800 rounded-full items-center justify-center mb-6">
                <MaterialCommunityIcons name="calendar-blank" size={48} color={isDark ? "#4b5563" : "#d1d5db"} />
            </View>
            <Text className="text-text-main-light dark:text-text-main-dark text-xl font-bold mb-2 text-center">No {activeTab} sessions</Text>
            <Text className="text-text-sub-light dark:text-text-sub-dark text-center mb-8 leading-relaxed max-w-[250px]">
                {activeTab === 'upcoming'
                    ? "You don't have any upcoming sessions scheduled at the moment."
                    : "You haven't completed any sessions yet."}
            </Text>
            {activeTab === 'upcoming' && (
                <Button
                    title="Find a Mentor"
                    onPress={() => navigation.navigate('Mentors')}
                    variant="primary"
                    icon="magnify"
                    className="w-full max-w-[200px] shadow-lg shadow-primary/30"
                />
            )}
        </MotiView>
    ), [navigation, activeTab, isDark]);

    return (
        <SafeAreaView className="flex-1 bg-background-light dark:bg-background-dark" edges={['top']}>
            <View className="p-6 pb-2">
                <Text className="text-3xl font-bold mb-6 text-text-main-light dark:text-text-main-dark tracking-tight">My Appointments</Text>

                {/* Tab Switcher */}
                <View className="flex-row bg-gray-100 dark:bg-surface-dark p-1 rounded-2xl mb-2">
                    <TouchableOpacity
                        onPress={() => setActiveTab('upcoming')}
                        className={`flex-1 py-3 rounded-xl items-center ${activeTab === 'upcoming' ? 'bg-white dark:bg-gray-700 shadow-sm' : ''}`}
                    >
                        <Text className={`font-bold text-sm ${activeTab === 'upcoming' ? 'text-primary dark:text-white' : 'text-gray-500 dark:text-gray-400'}`}>Upcoming</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={() => setActiveTab('past')}
                        className={`flex-1 py-3 rounded-xl items-center ${activeTab === 'past' ? 'bg-white dark:bg-gray-700 shadow-sm' : ''}`}
                    >
                        <Text className={`font-bold text-sm ${activeTab === 'past' ? 'text-primary dark:text-white' : 'text-gray-500 dark:text-gray-400'}`}>History</Text>
                    </TouchableOpacity>
                </View>
            </View>

            {loading ? (
                <View className="flex-1 items-center justify-center">
                    <ActivityIndicator size="large" color="#30bae8" />
                </View>
            ) : error ? (
                <View className="flex-1 items-center justify-center px-6">
                    <Text className="text-red-500 text-center mb-4">{error}</Text>
                    <Button title="Try Again" onPress={() => refreshAppointments && refreshAppointments()} variant="outline" />
                </View>
            ) : (
                <ErrorBoundary>
                    <FlatList
                        data={filteredAppointments}
                        renderItem={renderAppointment}
                        keyExtractor={(item, index) => `${item?.id || 'ppt'}-${index}`}
                        ListEmptyComponent={renderEmptyComponent}
                        contentContainerStyle={{ padding: 24, paddingTop: 10 }}
                        showsVerticalScrollIndicator={false}
                        refreshControl={
                            <RefreshControl refreshing={loading} onRefresh={() => refreshAppointments && refreshAppointments()} tintColor="#30bae8" />
                        }
                    />
                </ErrorBoundary>
            )}
        </SafeAreaView>
    );
};
