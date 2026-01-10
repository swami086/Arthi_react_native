import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, ActivityIndicator, TouchableOpacity, Image, ScrollView, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';

import { useAppointments, AppointmentWithDetails } from '../hooks/useAppointments';
import { useColorScheme } from '../../../hooks/useColorScheme';
import { updateAppointmentStatus } from '../../../api/appointmentService';
import { reportError, reportInfo, startSpan, endSpan } from '../../../services/rollbar';
import { Alert } from 'react-native';

export const AppointmentsScreen = ({ navigation }: { navigation: any }) => {
    // 1. Restore actual hooks
    const { appointments, loading, refetch: refreshAppointments } = useAppointments();
    const { isDark } = useColorScheme();
    const [activeTab, setActiveTab] = React.useState<'upcoming' | 'past'>('upcoming');
    // 2. Filter logic (Restored)
    const filteredAppointments = React.useMemo(() => {
        try {
            const now = new Date();
            const validAppointments = (appointments || []).filter(a => {
                const s = a.start_time ? new Date(a.start_time).getTime() : NaN;
                return !isNaN(s);
            });

            if (activeTab === 'upcoming') {
                return validAppointments.filter(a => {
                    const end = a.end_time ? new Date(a.end_time) : new Date(a.start_time!);
                    return end >= now && a.status !== 'cancelled';
                }).sort((a, b) => new Date(a.start_time!).getTime() - new Date(b.start_time!).getTime());
            } else {
                return validAppointments.filter(a => {
                    const end = a.end_time ? new Date(a.end_time) : new Date(a.start_time!);
                    return end < now || a.status === 'cancelled';
                }).sort((a, b) => new Date(b.start_time!).getTime() - new Date(a.start_time!).getTime());
            }
        } catch (e) {
            console.error('[AppointmentsScreen] Error filtering appointments:', e);
            return [];
        }
    }, [appointments, activeTab]);

    const [processingId, setProcessingId] = React.useState<string | null>(null);

    const handleStatusUpdate = async (appointmentId: string, status: 'confirmed' | 'cancelled') => {
        try {
            setProcessingId(appointmentId);
            reportInfo(`User clicked ${status === 'confirmed' ? 'Confirm' : 'Decline'}`, 'AppointmentsScreen:handleStatusUpdate', { appointmentId, status });

            await updateAppointmentStatus(appointmentId, status);
            await refreshAppointments();

            Alert.alert(
                status === 'confirmed' ? 'Session Confirmed' : 'Session Declined',
                `You have successfully ${status === 'confirmed' ? 'confirmed' : 'declined'} the session.`
            );
        } catch (error) {
            console.error('[AppointmentsScreen] handleStatusUpdate error:', error);
            reportError(error, 'AppointmentsScreen:handleStatusUpdate', { appointmentId, status });
            Alert.alert('Error', 'Failed to update session status. Please try again.');
        } finally {
            setProcessingId(null);
        }
    };

    const renderUpcomingCard = ({ item }: { item: AppointmentWithDetails }) => {
        const startTime = item.start_time ? new Date(item.start_time) : new Date();
        const endTime = item.end_time ? new Date(item.end_time) : new Date();

        let borderColor = '#30bae8';
        let badgeColor = 'bg-primary/10 text-primary';
        let badgeText = 'Scheduled';

        if (item.status === 'pending') {
            borderColor = '#f59e0b';
            badgeColor = 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400';
            badgeText = 'Pending';
        } else if (item.status === 'confirmed') {
            borderColor = '#10b981';
            badgeColor = 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400';
            badgeText = 'Confirmed';
        }

        return (
            <View className="bg-surface-light dark:bg-surface-dark rounded-xl shadow-sm p-5 border-l-4 mb-4"
                style={{ borderLeftColor: borderColor, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 12, elevation: 2 }}>

                <View className="flex-row justify-between items-start mb-4">
                    <View className="flex-row gap-3">
                        <View className="h-12 w-12 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700">
                            {item.mentor?.avatar_url ? (
                                <Image source={{ uri: item.mentor.avatar_url }} className="h-full w-full" />
                            ) : (
                                <View className="h-full w-full items-center justify-center bg-gray-300 dark:bg-gray-600">
                                    <MaterialIcons name="person" size={24} color={isDark ? "#9ba8ae" : "#666"} />
                                </View>
                            )}
                        </View>
                        <View>
                            <Text className="text-text-main-light dark:text-text-main-dark font-bold text-base leading-tight">
                                {item.mentor?.full_name || "Mentor Name"}
                            </Text>
                            <View className="flex-row items-center mt-1">
                                <View className={`px-2 py-0.5 rounded-full mr-2 ${item.session_type === 'public' ? 'bg-indigo-100 dark:bg-indigo-900/30' : 'bg-gray-100 dark:bg-gray-700'}`}>
                                    <Text className={`text-[9px] font-bold uppercase ${item.session_type === 'public' ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-500 dark:text-gray-400'}`}>
                                        {item.session_type === 'public' ? 'Broadcast' : 'Private'}
                                    </Text>
                                </View>
                                <Text className="text-text-sub-light dark:text-text-sub-dark text-xs truncate max-w-[150px]">
                                    {item.title || 'General Session'}
                                </Text>
                            </View>
                        </View>
                    </View>
                </View>

                <View className="flex-row items-center gap-2 bg-background-light dark:bg-background-dark/50 p-3 rounded-lg mb-4">
                    <MaterialIcons name="schedule" size={20} color="#30bae8" />
                    <Text className="font-medium text-text-main-light dark:text-text-main-dark">
                        {startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {endTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </Text>
                </View>

                <View className="flex-row gap-3">
                    {item.status === 'pending' ? (
                        <>
                            <TouchableOpacity
                                className="flex-1 items-center justify-center py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-transparent"
                                onPress={() => handleStatusUpdate(item.id, 'cancelled')}
                                disabled={!!processingId}
                            >
                                <Text className="text-text-sub-light dark:text-text-sub-dark text-sm font-semibold">Decline</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                className="flex-1 items-center justify-center py-2.5 rounded-lg bg-primary"
                                onPress={() => handleStatusUpdate(item.id, 'confirmed')}
                                disabled={!!processingId}
                            >
                                <Text className="text-white text-sm font-semibold">Confirm</Text>
                            </TouchableOpacity>
                        </>
                    ) : (
                        <TouchableOpacity
                            className="flex-1 flex-row items-center justify-center gap-2 py-2.5 rounded-lg bg-primary"
                            onPress={() => navigation.navigate('VideoCallWaitingRoom', { appointmentId: item.id })}
                        >
                            <MaterialIcons name="videocam" size={18} color="white" />
                            <Text className="text-white text-sm font-semibold">Join Session</Text>
                        </TouchableOpacity>
                    )}
                </View>
            </View>
        );
    };

    const renderPastCard = ({ item }: { item: AppointmentWithDetails }) => {
        const startTime = item.start_time ? new Date(item.start_time) : new Date();
        return (
            <View className="bg-surface-light dark:bg-surface-dark rounded-xl shadow-sm p-4 mb-3 border border-gray-100 dark:border-gray-700">
                <View className="flex-row justify-between mb-3">
                    <View className="flex-row gap-3 flex-1">
                        <View className="h-10 w-10 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700">
                            {item.mentor?.avatar_url ? (
                                <Image source={{ uri: item.mentor.avatar_url }} className="h-full w-full" />
                            ) : (
                                <View className="h-full w-full items-center justify-center bg-gray-300 dark:bg-gray-600">
                                    <MaterialIcons name="person" size={20} color={isDark ? "#9ba8ae" : "#666"} />
                                </View>
                            )}
                        </View>
                        <View className="flex-1">
                            <Text className="text-text-main-light dark:text-text-main-dark font-semibold text-base mb-0.5">
                                {item.mentor?.full_name || "Mentor Name"}
                            </Text>
                            <Text className="text-text-sub-light dark:text-text-sub-dark text-xs">
                                {startTime.toLocaleDateString()} • {startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </Text>
                        </View>
                    </View>
                </View>

                <View className="flex-row gap-3 border-t border-gray-100 dark:border-gray-700 pt-3 mt-2">
                    <TouchableOpacity
                        className="flex-1 flex-row items-center justify-center gap-1.5 py-2 rounded-lg bg-gray-50 dark:bg-gray-800"
                        onPress={() => navigation.navigate('SessionDetail', { appointmentId: item.id })}
                    >
                        <MaterialIcons name="visibility" size={16} color={isDark ? "#e0e6e8" : "#475569"} />
                        <Text className="text-text-main-light dark:text-text-main-dark text-sm font-medium">View Details</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    };

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: isDark ? '#121212' : 'white' }} edges={['top']}>
            <View style={{ flex: 1 }}>
                <View style={{ padding: 16, borderBottomWidth: 1, borderBottomColor: isDark ? '#333' : '#eee' }}>
                    <Text style={{ fontSize: 18, fontWeight: 'bold', textAlign: 'center', color: isDark ? 'white' : 'black' }}>
                        Session Management
                    </Text>
                </View>

                <View style={{ flexDirection: 'row', padding: 16, backgroundColor: isDark ? '#121212' : 'white' }}>
                    <View style={{ flexDirection: 'row', flex: 1, backgroundColor: isDark ? '#222' : '#eee', borderRadius: 12, padding: 4 }}>
                        <TouchableOpacity
                            onPress={() => setActiveTab('upcoming')}
                            style={{ flex: 1, paddingVertical: 10, backgroundColor: activeTab === 'upcoming' ? (isDark ? '#333' : 'white') : 'transparent', borderRadius: 10 }}
                        >
                            <Text style={{ textAlign: 'center', fontWeight: 'bold', color: activeTab === 'upcoming' ? '#30bae8' : '#888' }}>Upcoming</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={() => setActiveTab('past')}
                            style={{ flex: 1, paddingVertical: 10, backgroundColor: activeTab === 'past' ? (isDark ? '#333' : 'white') : 'transparent', borderRadius: 10 }}
                        >
                            <Text style={{ textAlign: 'center', fontWeight: 'bold', color: activeTab === 'past' ? '#30bae8' : '#888' }}>Past History</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {loading ? (
                    <ActivityIndicator style={{ marginTop: 20 }} color="#30bae8" />
                ) : (
                    <FlatList
                        data={filteredAppointments}
                        keyExtractor={(item) => item.id}
                        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 100 }}
                        renderItem={activeTab === 'upcoming' ? renderUpcomingCard : renderPastCard}
                        ListEmptyComponent={
                            <View style={{ padding: 40, alignItems: 'center' }}>
                                <Text style={{ color: isDark ? '#aaa' : '#666' }}>No sessions found.</Text>
                            </View>
                        }
                    />
                )}
            </View>
        </SafeAreaView>
    );
};

export default AppointmentsScreen;
