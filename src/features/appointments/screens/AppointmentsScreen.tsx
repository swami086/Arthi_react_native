import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, ActivityIndicator, TouchableOpacity, Image, ScrollView, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';
import { MotiView } from 'moti';

import { useAppointments, AppointmentWithDetails } from '../hooks/useAppointments';
import { useColorScheme } from '../../../hooks/useColorScheme';
// import { Appointment } from '../../../api/types'; // No longer needed directly

export const AppointmentsScreen = () => {
    const { appointments, loading, refetch: refreshAppointments } = useAppointments();
    const navigation = useNavigation<any>();
    const { isDark } = useColorScheme();
    const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>('upcoming');

    // Filter logic
    const filteredAppointments = React.useMemo(() => {
        const now = new Date();
        if (activeTab === 'upcoming') {
            return appointments.filter(a => a.start_time && a.end_time && !isNaN(new Date(a.end_time).getTime()) && new Date(a.end_time) >= now)
                .sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime());
        } else {
            return appointments.filter(a => a.start_time && a.end_time && !isNaN(new Date(a.end_time).getTime()) && new Date(a.end_time) < now)
                .sort((a, b) => new Date(b.start_time).getTime() - new Date(a.start_time).getTime());
        }
    }, [appointments, activeTab]);

    const renderAppointmentCard = ({ item, index }: { item: AppointmentWithDetails; index: number }) => {
        const startTime = new Date(item.start_time);
        const endTime = new Date(item.end_time);

        // Determine styling based on status
        let borderColor = '#30bae8'; // default primary
        let badgeColor = 'bg-primary/10 text-primary';
        let badgeText = 'Scheduled';

        if (item.status === 'pending') {
            borderColor = '#f59e0b'; // status-yellow
            badgeColor = 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400';
            badgeText = 'Pending';
        } else if (item.status === 'confirmed') {
            borderColor = '#10b981'; // status-green
            badgeColor = 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400';
            badgeText = 'Confirmed';
        }

        const isToday = new Date().toDateString() === startTime.toDateString();

        return (
            <MotiView
                from={{ opacity: 0, translateY: 20 }}
                animate={{ opacity: 1, translateY: 0 }}
                transition={{ delay: index * 100, type: 'timing', duration: 400 }}
                className={`bg-surface-light dark:bg-surface-dark rounded-xl shadow-sm p-5 border-l-4 mb-4 transition-all`}
                style={{ borderLeftColor: borderColor, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 12, elevation: 2 }}
            >
                <View className="flex-row justify-between items-start mb-4">
                    <View className="flex-row gap-3">
                        <View className="relative">
                            <View className="h-12 w-12 rounded-full overflow-hidden bg-gray-200">
                                {/* Use mentor/mentee avatar or placeholder */}
                                {item.mentor?.avatar_url ? (
                                    <Image source={{ uri: item.mentor.avatar_url }} className="h-full w-full" />
                                ) : (
                                    <View className="h-full w-full items-center justify-center bg-gray-300">
                                        <MaterialIcons name="person" size={24} color="#666" />
                                    </View>
                                )}
                            </View>
                            {item.status === 'confirmed' && (
                                <View className="absolute -bottom-1 -right-1 h-5 w-5 bg-background-light dark:bg-background-dark rounded-full flex items-center justify-center">
                                    <MaterialIcons name="videocam" size={14} color="#30bae8" />
                                </View>
                            )}
                        </View>
                        <View>
                            <Text className="text-text-main-light dark:text-text-main-dark font-bold text-base leading-tight">
                                {item.mentor?.full_name || "Mentor Name"}
                            </Text>
                            <View className="flex-row items-center mt-1">
                                <View className={`px-2 py-0.5 rounded-full mr-2 ${item.session_type === 'public' ? 'bg-indigo-100 dark:bg-indigo-900/30' : 'bg-gray-100 dark:bg-gray-800'}`}>
                                    <Text className={`text-[9px] font-bold uppercase ${item.session_type === 'public' ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-500'}`}>
                                        {item.session_type === 'public' ? 'Broadcast' : 'Private'}
                                    </Text>
                                </View>
                                <Text className="text-text-sub-light dark:text-text-sub-dark text-xs truncate max-w-[150px]">
                                    {item.title || (item.session_type === 'public' ? 'Public Session' : 'General Session')}
                                </Text>
                            </View>
                        </View>
                    </View>
                    <View className={`px-2.5 py-1 rounded-md ${badgeColor.split(' ')[0] || ''} ${badgeColor.split(' ')[1] || ''}`}>
                        <Text className={`text-[10px] font-bold uppercase tracking-wider ${badgeColor.split(' ')[2] || badgeColor.split(' ')[1] || ''}`}>
                            {badgeText}
                        </Text>
                    </View>
                </View>

                {/* Time */}
                <View className="flex-row items-center gap-2 text-sm text-text-main-light dark:text-text-main-dark bg-background-light dark:bg-background-dark/50 p-3 rounded-lg mb-4">
                    <MaterialIcons name="schedule" size={20} color="#30bae8" />
                    <Text className="font-medium text-text-main-light dark:text-text-main-dark">
                        {startTime && !isNaN(startTime.getTime()) ? startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '??'} - {endTime && !isNaN(endTime.getTime()) ? endTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '??'}
                    </Text>
                </View>

                {/* Actions */}
                <View className="flex-row gap-3">
                    {item.status === 'pending' ? (
                        <>
                            <TouchableOpacity className="flex-1 items-center justify-center gap-1 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-transparent active:bg-gray-50 dark:active:bg-gray-800">
                                <Text className="text-text-sub-light dark:text-text-sub-dark text-sm font-semibold">Decline</Text>
                            </TouchableOpacity>
                            <TouchableOpacity className="flex-1 items-center justify-center gap-1 py-2.5 rounded-lg bg-primary active:bg-primary-dark shadow-md shadow-primary/20">
                                <Text className="text-white text-sm font-semibold">Confirm</Text>
                            </TouchableOpacity>
                        </>
                    ) : (
                        <>
                            <TouchableOpacity className="flex items-center justify-center h-11 w-11 rounded-lg border border-gray-200 dark:border-gray-700 active:bg-gray-50 dark:active:bg-gray-800">
                                <MaterialIcons name="calendar-today" size={20} color={isDark ? "#9ba8ae" : "#4f626b"} />
                            </TouchableOpacity>
                            <TouchableOpacity
                                className="flex-1 flex-row items-center justify-center gap-2 py-2.5 rounded-lg bg-primary active:bg-primary-dark shadow-md shadow-primary/20"
                                onPress={() => navigation.navigate('VideoCallWaitingRoom', { appointmentId: item.id })}
                            >
                                <MaterialIcons name="videocam" size={18} color="white" />
                                <Text className="text-white text-sm font-semibold">Join Session</Text>
                            </TouchableOpacity>
                        </>
                    )}
                </View>
            </MotiView>
        );
    };

    return (
        <SafeAreaView className="flex-1 bg-background-light dark:bg-background-dark" edges={['top']}>
            <View className="flex-1 flex-col h-full bg-background-light dark:bg-background-dark">
                {/* Header */}
                <View className="sticky top-0 z-10 bg-background-light/95 dark:bg-background-dark/95 backdrop-blur-sm border-b border-gray-100 dark:border-gray-800">
                    <View className="flex-row items-center p-4 justify-between">
                        <TouchableOpacity onPress={() => navigation.goBack()} className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full active:bg-black/5 dark:active:bg-white/10 transition-colors">
                            <MaterialIcons name="arrow-back" size={24} color={isDark ? "#fff" : "#0e181b"} />
                        </TouchableOpacity>
                        <Text className="text-text-main-light dark:text-text-main-dark text-lg font-bold leading-tight tracking-[-0.015em] flex-1 text-center pr-10">
                            Session Management
                        </Text>
                    </View>

                    {/* Toggle */}
                    <View className="px-4 pb-4">
                        <View className="flex-row p-1 bg-gray-100 dark:bg-surface-dark/50 rounded-xl border border-gray-200 dark:border-gray-700/50">
                            <TouchableOpacity
                                onPress={() => setActiveTab('upcoming')}
                                className={`flex-1 py-2 rounded-lg ${activeTab === 'upcoming' ? 'bg-surface-light dark:bg-surface-dark shadow-sm' : 'bg-transparent'}`}
                            >
                                <Text className={`text-sm text-center ${activeTab === 'upcoming' ? 'font-bold text-primary' : 'font-medium text-text-sub-light dark:text-text-sub-dark'}`}>
                                    Upcoming
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={() => setActiveTab('past')}
                                className={`flex-1 py-2 rounded-lg ${activeTab === 'past' ? 'bg-surface-light dark:bg-surface-dark shadow-sm' : 'bg-transparent'}`}
                            >
                                <Text className={`text-sm text-center ${activeTab === 'past' ? 'font-bold text-primary' : 'font-medium text-text-sub-light dark:text-text-sub-dark'}`}>
                                    Past History
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>

                {/* Content */}
                {loading ? (
                    <View className="flex-1 items-center justify-center">
                        <ActivityIndicator size="large" color="#30bae8" />
                    </View>
                ) : (
                    <FlatList
                        data={filteredAppointments}
                        renderItem={renderAppointmentCard}
                        keyExtractor={(item) => item.id}
                        contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
                        refreshControl={
                            <RefreshControl refreshing={loading} onRefresh={refreshAppointments} tintColor="#30bae8" />
                        }
                        ListHeaderComponent={() => (
                            <View className="flex-row items-center justify-between mb-3">
                                <Text className="text-text-main-light dark:text-text-main-dark font-bold text-base">
                                    {activeTab === 'upcoming' ? 'Today' : 'Past Sessions'}
                                </Text>
                                {activeTab === 'upcoming' && (
                                    <View className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                                        <Text className="text-xs font-semibold text-text-sub-light dark:text-text-sub-dark">
                                            {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                        </Text>
                                    </View>
                                )}
                            </View>
                        )}
                        ListEmptyComponent={
                            <View className="items-center py-10">
                                <Text className="text-text-sub-light dark:text-text-sub-dark font-medium">No sessions found</Text>
                            </View>
                        }
                    />
                )}
            </View>
        </SafeAreaView>
    );
};
