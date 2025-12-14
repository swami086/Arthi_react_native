import React, { useState } from 'react';
import { View, Text, FlatList, ActivityIndicator, TouchableOpacity, ScrollView, StatusBar } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useMentors } from '../hooks/useMentors';
import { MentorCard } from '../../../components/MentorCard';
import { FilterChip } from '../../../components/FilterChip';
import { MainTabCompositeProp } from '../../../navigation/types';

const FILTERS = ['All Filters', 'Confidence', 'Anxiety', 'Career', 'School Stress'];

export const MentorsScreen = () => {
    const { mentors, loading, error } = useMentors();
    const navigation = useNavigation<MainTabCompositeProp>();

    // UI State
    const [selectedFilter, setSelectedFilter] = useState('All Filters');
    const [sortBy, setSortBy] = useState('Recommended');

    // Filter logic
    const filteredMentors = mentors.filter(m => {
        if (selectedFilter === 'All Filters') return true;

        // This is a naive filter simulation. In a real app, 'expertise' would be a field in the DB or 'm' profile.
        // For now, we'll assume filtering matches if the bio contains the word or we just show all for demo if no expertise field.
        // Ideally 'm' should have 'expertise' array. 
        // We will default to showing all if specific data is missing to ensure UI isn't empty.
        return true;
    });

    const renderHeader = () => (
        <View className="mb-4">
            {/* Top Bar */}
            <View className="flex-row items-center justify-between mb-6">
                <TouchableOpacity onPress={() => navigation.goBack()} className="p-2 rounded-full bg-gray-50">
                    <MaterialCommunityIcons name="arrow-left" size={24} color="#333" />
                </TouchableOpacity>
                <Text className="text-xl font-bold text-gray-900">Find a Mentor</Text>
                <TouchableOpacity className="p-2">
                    <MaterialCommunityIcons name="magnify" size={24} color="#333" />
                </TouchableOpacity>
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
                <Text className="text-gray-500 font-medium">
                    Showing <Text className="font-bold text-gray-900">{filteredMentors.length}</Text> mentors
                </Text>
                <TouchableOpacity className="flex-row items-center">
                    <Text className="text-gray-600 font-medium mr-1">Sort by</Text>
                    <MaterialCommunityIcons name="chevron-down" size={16} color="#666" />
                </TouchableOpacity>
            </View>
        </View>
    );

    return (
        <View className="flex-1 bg-white">
            <StatusBar barStyle="dark-content" />
            <SafeAreaView edges={['top']} className="flex-1 px-6">

                {loading ? (
                    <View className="flex-1 justify-center items-center">
                        <ActivityIndicator size="large" color="#30bae8" />
                    </View>
                ) : error ? (
                    <View className="flex-1 justify-center items-center">
                        <Text className="text-red-500 text-center">{error}</Text>
                        <TouchableOpacity onPress={() => { }} className="mt-4 bg-primary px-6 py-2 rounded-lg">
                            <Text className="text-white font-bold">Retry</Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    <FlatList
                        data={filteredMentors}
                        renderItem={({ item }) => (
                            <MentorCard
                                name={item.full_name || 'Mentor'}
                                role="Licensed Therapist" // Placeholder
                                imageUrl={item.avatar_url || undefined}
                                bio={item.bio || ''}
                                expertise={['Anxiety', 'Depression', 'Coping']} // Placeholder until DB has this
                                isOnline={Math.random() > 0.5} // Random status for demo
                                onPress={() => navigation.navigate('MentorDetail', {
                                    mentorId: item.user_id,
                                    mentorName: item.full_name || 'Mentor',
                                    mentorAvatar: item.avatar_url || undefined,
                                    mentorBio: item.bio || undefined,
                                    mentorExpertise: ['Anxiety', 'Depression', 'Coping']
                                })}
                            />
                        )}
                        keyExtractor={item => item.user_id}
                        ListHeaderComponent={renderHeader}
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={{ paddingBottom: 20 }}
                        ListEmptyComponent={
                            <View className="mt-10 items-center">
                                <Text className="text-gray-400">No mentors found matching your criteria.</Text>
                            </View>
                        }
                    />
                )}
            </SafeAreaView>
        </View>
    );
};
