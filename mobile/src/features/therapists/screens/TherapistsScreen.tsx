import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, ScrollView, StatusBar } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTherapists } from '../hooks/useTherapists';
import { TherapistCard } from '../../../components/TherapistCard';
import { FilterChip } from '../../../components/FilterChip';
import { LoadingSkeleton, ListSkeleton } from '../../../components/LoadingSkeleton';
import { Input } from '../../../components/Input';
import { MainTabCompositeProp } from '../../../navigation/types';
import { MotiView } from 'moti';
import { ErrorBoundary } from '../../../components/ErrorBoundary';
import { useColorScheme } from '../../../hooks/useColorScheme';

const FILTERS = ['All Filters', 'Confidence', 'Anxiety', 'Career', 'School Stress'];

import { withRollbarPerformance } from '../../../services/rollbar';

export const TherapistsScreen = () => {
    const { therapists, loading, error } = useTherapists();
    const { isDark } = useColorScheme();
    const navigation = useNavigation<MainTabCompositeProp>();

    // UI State
    const [selectedFilter, setSelectedFilter] = useState('All Filters');
    const [searchQuery, setSearchQuery] = useState('');

    // Filter logic
    const filteredTherapists = therapists.filter(m => {
        if (selectedFilter === 'All Filters') return true;
        return true;
    });

    const renderHeader = () => (
        <MotiView
            from={{ opacity: 0, translateY: -20 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: 'timing', duration: 500 }}
            className="mb-4"
        >
            {/* Top Bar */}
            <View className="flex-row items-center justify-between mb-6">
                <Text className="text-xl font-bold text-gray-900 dark:text-white">Find a Therapist</Text>
                <TouchableOpacity className="p-2">
                    <MaterialCommunityIcons name="magnify" size={24} color={isDark ? "#fff" : "#333"} />
                </TouchableOpacity>
            </View>

            {/* Search Input using Animated Input */}
            <View className="mb-4">
                <Input
                    placeholder="Search therapists..."
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    leftIcon="magnify"
                />
            </View>

            {/* Filter Chips */}
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                className="mb-6"
                contentContainerStyle={{ paddingRight: 20 }}
            >
                {FILTERS.map((filter) => (
                    <FilterChip
                        key={filter}
                        label={filter}
                        isSelected={selectedFilter === filter}
                        onPress={() => setSelectedFilter(filter)}
                    />
                ))}
            </ScrollView>

            {/* List Meta */}
            <View className="flex-row justify-between items-center mb-2">
                <Text className="text-gray-500 dark:text-gray-400 font-medium">
                    Showing <Text className="font-bold text-gray-900 dark:text-white">{filteredTherapists.length}</Text> therapists
                </Text>
                <TouchableOpacity className="flex-row items-center">
                    <Text className="text-gray-600 dark:text-gray-400 font-medium mr-1">Sort by</Text>
                    <MaterialCommunityIcons name="chevron-down" size={16} color={isDark ? "#9CA3AF" : "#666"} />
                </TouchableOpacity>
            </View>
        </MotiView>
    );

    const renderItem = useCallback(({ item, index }: { item: any, index: number }) => (
        <MotiView
            from={{ opacity: 0, translateY: 20 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ delay: index * 100, type: 'spring' }}
        >
            <TherapistCard
                name={item.full_name || 'Therapist'}
                role="Licensed Therapist" // Placeholder
                imageUrl={item.avatar_url || undefined}
                bio={item.bio || ''}
                expertise={['Anxiety', 'Depression', 'Coping']} // Placeholder
                isOnline={Math.random() > 0.5} // Random status for demo
                onPress={() => navigation.navigate('TherapistDetail', {
                    therapistId: item.user_id,
                    therapistName: item.full_name || 'Therapist',
                    therapistAvatar: item.avatar_url || undefined,
                    therapistBio: item.bio || undefined,
                    therapistExpertise: ['Anxiety', 'Depression', 'Coping']
                })}
            />
        </MotiView>
    ), [navigation]);

    const renderEmptyComponent = useCallback(() => (
        <View className="mt-10 items-center">
            <Text className="text-gray-400 dark:text-gray-500">No therapists found matching your criteria.</Text>
        </View>
    ), []);

    return (
        <View className="flex-1 bg-white dark:bg-background-dark">
            <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />
            <SafeAreaView edges={['top']} className="flex-1 px-6">

                {loading ? (
                    <View className="flex-1">
                        {renderHeader()}
                        <ListSkeleton count={4} />
                    </View>
                ) : error ? (
                    <View className="flex-1 justify-center items-center">
                        <Text className="text-red-500 text-center">{error}</Text>
                        <TouchableOpacity onPress={() => { }} className="mt-4 bg-primary px-6 py-2 rounded-lg">
                            <Text className="text-white font-bold">Retry</Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    <ErrorBoundary>
                        <FlatList
                            data={filteredTherapists}
                            renderItem={renderItem}
                            keyExtractor={(item, index) => `${item?.user_id || 'therapist'}-${index}`}
                            ListHeaderComponent={renderHeader}
                            showsVerticalScrollIndicator={false}
                            contentContainerStyle={{ paddingBottom: 20 }}
                            ListEmptyComponent={renderEmptyComponent}
                        />
                    </ErrorBoundary>
                )}
            </SafeAreaView>
        </View>
    );
};

export default withRollbarPerformance(TherapistsScreen, 'Therapists');
