import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useColorScheme } from '../../../hooks/useColorScheme';
import { useAuth } from '../../auth/hooks/useAuth';
import { useMentorStats } from '../hooks/useMentorStats';
import { useAppointments } from '../../appointments/hooks/useAppointments';
import { useMessages } from '../../messages/hooks/useMessages';
import { useMenteeList } from '../hooks/useMenteeList';
import { StatCard } from '../../../components/StatCard';
import { QuickActionButton } from '../../../components/QuickActionButton';
import { SessionCard } from '../../../components/SessionCard';
import { MentorTabParamList } from '../../../navigation/types';
import { ErrorBanner } from '../../../components/ErrorBanner';
import { CardSkeleton, LoadingSkeleton } from '../../../components/LoadingSkeleton';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { CompositeNavigationProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../../navigation/types';

type MentorHomeNavigationProp = CompositeNavigationProp<
    BottomTabNavigationProp<MentorTabParamList, 'Home'>,
    StackNavigationProp<RootStackParamList>
>;

export default function MentorHomeScreen() {
    const { user, profile } = useAuth();
    const navigation = useNavigation<MentorHomeNavigationProp>();
    const { isDark } = useColorScheme();

    const { stats, loading: statsLoading, error: statsError, refetch: refetchStats } = useMentorStats();
    const { appointments, loading: apptLoading, error: apptError, refetch: refetchAppts } = useAppointments();
    const { conversations, loading: msgLoading, error: msgError, refetch: refetchMsgs } = useMessages();
    const { mentees, loading: menteesLoading, error: menteesError, refetch: refetchMentees } = useMenteeList();

    const loading = statsLoading || apptLoading || msgLoading || menteesLoading;
    const error = statsError || apptError || msgError || menteesError;

    const handleRetry = () => {
        refetchStats();
        refetchAppts();
        refetchMsgs();
        refetchMentees();
    };

    const upcomingAppointment = appointments
        .filter(appt => appt.status === 'confirmed' && new Date(appt.start_time) > new Date())
        .sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime())[0];

    const upcomingMenteeName = upcomingAppointment
        ? mentees.find(m => m.mentee_id === upcomingAppointment.mentee_id)?.full_name || 'Mentee'
        : 'Mentee';

    const upcomingMenteeAvatar = upcomingAppointment
        ? mentees.find(m => m.mentee_id === upcomingAppointment.mentee_id)?.avatar_url
        : null;

    const handleFindMentee = () => navigation.navigate('MenteeDiscovery');
    const handleAddSession = () => navigation.navigate('Sessions');
    const handleMessage = () => navigation.navigate('Mentees');
    const handleResources = () => alert('Resources feature coming soon!');
    const handleNotes = () => navigation.navigate('Mentees');

    return (
        <View className="flex-1 bg-gray-50 dark:bg-background-dark">
            <SafeAreaView className="flex-1" edges={['top']}>
                <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />

                <View className="px-6 py-4 flex-row justify-between items-center bg-white dark:bg-gray-800 shadow-sm border-b border-gray-100 dark:border-gray-700">
                    <View>
                        <Text className="text-text-sub-light dark:text-gray-400 text-xs font-bold uppercase tracking-wider">Mentor Portal</Text>
                        <Text className="text-xl font-bold text-text-main-light dark:text-white">
                            Hello, {profile?.full_name?.split(' ')[0] || user?.email?.split('@')[0] || 'Mentor'} 👋
                        </Text>
                    </View>
                    <View className="flex-row gap-2">
                        <TouchableOpacity className="p-2 bg-gray-50 dark:bg-gray-700 rounded-full relative">
                            <MaterialCommunityIcons name="bell-outline" size={20} color={isDark ? "#fff" : "#666"} />
                            <View className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border border-white dark:border-gray-800" />
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={() => navigation.navigate('Settings')}
                            className="p-2 bg-gray-50 dark:bg-gray-700 rounded-full"
                        >
                            <MaterialCommunityIcons name="cog-outline" size={20} color={isDark ? "#fff" : "#666"} />
                        </TouchableOpacity>
                    </View>
                </View>

                {error && (
                    <ErrorBanner
                        message={error}
                        visible={!!error}
                        onRetry={handleRetry}
                    />
                )}

                {loading ? (
                    <View className="flex-1 p-6">
                        <View className="flex-row mb-6">
                            <View className="flex-1 mr-2"><LoadingSkeleton height={100} borderRadius={16} /></View>
                            <View className="flex-1 ml-2"><LoadingSkeleton height={100} borderRadius={16} /></View>
                        </View>
                        <LoadingSkeleton width="100%" height={200} borderRadius={16} style={{ marginBottom: 24 }} />
                        <CardSkeleton />
                        <CardSkeleton />
                    </View>
                ) : (
                    <ScrollView className="flex-1 p-6" showsVerticalScrollIndicator={false}>
                        <View className="flex-row mb-6">
                            <StatCard
                                title="Total Mentees"
                                value={stats?.total_mentees || 0}
                                icon="account-group"
                                iconColor={isDark ? "#38BDF8" : "#30bae8"}
                                growth="+2"
                                growthLabel="This month"
                            />
                            <View className="w-4" />
                            <StatCard
                                title="Sessions Done"
                                value={stats?.total_sessions || 0}
                                icon="calendar-check"
                                iconColor={isDark ? "#34D399" : "#10B981"}
                            />
                        </View>

                        <View className="mb-8">
                            <Text className="text-lg font-bold text-gray-900 dark:text-white mb-4">Quick Actions</Text>
                            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="pl-1">
                                <QuickActionButton icon="account-plus" label="Add Mentee" color={isDark ? "#0EA5E9" : "#30bae8"} onPress={handleFindMentee} />
                                <QuickActionButton icon="calendar-plus" label="Add Session" color={isDark ? "#7C3AED" : "#8B5CF6"} onPress={handleAddSession} />
                                <QuickActionButton icon="message-text" label="Message" color={isDark ? "#D97706" : "#F59E0B"} onPress={handleMessage} />
                                <QuickActionButton icon="notebook" label="Notes" color={isDark ? "#059669" : "#10B981"} onPress={handleNotes} />
                                <QuickActionButton icon="book-open-page-variant" label="Resources" color={isDark ? "#DB2777" : "#EC4899"} onPress={handleResources} />
                            </ScrollView>
                        </View>

                        <View className="mb-8">
                            <Text className="text-lg font-bold text-gray-900 dark:text-white mb-4">Up Next</Text>
                            {upcomingAppointment ? (
                                <SessionCard
                                    title="Mentoring Session"
                                    date={new Date(upcomingAppointment.start_time).toLocaleDateString()}
                                    duration={new Date(upcomingAppointment.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    status={upcomingAppointment.status}
                                    menteeName={upcomingMenteeName}
                                    menteeAvatar={upcomingMenteeAvatar}
                                    meetingLink={upcomingAppointment.meeting_link}
                                    feedback={upcomingAppointment.feedback}
                                    onPress={() => navigation.navigate('SessionDetail', { appointmentId: upcomingAppointment.id })}
                                />
                            ) : (
                                <View className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-dashed border-gray-300 dark:border-gray-700 items-center">
                                    <Text className="text-gray-400 dark:text-gray-500">No upcoming sessions</Text>
                                </View>
                            )}
                        </View>

                        <View className="mb-8">
                            <View className="flex-row justify-between items-center mb-4">
                                <Text className="text-lg font-bold text-gray-900 dark:text-white">Recent Messages</Text>
                                <TouchableOpacity onPress={() => navigation.navigate('Mentees')}>
                                    <Text className="text-primary font-bold text-sm">View All</Text>
                                </TouchableOpacity>
                            </View>
                            {conversations.length > 0 ? conversations.slice(0, 3).map((conv, idx) => (
                                <TouchableOpacity key={idx} className="bg-white dark:bg-gray-800 p-4 rounded-xl mb-2 flex-row items-center border border-gray-100 dark:border-gray-700">
                                    <View className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full mr-3 items-center justify-center overflow-hidden">
                                        {conv.otherUser?.avatar_url ? (
                                            // simple image if avatar
                                            <Text>Img</Text>
                                        ) : (
                                            <Text className="font-bold text-gray-500 dark:text-gray-400">{conv.otherUser?.full_name?.charAt(0) || 'U'}</Text>
                                        )}
                                    </View>
                                    <View className="flex-1">
                                        <Text className="font-bold text-gray-900 dark:text-white">{conv.otherUser?.full_name || 'Unknown'}</Text>
                                        <Text className="text-gray-500 dark:text-gray-400 text-xs" numberOfLines={1}>{conv.lastMessage?.content}</Text>
                                    </View>
                                </TouchableOpacity>
                            )) : (
                                <Text className="text-gray-400 dark:text-gray-500">No recent messages</Text>
                            )}
                        </View>
                    </ScrollView>
                )}
            </SafeAreaView>
        </View>
    );
}
