import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, Image, TextInput, Alert, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, RouteProp, useRoute } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { ErrorBoundary } from '../../../components/ErrorBoundary';
import { useAuth } from '../../auth/hooks/useAuth';
import { useColorScheme } from '../../../hooks/useColorScheme';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { searchAvailableMentees } from '../../../api/mentorService';
import { createRelationship } from '../../../api/relationshipService';
import { createManagedMentee } from '../../../api/mentorService';
import { Profile } from '../../../api/types';
import { Button } from '../../../components/Button';
import { Input } from '../../../components/Input';
import { RootStackParamList } from '../../../navigation/types';

export const MenteeDiscoveryScreen = () => {
    const { user } = useAuth();
    const { isDark } = useColorScheme();
    const navigation = useNavigation<StackNavigationProp<RootStackParamList, 'MenteeDiscovery'>>();
    const route = useRoute<RouteProp<RootStackParamList, 'MenteeDiscovery'>>();
    const [query, setQuery] = useState('');
    const [mentees, setMentees] = useState<Profile[]>([]);
    const [loading, setLoading] = useState(false);
    const [inviting, setInviting] = useState<string | null>(null);
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [skippedMentees, setSkippedMentees] = useState<Set<string>>(new Set());

    // Manual Add State
    const [showAddModal, setShowAddModal] = useState(route.params?.autoOpenAddModal === true);

    // Check for auto-open param to handle any edge cases where it might be updated after mount
    React.useEffect(() => {
        if (route.params?.autoOpenAddModal) {
            setShowAddModal(true);
            // Clear param so it doesn't reopen if we swipe back/close
            navigation.setParams({ autoOpenAddModal: undefined });
        }
    }, [route.params?.autoOpenAddModal]);

    const [newMenteeName, setNewMenteeName] = useState('');
    const [newMenteeEmail, setNewMenteeEmail] = useState('');
    const [addingMentee, setAddingMentee] = useState(false);

    const CATEGORIES = ['All', 'Academic', 'Anxiety & Stress', 'Career Prep', 'Creative Arts'];

    const handleSearch = useCallback(async () => {
        if (!user?.id) return;
        setLoading(true);
        try {
            const results = await searchAvailableMentees(user.id, query, selectedCategory);
            const uniqueResults = Array.from(new Map(results.map((r: Profile) => [r.user_id, r])).values());
            setMentees(uniqueResults);
        } catch (error) {
            console.error(error);
            Alert.alert("Error", "Failed to fetch mentees");
        } finally {
            setLoading(false);
        }
    }, [user?.id, query, selectedCategory]);

    // Initial fetch on mount or category change
    React.useEffect(() => {
        handleSearch();
    }, [handleSearch]);

    const handleConnect = async (menteeId: string) => {
        if (!user?.id) return;
        setInviting(menteeId);
        try {
            await createRelationship(user.id, menteeId, user.id, 'pending', 'Self-initiated invite');
            Alert.alert("Success", "Request sent to mentee.");
            setMentees(prev => prev.filter(m => m.user_id !== menteeId));
        } catch (error: any) {
            Alert.alert("Error", error.message);
        } finally {
            setInviting(null);
        }
    };

    const handleSkip = (menteeId: string) => {
        setSkippedMentees(prev => {
            const newSet = new Set(prev);
            newSet.add(menteeId);
            return newSet;
        });
    };

    const handleAddManualMentee = async () => {
        if (!user?.id) return;
        if (!newMenteeName || !newMenteeEmail) {
            Alert.alert("Error", "Please provide both name and email.");
            return;
        }

        setAddingMentee(true);
        try {
            const result = await createManagedMentee(user.id, newMenteeEmail, newMenteeName);
            Alert.alert("Success", result.message);
            setShowAddModal(false);
            setNewMenteeName('');
            setNewMenteeEmail('');
            // Optionally navigate to Mentee List or refresh
        } catch (error: any) {
            Alert.alert("Error", error.message || "Failed to add mentee");
        } finally {
            setAddingMentee(false);
        }
    };

    const getMatchPercentage = (mentee: Profile) => {
        // Mock calculation - in real app would compare interests/expertise
        return Math.floor(Math.random() * (98 - 75) + 75);
    };

    const renderCategoryItem = ({ item }: { item: string }) => (
        <TouchableOpacity
            onPress={() => setSelectedCategory(item)}
            className={`px-4 py-2 rounded-full mr-2 ${selectedCategory === item
                ? 'bg-primary-light dark:bg-primary-dark'
                : 'bg-gray-100 dark:bg-gray-700'
                }`}
        >
            <Text className={`${selectedCategory === item
                ? 'text-white font-bold'
                : 'text-gray-600 dark:text-gray-300'
                }`}>
                {item}
            </Text>
        </TouchableOpacity>
    );

    const renderMenteeCard = ({ item, index, isTop = false }: { item: Profile, index: number, isTop?: boolean }) => {
        const menteeId = item.user_id;
        if (skippedMentees.has(menteeId)) return null;

        const matchPercentage = getMatchPercentage(item);

        return (
            <View className={`bg-white dark:bg-gray-800 p-4 rounded-xl mb-4 shadow-sm border-l-4 ${isTop ? 'border-l-accent-light' : 'border-l-transparent'}`}>
                {isTop && (
                    <View className="absolute top-2 right-2 bg-green-100 dark:bg-green-900 px-2 py-1 rounded-md">
                        <Text className="text-xs font-bold text-green-700 dark:text-green-300">
                            {matchPercentage}% Match
                        </Text>
                    </View>
                )}

                <View className="flex-row items-start mb-3">
                    <View className="h-14 w-14 bg-gray-200 rounded-full overflow-hidden mr-3">
                        {item.avatar_url ? (
                            <Image source={{ uri: item.avatar_url }} className="h-full w-full" />
                        ) : (
                            <View className="h-full w-full items-center justify-center bg-primary-100">
                                <Text className="text-xl font-bold text-primary-700">
                                    {item.full_name?.charAt(0) || '?'}
                                </Text>
                            </View>
                        )}
                    </View>
                    <View className="flex-1 pr-12">
                        <Text className="font-bold text-lg text-text-main-light dark:text-white">
                            {item.full_name}
                        </Text>
                        <Text className="text-sm text-text-sub-light dark:text-gray-400 mb-1">
                            {item.specialization || 'General'} • {item.role === 'mentee' ? 'Mentee' : 'User'}
                        </Text>
                    </View>
                </View>

                {item.expertise_areas && item.expertise_areas.length > 0 && (
                    <View className="flex-row flex-wrap gap-2 mb-3">
                        {item.expertise_areas.slice(0, 3).map((area, i) => (
                            <View key={i} className={`px-2 py-1 rounded-md ${i === 0 ? 'bg-orange-100 dark:bg-orange-900' : 'bg-gray-100 dark:bg-gray-700'}`}>
                                <Text className={`text-xs ${i === 0 ? 'text-orange-700 dark:text-orange-300' : 'text-gray-600 dark:text-gray-300'}`}>
                                    {area}
                                </Text>
                            </View>
                        ))}
                        {item.expertise_areas.length > 3 && (
                            <Text className="text-xs text-gray-500 self-center">+{item.expertise_areas.length - 3}</Text>
                        )}
                    </View>
                )}

                <Text className="text-sm text-gray-600 dark:text-gray-300 mb-4 line-clamp-2" numberOfLines={2}>
                    {item.bio || 'No bio provided. Looking for mentorship to grow and learn.'}
                </Text>

                <View className="flex-row gap-3">
                    <TouchableOpacity
                        onPress={() => handleSkip(menteeId)}
                        className="flex-1 py-2 rounded-lg border border-gray-200 dark:border-gray-700 items-center justify-center"
                    >
                        <Text className="text-gray-500 font-medium">Skip</Text>
                    </TouchableOpacity>
                    <Button
                        title="Invite Mentee"
                        onPress={() => handleConnect(menteeId)}
                        loading={inviting === menteeId}
                        className="flex-1 py-2 rounded-lg items-center justify-center"
                        textClassName="text-sm font-bold"
                    />
                </View>
            </View>
        );
    };

    const renderHeader = () => (
        <View>
            <TouchableOpacity
                onPress={() => setShowAddModal(true)}
                className="bg-primary/10 p-3 rounded-lg flex-row items-center justify-center mb-4 border border-primary/20"
            >
                <Icon name="account-plus" size={20} color="#30bae8" />
                <Text className="text-primary font-bold ml-2">Add Mentee Manually</Text>
            </TouchableOpacity>

            {/* Search Bar */}
            <View className="flex-row gap-2 mt-2 items-center mb-4">
                <View className="bg-gray-100 dark:bg-gray-700 rounded-lg flex-row items-center px-3 py-2 flex-1 h-12">
                    <Icon name="magnify" size={20} color="#999" />
                    <TextInput
                        placeholder="Search by name or interest..."
                        value={query}
                        onChangeText={setQuery}
                        onSubmitEditing={handleSearch}
                        className="flex-1 ml-2 text-text-main-light dark:text-white"
                        placeholderTextColor="#999"
                        autoCapitalize="none"
                    />
                </View>
                <View className="h-12 justify-center">
                    <Button
                        title="Search"
                        onPress={handleSearch}
                        loading={loading}
                        className="px-4 rounded-lg h-12 items-center justify-center"
                        textClassName="text-sm font-bold"
                    />
                </View>
            </View>

            {/* Category Filter */}
            <View className="mb-6">
                <FlatList
                    data={CATEGORIES}
                    renderItem={renderCategoryItem}
                    keyExtractor={item => item}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={{ paddingBottom: 4 }}
                />
            </View>

            {/* Top Recommendation Section */}
            {!query && mentees.length > 0 && !skippedMentees.has(mentees[0].user_id) && (
                <View className="mb-6">
                    <Text className="text-lg font-bold text-text-main-light dark:text-white mb-3">
                        Top Recommendation
                    </Text>
                    {renderMenteeCard({ item: mentees[0], index: 0, isTop: true })}
                </View>
            )}

            <Text className="text-lg font-bold text-text-main-light dark:text-white mb-3">
                All Candidates
            </Text>
        </View>
    );

    const filteredMentees = mentees.filter(m => !skippedMentees.has(m.user_id));
    // Exclude top recommendation from main list if it's shown separately
    const listData = filteredMentees;

    const renderEmptyComponent = useCallback(() => (
        <View className="items-center justify-center mt-10">
            {loading ? (
                <Text className="text-gray-400">Loading...</Text>
            ) : (
                <Text className="text-gray-400 mt-4 text-center">
                    No mentees found matching your criteria.
                </Text>
            )}
        </View>
    ), [loading]);

    return (
        <SafeAreaView className="flex-1 bg-background-light dark:bg-background-dark">
            <View className="px-6 py-4 bg-white dark:bg-gray-800 shadow-sm z-10 flex-row items-center">
                <TouchableOpacity onPress={() => navigation.goBack()} className="mr-3">
                    <Icon name="arrow-left" size={24} color={isDark ? '#fff' : '#333'} />
                </TouchableOpacity>
                <Text className="text-xl font-bold text-text-main-light dark:text-white">Find Mentees</Text>
            </View>

            <Modal
                transparent
                visible={showAddModal}
                animationType="slide"
                onRequestClose={() => setShowAddModal(false)}
            >
                <View className="flex-1 justify-center items-center bg-black/50 p-4">
                    <View className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-sm shadow-xl">
                        <Text className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Add Mentee Manually</Text>
                        <Text className="text-gray-500 mb-6 text-sm">
                            Enter the details below to instantly add a mentee to your roster.
                        </Text>

                        <View className="mb-4">
                            <Input
                                label="Full Name"
                                placeholder="e.g. John Doe"
                                value={newMenteeName}
                                onChangeText={setNewMenteeName}
                            />
                        </View>

                        <View className="mb-6">
                            <Input
                                label="Email Address"
                                placeholder="e.g. john@example.com"
                                value={newMenteeEmail}
                                onChangeText={setNewMenteeEmail}
                                autoCapitalize="none"
                                keyboardType="email-address"
                            />
                        </View>

                        <View className="flex-row gap-3">
                            <View className="flex-1">
                                <Button
                                    title="Cancel"
                                    variant="outline"
                                    onPress={() => setShowAddModal(false)}
                                />
                            </View>
                            <View className="flex-1">
                                <Button
                                    title="Add Mentee"
                                    onPress={handleAddManualMentee}
                                    loading={addingMentee}
                                />
                            </View>
                        </View>
                    </View>
                </View>
            </Modal>

            <ErrorBoundary>
                <FlatList
                    data={listData}
                    renderItem={({ item, index }) => renderMenteeCard({ item, index })}
                    keyExtractor={(item, index) => `${item.user_id}-${index}`}
                    contentContainerStyle={{ padding: 24 }}
                    ListHeaderComponent={renderHeader}
                    ListEmptyComponent={renderEmptyComponent}
                />
            </ErrorBoundary>
        </SafeAreaView>
    );
};
