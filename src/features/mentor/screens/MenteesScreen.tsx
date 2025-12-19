import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, TextInput, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../../navigation/types';
import { MenteeWithActivity } from '../../../api/types';
import { useMenteeList } from '../hooks/useMenteeList';
import { useColorScheme } from '../../../hooks/useColorScheme';
import { MenteeCard } from '../../../components/MenteeCard';
import { FilterChip } from '../../../components/FilterChip';
import { ErrorBanner } from '../../../components/ErrorBanner';
import { ListSkeleton } from '../../../components/LoadingSkeleton';
import { ErrorBoundary } from '../../../components/ErrorBoundary';

type MenteesScreenNavigationProp = StackNavigationProp<RootStackParamList>;

export default function MenteesScreen() {
    const navigation = useNavigation<MenteesScreenNavigationProp>();
    const { mentees, loading, error, refetch } = useMenteeList();
    const { isDark } = useColorScheme();
    const [searchQuery, setSearchQuery] = useState('');
    const [activeFilter, setActiveFilter] = useState('All');

    const filteredMentees = mentees.filter(mentee => {
        const matchesSearch = mentee.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) || false;
        // Simple filter placeholder logic
        if (activeFilter === 'Active' && mentee.last_appointment_status !== 'confirmed') return false;
        if (activeFilter === 'Pending' && mentee.last_appointment_status !== 'pending') return false;
        return matchesSearch;
    });

    const renderMenteeItem = useCallback(({ item }: { item: MenteeWithActivity }) => (
        <MenteeCard
            name={item.full_name || 'Unknown'}
            status={item.status || 'Inactive'}
            statusColor={item.status === 'Active' ? '#10B981' : '#9CA3AF'}
            avatar={item.avatar_url}
            nextInfo={
                item.last_activity_type === 'message'
                    ? `Msg: ${item.last_message_excerpt}`
                    : item.last_appointment_date
                        ? `Session: ${new Date(item.last_appointment_date).toLocaleDateString()}`
                        : 'No recent activity'
            }
            onMessage={() => navigation.navigate('ChatDetail', { otherUserId: item.mentee_id, otherUserName: item.full_name || 'Mentee' })}
            onViewProfile={() => navigation.navigate('MenteeDetail', { menteeId: item.mentee_id, menteeName: item.full_name || 'Mentee', menteeAvatar: item.avatar_url || undefined })}
        />
    ), [navigation]);

    const renderEmpty = useCallback(() => (
        <View className="items-center justify-center py-20">
            <Text className="text-gray-400 text-lg">No mentees found</Text>
        </View>
    ), []);

    return (
        <View className="flex-1 bg-gray-50 dark:bg-background-dark">
            <SafeAreaView className="flex-1" edges={['top']}>
                <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />
                <View className="px-6 py-4 flex-row justify-between items-center bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700">
                    <TouchableOpacity onPress={() => navigation.goBack()}>
                        <MaterialCommunityIcons name="arrow-left" size={24} color={isDark ? "#fff" : "#333"} />
                    </TouchableOpacity>
                    <Text className="text-xl font-bold text-gray-900 dark:text-white">My Mentees</Text>
                    <TouchableOpacity>
                        <MaterialCommunityIcons name="magnify" size={24} color={isDark ? "#fff" : "#333"} />
                    </TouchableOpacity>
                </View>

                {error && (
                    <ErrorBanner
                        message={error}
                        visible={!!error}
                        onRetry={refetch}
                    />
                )}

                <View className="px-6 py-4">
                    <View className="bg-white dark:bg-gray-800 p-3 rounded-xl flex-row items-center border border-gray-200 dark:border-gray-700 mb-4">
                        <MaterialCommunityIcons name="magnify" size={20} color={isDark ? "#9CA3AF" : "#9CA3AF"} />
                        <TextInput
                            className="flex-1 ml-2 text-gray-900 dark:text-white"
                            placeholder="Search mentees..."
                            placeholderTextColor={isDark ? "#6B7280" : "#9CA3AF"}
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                        />
                    </View>

                    <View className="flex-row gap-2 mb-2">
                        <FilterChip label="All" isSelected={activeFilter === 'All'} onPress={() => setActiveFilter('All')} />
                        <FilterChip label="Active" isSelected={activeFilter === 'Active'} onPress={() => setActiveFilter('Active')} />
                        <FilterChip label="Pending" isSelected={activeFilter === 'Pending'} onPress={() => setActiveFilter('Pending')} />
                    </View>

                    <View className="flex-row justify-between items-center mb-2">
                        <Text className="text-gray-500 dark:text-gray-400 text-xs font-bold">Showing {filteredMentees.length} mentees</Text>
                        <TouchableOpacity className="flex-row items-center">
                            <Text className="text-gray-500 dark:text-gray-400 text-xs mr-1">Sort by: Recent</Text>
                            <MaterialCommunityIcons name="chevron-down" size={14} color="#6B7280" />
                        </TouchableOpacity>
                    </View>
                </View>

                {loading ? (
                    <View className="px-6 flex-1">
                        <ListSkeleton count={5} />
                    </View>
                ) : (
                    <ErrorBoundary>
                        <FlatList
                            data={filteredMentees}
                            keyExtractor={(item, index) => `${item?.mentee_id || 'mentee'}-${index}`}
                            renderItem={renderMenteeItem}
                            contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 20 }}
                            ListEmptyComponent={renderEmpty}
                        />
                    </ErrorBoundary>
                )}
            </SafeAreaView>
        </View>
    );
}
