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
import { tokens } from '../../../design-system/tokens';

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
            statusColor={item.status === 'Active' ? tokens.colors.status.success : tokens.colors.text.disabled.light}
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
        <View className="items-center justify-center py-20 gap-4">
            <MaterialCommunityIcons name="account-search-outline" size={64} color={isDark ? tokens.colors.text.disabled.dark : tokens.colors.text.disabled.light} />
            <Text className="text-text-secondary dark:text-text-secondary-dark text-lg font-primary">No mentees found</Text>
        </View>
    ), [isDark]);

    return (
        <View key={isDark ? 'dark' : 'light'} className="flex-1 bg-background dark:bg-background-dark">
            <SafeAreaView className="flex-1" edges={['top']}>
                <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />
                <View className="px-6 py-4 flex-row justify-between items-center bg-surface dark:bg-surface-dark border-b border-border dark:border-border-dark h-[72px]">
                    <TouchableOpacity onPress={() => navigation.goBack()} className="w-10 h-10 items-center justify-center rounded-full bg-background dark:bg-background-dark">
                        <MaterialCommunityIcons name="arrow-left" size={24} color={isDark ? tokens.colors.text.primary.dark : tokens.colors.text.primary.light} />
                    </TouchableOpacity>
                    <Text className="text-xl font-bold text-text-primary dark:text-text-primary-dark font-primary">My Mentees</Text>
                    <TouchableOpacity className="w-10 h-10 items-center justify-center rounded-full bg-background dark:bg-background-dark">
                        <MaterialCommunityIcons name="magnify" size={24} color={isDark ? tokens.colors.text.primary.dark : tokens.colors.text.primary.light} />
                    </TouchableOpacity>
                </View>

                {error && (
                    <ErrorBanner
                        message={error}
                        visible={!!error}
                        onRetry={refetch}
                    />
                )}

                <View className="px-6 py-4 gap-4">
                    <View className="bg-surface dark:bg-surface-elevated-dark p-3 rounded-xl flex-row items-center border border-border dark:border-border-dark">
                        <MaterialCommunityIcons name="magnify" size={20} color={tokens.colors.text.secondary.light} />
                        <TextInput
                            className="flex-1 ml-2 text-text-primary dark:text-text-primary-dark font-primary text-base"
                            placeholder="Search mentees..."
                            placeholderTextColor={tokens.colors.text.disabled.light}
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                        />
                    </View>

                    <View className="flex-row gap-2">
                        <FilterChip label="All" isSelected={activeFilter === 'All'} onPress={() => setActiveFilter('All')} />
                        <FilterChip label="Active" isSelected={activeFilter === 'Active'} onPress={() => setActiveFilter('Active')} />
                        <FilterChip label="Pending" isSelected={activeFilter === 'Pending'} onPress={() => setActiveFilter('Pending')} />
                    </View>

                    <View className="flex-row justify-between items-center mt-2">
                        <Text className="text-text-secondary dark:text-text-secondary-dark text-sm font-semibold font-primary">Showing {filteredMentees.length} mentees</Text>
                        <TouchableOpacity className="flex-row items-center bg-surface dark:bg-surface-dark px-3 py-1.5 rounded-full border border-border dark:border-border-dark">
                            <Text className="text-text-secondary dark:text-text-secondary-dark text-xs mr-1 font-medium font-primary">Sort by: Recent</Text>
                            <MaterialCommunityIcons name="chevron-down" size={14} color={tokens.colors.text.secondary.light} />
                        </TouchableOpacity>
                    </View>
                </View>

                {loading ? (
                    <View className="px-6 flex-1 pt-4">
                        <ListSkeleton count={5} />
                    </View>
                ) : (
                    <ErrorBoundary>
                        <FlatList
                            data={filteredMentees}
                            keyExtractor={(item, index) => `${item?.mentee_id || 'mentee'}-${index}`}
                            renderItem={renderMenteeItem}
                            contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 32, gap: 16 }}
                            ListEmptyComponent={renderEmpty}
                        />
                    </ErrorBoundary>
                )}
            </SafeAreaView>
        </View>
    );
}
