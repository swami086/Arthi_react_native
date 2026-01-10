import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { MotiView } from 'moti';
import { useAuth } from '../../auth/hooks/useAuth';
import { useAdminStats } from '../hooks/useAdminStats';

export const AdminDashboardScreen = () => {
    const { user, profile } = useAuth();
    const { stats, loading, refetch } = useAdminStats();
    const navigation = useNavigation<any>();

    const StatCard = ({ title, value, icon, color, onPress }: any) => (
        <TouchableOpacity
            onPress={onPress}
            className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm flex-1 mx-1 min-w-[150px] mb-3"
        >
            <View className="flex-row justify-between items-start mb-2">
                <View className={`p-2 rounded-lg ${color} bg-opacity-10`}>
                    <Icon name={icon} size={24} color="#4e8597" />
                </View>
                {/* <Text className="text-xs text-gray-400 font-medium badge">New</Text> */}
            </View>
            <Text className="text-2xl font-bold text-text-main-light dark:text-white mb-1">{value || 0}</Text>
            <Text className="text-sm text-text-sub-light dark:text-gray-400 font-medium">{title}</Text>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView className="flex-1 bg-background-light dark:bg-background-dark">
            <View className="px-6 py-4 flex-row justify-between items-center bg-white dark:bg-gray-800 shadow-sm z-10">
                <View>
                    <Text className="text-text-sub-light dark:text-gray-400 text-xs font-bold uppercase tracking-wider">Admin Portal</Text>
                    <Text className="text-xl font-bold text-text-main-light dark:text-white">Dashboard</Text>
                </View>
                <TouchableOpacity className="bg-gray-100 dark:bg-gray-700 p-2 rounded-full">
                    <Icon name="bell-outline" size={20} color="#666" />
                </TouchableOpacity>
            </View>


            <ScrollView
                contentContainerStyle={{ padding: 24 }}
                refreshControl={<RefreshControl refreshing={loading} onRefresh={refetch} />}
            >
                {/* Welcome Section */}
                <MotiView
                    from={{ opacity: 0, translateY: -20 }}
                    animate={{ opacity: 1, translateY: 0 }}
                    transition={{ type: 'timing', duration: 500 }}
                >
                    <View className="mb-6">
                        <Text className="text-lg text-text-main-light dark:text-white font-semibold">
                            Hello, {profile?.full_name?.split(' ')[0] || 'Admin'} 👋
                        </Text>
                        <Text className="text-text-sub-light dark:text-gray-400">
                            Here's what's happening today.
                        </Text>
                    </View>
                </MotiView>

                {/* Stats Grid */}
                <View className="flex-row flex-wrap -mx-1 mb-2">
                    <MotiView
                        from={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ type: 'timing', duration: 400, delay: 100 }}
                        style={{ width: '50%' }}
                    >
                        <StatCard
                            title="Pending Approvals"
                            value={stats?.pending_approvals}
                            icon="account-clock"
                            color="bg-yellow-100"
                            onPress={() => navigation.navigate('PendingApprovals')}
                        />
                    </MotiView>
                    <MotiView
                        from={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ type: 'timing', duration: 400, delay: 200 }}
                        style={{ width: '50%' }}
                    >
                        <StatCard
                            title="Active Therapists"
                            value={stats?.active_mentors}
                            icon="account-tie"
                            color="bg-purple-100"
                            onPress={() => navigation.navigate('Therapists')}
                        />
                    </MotiView>
                    <MotiView
                        from={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ type: 'timing', duration: 400, delay: 300 }}
                        style={{ width: '50%' }}
                    >
                        <StatCard
                            title="Total Patients"
                            value={stats?.total_mentees}
                            icon="account-school"
                            color="bg-green-100"
                            onPress={() => navigation.navigate('Patients')}
                        />
                    </MotiView>
                    <MotiView
                        from={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ type: 'timing', duration: 400, delay: 400 }}
                        style={{ width: '50%' }}
                    >
                        <StatCard
                            title="Admins"
                            value={stats?.total_admins}
                            icon="shield-account"
                            color="bg-purple-100"
                            onPress={() => navigation.navigate('Admins')}
                        />
                    </MotiView>
                </View>

                {/* Quick Actions */}
                <MotiView
                    from={{ opacity: 0, translateY: 20 }}
                    animate={{ opacity: 1, translateY: 0 }}
                    transition={{ type: 'timing', duration: 500, delay: 500 }}
                >
                    <Text className="text-lg font-bold text-text-main-light dark:text-white mb-4 mt-2">Quick Actions</Text>
                    <View className="gap-3">
                        <TouchableOpacity
                            className="flex-row items-center bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm"
                            onPress={() => navigation.navigate('PendingApprovals')}
                        >
                            <View className="h-10 w-10 bg-primary/10 rounded-full items-center justify-center mr-4">
                                <Icon name="file-document-edit-outline" size={20} color="#4e8597" />
                            </View>
                            <View className="flex-1">
                                <Text className="text-text-main-light dark:text-white font-bold">Review Applications</Text>
                                <Text className="text-xs text-text-sub-light dark:text-gray-400">Check pending mentor requests</Text>
                            </View>
                            <Icon name="chevron-right" size={20} color="#ccc" />
                        </TouchableOpacity>

                        <TouchableOpacity
                            className="flex-row items-center bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm"
                            onPress={() => navigation.navigate('CreateAdmin')}
                        >
                            <View className="h-10 w-10 bg-purple-100 dark:bg-purple-900/20 rounded-full items-center justify-center mr-4">
                                <Icon name="account-plus" size={20} color="#8b5cf6" />
                            </View>
                            <View className="flex-1">
                                <Text className="text-text-main-light dark:text-white font-bold">Add New Admin</Text>
                                <Text className="text-xs text-text-sub-light dark:text-gray-400">Grant admin access to team</Text>
                            </View>
                            <Icon name="chevron-right" size={20} color="#ccc" />
                        </TouchableOpacity>
                    </View>
                </MotiView>
            </ScrollView>
        </SafeAreaView>
    );
};
