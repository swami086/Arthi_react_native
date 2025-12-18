import React, { useState } from 'react';
import { View, Text, SectionList, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppointments } from '../../appointments/hooks/useAppointments';
import { SessionCard } from '../../../components/SessionCard';
import { FilterChip } from '../../../components/FilterChip';
import { ErrorBanner } from '../../../components/ErrorBanner';
import { ListSkeleton } from '../../../components/LoadingSkeleton';

import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../../navigation/types';
import { AddSessionModal } from './AddSessionModal';
import Icon from 'react-native-vector-icons/Feather';
import { useAuth } from '../../auth/context/AuthContext';
import { TouchableOpacity } from 'react-native';

export default function MentorSessionsScreen() {
    const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
    const { user } = useAuth();
    const { appointments, loading, error, refetch } = useAppointments();
    const [filter, setFilter] = useState('All');
    const [showAddModal, setShowAddModal] = useState(false);

    const sections = [
        {
            title: 'Upcoming',
            data: appointments.filter(a => a.status === 'confirmed' && new Date(a.start_time) > new Date()),
        },
        {
            title: 'Pending',
            data: appointments.filter(a => a.status === 'pending'),
        },
        {
            title: 'Past',
            data: appointments.filter(a => a.status === 'completed' || a.status === 'cancelled' || (new Date(a.start_time) < new Date() && a.status === 'confirmed')),
        }
    ];

    return (
        <View className="flex-1 bg-gray-50">
            <SafeAreaView className="flex-1" edges={['top']}>
                <StatusBar barStyle="dark-content" />
                <View className="px-6 py-4 bg-white border-b border-gray-100">
                    <Text className="text-xl font-bold text-gray-900 mb-4">Sessions</Text>
                    <View className="flex-row gap-2">
                        <FilterChip label="All" isSelected={filter === 'All'} onPress={() => setFilter('All')} />
                        <FilterChip label="Upcoming" isSelected={filter === 'Upcoming'} onPress={() => setFilter('Upcoming')} />
                    </View>
                </View>

                {error && (
                    <ErrorBanner
                        message={error}
                        visible={!!error}
                        onRetry={refetch}
                    />
                )}

                {loading ? (
                    <View className="px-6 flex-1 mt-4">
                        <ListSkeleton count={4} />
                    </View>
                ) : (
                    appointments.length === 0 ? (
                        <View className="flex-1 items-center justify-center mt-20">
                            <Text className="text-gray-400 text-lg">No sessions found</Text>
                        </View>
                    ) : (
                        <SectionList
                            sections={sections}
                            keyExtractor={item => item.id}
                            renderSectionHeader={({ section: { title, data } }) => (
                                data.length > 0 ? <Text className="px-6 py-2 text-gray-500 font-bold bg-gray-50">{title}</Text> : null
                            )}
                            renderItem={({ item }) => (
                                <View className="px-6 py-1">
                                    <SessionCard
                                        title="Session"
                                        date={new Date(item.start_time).toLocaleDateString()}
                                        duration={`${Math.round((new Date(item.end_time).getTime() - new Date(item.start_time).getTime()) / 60000)} min`}
                                        status={item.status}
                                        menteeName="Mentee"
                                        meetingLink={item.meeting_link}
                                        feedback={item.feedback}
                                        onPress={() => navigation.navigate('SessionDetail', { appointmentId: item.id })}
                                    />
                                </View>
                            )}
                            stickySectionHeadersEnabled={false}
                            contentContainerStyle={{ paddingBottom: 20 }}
                        />
                    )
                )}
            </SafeAreaView>

            <TouchableOpacity
                className="absolute bottom-6 right-6 bg-indigo-600 w-14 h-14 rounded-full items-center justify-center shadow-lg z-50 pointer-events-auto"
                style={{ elevation: 5 }}
                onPress={() => setShowAddModal(true)}
            >
                <Icon name="plus" size={24} color="white" />
            </TouchableOpacity>

            <AddSessionModal
                visible={showAddModal}
                onClose={() => setShowAddModal(false)}
                onSuccess={() => {
                    refetch();
                }}
                mentorId={user?.id || ''}
            />
        </View >
    );
}
