import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StatusBar, Image } from 'react-native';
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
import { tokens } from '../../../design-system/tokens';

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

    const handleFindMentee = () => navigation.navigate('MenteeDiscovery', { autoOpenAddModal: true });
    const handleAddSession = () => navigation.navigate('Sessions');
    const handleMessage = () => navigation.navigate('Mentees');
    const handleResources = () => navigation.navigate('Resources');
    const handleNotes = () => navigation.navigate('Mentees');
    const handleEarnings = () => navigation.navigate('MentorPaymentDashboard');

    return (
        <View className="flex-1 bg-background dark:bg-background-dark">
            <SafeAreaView className="flex-1" edges={['top']}>
                <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />

                <View className="px-6 py-4 flex-row justify-between items-center bg-surface dark:bg-surface-dark border-b border-border dark:border-border-dark h-[72px]">
                    <View>
                        <Text className="text-text-secondary dark:text-text-secondary-dark text-xs font-bold uppercase tracking-wider font-primary">Mentor Portal</Text>
                        <Text className="text-xl font-bold text-text-primary dark:text-text-primary-dark font-primary mt-0.5">
                            Hello, {profile?.full_name?.split(' ')[0] || user?.email?.split('@')[0] || 'Mentor'} 👋
                        </Text>
                    </View>
                    <View className="flex-row gap-2">
                        <TouchableOpacity
                            onPress={() => navigation.navigate('Notifications')}
                            className="w-10 h-10 items-center justify-center rounded-full bg-background dark:bg-background-dark relative"
                        >
                            <MaterialCommunityIcons name="bell-outline" size={20} color={isDark ? tokens.colors.text.primary.dark : tokens.colors.text.primary.light} />
                            <View className="absolute top-2 right-2 w-2 h-2 bg-status-error rounded-full border border-surface dark:border-surface-dark" />
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={() => navigation.navigate('CrisisResources' as any)}
                            className="w-10 h-10 items-center justify-center rounded-full bg-status-error/10 border border-status-error/20"
                        >
                            <MaterialCommunityIcons name="phone-alert" size={20} color={tokens.colors.status.error} />
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={() => navigation.navigate('Settings')}
                            className="w-10 h-10 items-center justify-center rounded-full bg-background dark:bg-background-dark"
                        >
                            <MaterialCommunityIcons name="cog-outline" size={20} color={isDark ? tokens.colors.text.primary.dark : tokens.colors.text.primary.light} />
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
                    <ScrollView className="flex-1 p-6" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 32 }}>
                        <View className="flex-row mb-6">
                            <StatCard
                                title="Total Mentees"
                                value={stats?.total_mentees || 0}
                                icon="account-group"
                                iconColor={tokens.colors.primary.light}
                                growth="+2"
                                growthLabel="This month"
                            />
                            <View className="w-4" />
                            <StatCard
                                title="Sessions Done"
                                value={stats?.total_sessions || 0}
                                icon="calendar-check"
                                iconColor={tokens.colors.status.success}
                            />
                        </View>

                        <View className="mb-8">
                            <Text className="text-lg font-bold text-text-primary dark:text-text-primary-dark mb-4 font-primary">Quick Actions</Text>
                            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="-ml-1 pl-1" contentContainerStyle={{ gap: 4 }}>
                                <QuickActionButton icon="account-plus" label="Add Mentee" color={tokens.colors.primary.light} onPress={handleFindMentee} />
                                <QuickActionButton icon="calendar-plus" label="Add Session" color={tokens.colors.secondary.light} onPress={handleAddSession} />
                                <QuickActionButton icon="cash-multiple" label="Earnings" color={tokens.colors.status.success} onPress={handleEarnings} />
                                <QuickActionButton icon="message-text" label="Message" color={tokens.colors.status.warning} onPress={handleMessage} />
                                <QuickActionButton icon="notebook" label="Notes" color={tokens.colors.status.success} onPress={handleNotes} />
                                <QuickActionButton icon="book-open-page-variant" label="Resources" color={tokens.colors.accent.pink} onPress={handleResources} />
                            </ScrollView>
                        </View>

                        <View className="mb-8">
                            <Text className="text-lg font-bold text-text-primary dark:text-text-primary-dark mb-4 font-primary">Up Next</Text>
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
                                <View className="bg-surface dark:bg-surface-elevated-dark p-6 rounded-2xl border border-dashed border-border dark:border-border-dark items-center">
                                    <Text className="text-text-secondary dark:text-text-secondary-dark font-primary">No upcoming sessions</Text>
                                </View>
                            )}
                        </View>

                        <View className="mb-8">
                            <View className="flex-row justify-between items-center mb-4">
                                <Text className="text-lg font-bold text-text-primary dark:text-text-primary-dark font-primary">Recent Messages</Text>
                                <TouchableOpacity onPress={() => navigation.navigate('Mentees')}>
                                    <Text className="text-primary dark:text-primary-light font-bold text-sm font-primary">View All</Text>
                                </TouchableOpacity>
                            </View>
                            {conversations.length > 0 ? conversations.slice(0, 3).map((conv, idx) => (
                                <TouchableOpacity key={idx} className="bg-surface dark:bg-surface-elevated-dark p-4 rounded-xl mb-2 flex-row items-center border border-border dark:border-border-dark shadow-sm">
                                    <View className="w-10 h-10 bg-background dark:bg-background-dark rounded-full mr-3 items-center justify-center overflow-hidden border border-border dark:border-border-dark">
                                        {conv.otherUser?.avatar_url ? (
                                            <Image source={{ uri: conv.otherUser.avatar_url }} className="w-full h-full" />
                                        ) : (
                                            <Text className="font-bold text-text-secondary dark:text-text-secondary-dark font-primary">{conv.otherUser?.full_name?.charAt(0) || 'U'}</Text>
                                        )}
                                    </View>
                                    <View className="flex-1">
                                        <Text className="font-bold text-text-primary dark:text-text-primary-dark font-primary block">{conv.otherUser?.full_name || 'Unknown'}</Text>
                                        <Text className="text-text-secondary dark:text-text-secondary-dark text-xs font-primary mt-0.5" numberOfLines={1}>{conv.lastMessage?.content}</Text>
                                    </View>
                                </TouchableOpacity>
                            )) : (
                                <View className="bg-surface dark:bg-surface-elevated-dark p-6 rounded-2xl border border-dashed border-border dark:border-border-dark items-center">
                                    <Text className="text-text-secondary dark:text-text-secondary-dark font-primary">No recent messages</Text>
                                </View>
                            )}
                        </View>
                    </ScrollView>
                )}
            </SafeAreaView>
        </View>
    );
}
