import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Image, FlatList, StatusBar, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { RootStackParamList } from '../../../navigation/types';
import { BottomActionBar } from '../../../components/BottomActionBar';
import { useTherapistDetail } from '../hooks/useTherapistDetail';
import Animated, { useSharedValue, useAnimatedStyle, useAnimatedScrollHandler, interpolate, Extrapolate } from 'react-native-reanimated';
import { MotiView } from 'moti';
import { useColorScheme } from '../../../hooks/useColorScheme';

type TherapistDetailRouteProp = RouteProp<RootStackParamList, 'TherapistDetail'>;

const TherapistDetailScreen = () => {
    const navigation = useNavigation<any>();
    const route = useRoute<TherapistDetailRouteProp>();
    const { mentorId, mentorName, mentorAvatar, mentorBio, mentorExpertise } = route.params;
    const { isDark } = useColorScheme();
    const { mentor, reviews, availability, loading } = useTherapistDetail(mentorId);

    const [isOnline, setIsOnline] = useState(true); // Mock status
    const [isFavorite, setIsFavorite] = useState(false);

    // Default expertise if not provided
    const displayExpertise = mentor?.expertise_areas || mentorExpertise || ['Anxiety', 'Depression', 'Work Stress', 'Relationships'];
    const displayBio = mentor?.bio || mentorBio;
    const displayName = mentor?.full_name || mentorName;
    const displayAvatar = mentor?.avatar_url || mentorAvatar;

    const scrollY = useSharedValue(0);

    const scrollHandler = useAnimatedScrollHandler((event) => {
        scrollY.value = event.contentOffset.y;
    });

    const headerAnimatedStyle = useAnimatedStyle(() => ({
        opacity: interpolate(scrollY.value, [0, 100], [1, 0], Extrapolate.CLAMP),
        transform: [
            { translateY: interpolate(scrollY.value, [0, 100], [0, -20], Extrapolate.CLAMP) },
            { scale: interpolate(scrollY.value, [-100, 0], [1.2, 1], Extrapolate.CLAMP) }
        ],
    }));

    const renderReviewItem = ({ item }: { item: any }) => (
        <View className="bg-white dark:bg-gray-800 p-4 rounded-2xl mr-4 shadow-sm w-64 border border-gray-100 dark:border-gray-700">
            <View className="flex-row items-center mb-2">
                <View className="flex-row">
                    {[1, 2, 3, 4, 5].map((star) => (
                        <View key={star}>
                            <MaterialCommunityIcons
                                name="star"
                                size={14}
                                color={star <= item.rating ? "#FFD700" : (isDark ? "#4B5563" : "#E0E0E0")}
                            />
                        </View>
                    ))}
                </View>
                <Text className="text-xs text-gray-500 ml-2">{new Date(item.created_at).toLocaleDateString()}</Text>
            </View>
            <Text className="text-gray-800 dark:text-gray-200 font-medium mb-1">{item.comment}</Text>
            <Text className="text-gray-500 dark:text-gray-400 text-xs">- {item.mentee?.full_name || 'Anonymous'}</Text>
        </View>
    );

    if (loading && !mentor) {
        return (
            <View className="flex-1 justify-center items-center bg-white dark:bg-gray-900">
                <ActivityIndicator size="large" color="#30bae8" />
            </View>
        );
    }

    return (
        <View className="flex-1 bg-white dark:bg-background-dark">
            <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />

            {/* Header */}
            <SafeAreaView edges={['top']} className="bg-white dark:bg-gray-900 z-10">
                <View className="flex-row justify-between items-center px-4 py-2">
                    <TouchableOpacity onPress={() => navigation.goBack()} className="p-2 rounded-full bg-gray-50 dark:bg-gray-800">
                        <MaterialCommunityIcons name="arrow-left" size={24} color={isDark ? "#fff" : "#333"} />
                    </TouchableOpacity>
                    <Text className="text-lg font-bold text-gray-900 dark:text-white">Therapist Profile</Text>
                    <TouchableOpacity onPress={() => setIsFavorite(!isFavorite)} className="p-2">
                        <MaterialCommunityIcons
                            name={isFavorite ? "heart" : "heart-outline"}
                            size={24}
                            color={isFavorite ? "#FF4B4B" : (isDark ? "#fff" : "#333")}
                        />
                    </TouchableOpacity>
                </View>
            </SafeAreaView>

            <Animated.ScrollView
                className="flex-1"
                showsVerticalScrollIndicator={false}
                onScroll={scrollHandler}
                scrollEventThrottle={16}
            >
                {/* Profile Header */}
                <Animated.View style={[headerAnimatedStyle, { alignItems: 'center', marginTop: 16, marginBottom: 24 }]}>
                    <View className="relative">
                        <LinearGradient
                            colors={['#30bae8', '#9055ff']}
                            className="p-1 rounded-full"
                        >
                            <View className="bg-white dark:bg-gray-800 p-1 rounded-full">
                                <Image
                                    source={{ uri: displayAvatar || 'https://via.placeholder.com/150' }}
                                    className="w-24 h-24 rounded-full"
                                />
                            </View>
                        </LinearGradient>
                        {isOnline && (
                            <View className="absolute bottom-2 right-2 w-4 h-4 bg-green-500 rounded-full border-2 border-white" />
                        )}
                    </View>
                    <Text className="text-2xl font-bold text-gray-900 dark:text-white mt-3">{displayName}</Text>
                    <Text className="text-primary font-medium uppercase tracking-wide">Licensed Therapist</Text>

                    <View className="flex-row items-center mt-2 space-x-4">
                        <View className="flex-row items-center bg-yellow-50 dark:bg-yellow-900/30 px-2 py-1 rounded-full border border-yellow-200 dark:border-yellow-800">
                            <MaterialCommunityIcons name="star" size={16} color="#FFD700" />
                            <Text className="ml-1 font-bold text-gray-800 dark:text-gray-200">4.9</Text>
                            <Text className="text-gray-500 dark:text-gray-400 text-xs ml-1">(120+ reviews)</Text>
                        </View>
                        <View className="flex-row items-center bg-blue-50 dark:bg-blue-900/30 px-2 py-1 rounded-full border border-blue-200 dark:border-blue-800">
                            <MaterialCommunityIcons name="briefcase-outline" size={16} color={isDark ? "#60A5FA" : "#30bae8"} />
                            <Text className="ml-1 font-bold text-gray-800 dark:text-gray-200">8 yrs</Text>
                        </View>
                        <View className="flex-row items-center bg-green-50 dark:bg-green-900/30 px-2 py-1 rounded-full border border-green-200 dark:border-green-800">
                            <MaterialCommunityIcons name="currency-usd" size={16} color="#10B981" />
                            <Text className="ml-1 font-bold text-gray-800 dark:text-gray-200">
                                ${mentor?.hourly_rate || 50}/hr
                            </Text>
                        </View>
                    </View>
                </Animated.View>

                {/* About Section */}
                <MotiView
                    from={{ opacity: 0, translateY: 20 }}
                    animate={{ opacity: 1, translateY: 0 }}
                    transition={{ delay: 200, type: 'spring' }}
                    className="px-6 mb-6"
                >
                    <Text className="text-lg font-bold text-gray-900 dark:text-white mb-2">About</Text>
                    <Text className="text-gray-600 dark:text-gray-400 leading-6">
                        {displayBio || "I specialize in helping individuals cope with anxiety, depression, and life transitions. My approach is warm, collaborative, and evidence-based, tailored to your unique needs and goals."}
                    </Text>
                </MotiView>

                {/* Expertise Section */}
                <MotiView
                    from={{ opacity: 0, translateY: 20 }}
                    animate={{ opacity: 1, translateY: 0 }}
                    transition={{ delay: 300, type: 'spring' }}
                    className="px-6 mb-6"
                >
                    <Text className="text-lg font-bold text-gray-900 dark:text-white mb-3">Areas of Expertise</Text>
                    <View className="flex-row flex-wrap gap-2">
                        {displayExpertise.map((item: string, index: number) => (
                            <View key={index} className="bg-blue-50 dark:bg-blue-900/30 px-3 py-1.5 rounded-full border border-blue-100 dark:border-blue-800">
                                <Text className="text-primary dark:text-blue-300 font-medium text-sm">{item}</Text>
                            </View>
                        ))}
                    </View>
                </MotiView>

                {/* Availability Info */}
                <MotiView
                    from={{ opacity: 0, translateY: 20 }}
                    animate={{ opacity: 1, translateY: 0 }}
                    transition={{ delay: 400, type: 'spring' }}
                    className="px-6 mb-6"
                >
                    <View className="bg-gray-50 dark:bg-gray-800 p-4 rounded-xl flex-row items-center">
                        <View className="bg-green-100 dark:bg-green-900/30 p-2 rounded-full mr-3">
                            <MaterialCommunityIcons name="calendar-clock" size={24} color="#10B981" />
                        </View>
                        <View>
                            <Text className="font-bold text-gray-900 dark:text-white">Next Available</Text>
                            <Text className="text-gray-600 dark:text-gray-400">Tomorrow at 10:00 AM</Text>
                        </View>
                    </View>
                </MotiView>

                {/* Reviews Section */}
                <MotiView
                    from={{ opacity: 0, translateY: 20 }}
                    animate={{ opacity: 1, translateY: 0 }}
                    transition={{ delay: 500, type: 'spring' }}
                    className="mb-24"
                >
                    <View className="flex-row justify-between items-center px-6 mb-3">
                        <Text className="text-lg font-bold text-gray-900 dark:text-white">Client Reviews</Text>
                        <TouchableOpacity>
                            <Text className="text-primary font-medium">See All</Text>
                        </TouchableOpacity>
                    </View>
                    <FlatList
                        data={reviews}
                        renderItem={renderReviewItem}
                        keyExtractor={(item, index) => `${item.id}-${index}`}
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 10 }}
                        ListEmptyComponent={<Text className="text-gray-500 dark:text-white/40 italic ml-6">No reviews yet.</Text>}
                    />
                </MotiView>
            </Animated.ScrollView>

            <BottomActionBar
                secondaryLabel="Message"
                onSecondaryPress={() => navigation.navigate('ChatDetail', { otherUserId: mentorId, otherUserName: mentorName })}
                primaryLabel="Book Session"
                onPrimaryPress={() => navigation.navigate('SelectDate', { mentorId, mentorName, mentorAvatar })}
            />
        </View>
    );
};

export default TherapistDetailScreen;
