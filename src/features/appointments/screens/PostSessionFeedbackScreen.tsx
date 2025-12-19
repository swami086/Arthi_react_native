import React, { useState } from 'react';
import { View, Text, ScrollView, TextInput, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp, CommonActions } from '@react-navigation/native';
import { RootStackParamList } from '../../../navigation/types';
import { Button } from '../../../components/Button';
import { RatingStars } from '../../../components/RatingStars';
import { FeedbackChip } from '../../../components/FeedbackChip';
import { useSessionFeedback } from '../hooks/useSessionFeedback';
import { MotiView } from 'moti';

type PostSessionFeedbackRouteProp = RouteProp<RootStackParamList, 'PostSessionFeedback'>;

export const PostSessionFeedbackScreen = () => {
    const navigation = useNavigation<any>();
    const route = useRoute<PostSessionFeedbackRouteProp>();
    const { appointmentId } = route.params;
    const { submitFeedback, loading } = useSessionFeedback();

    const [rating, setRating] = useState(0);
    const [feedbackText, setFeedbackText] = useState('');
    const [selectedChips, setSelectedChips] = useState<string[]>([]);

    const feedbackOptions = [
        "Great listener", "Helpful insights", "Empathetic",
        "Professional", "Good guidance", "Clarified doubts"
    ];

    const toggleChip = (chip: string) => {
        if (selectedChips.includes(chip)) {
            setSelectedChips(selectedChips.filter(c => c !== chip));
        } else {
            setSelectedChips([...selectedChips, chip]);
        }
    };

    const handleSubmit = async () => {
        if (rating === 0) {
            Alert.alert("Rating Required", "Please provide a star rating.");
            return;
        }

        try {
            await submitFeedback(appointmentId, rating, feedbackText, selectedChips);
            Alert.alert(
                "Feedback Submitted",
                "Thank you for your feedback!",
                [{ text: "Done", onPress: navigateHome }]
            );
        } catch (error) {
            Alert.alert("Error", "Failed to submit feedback. Please try again later.");
        }
    };

    const navigateHome = () => {
        navigation.dispatch(
            CommonActions.reset({
                index: 0,
                routes: [{ name: 'Main', params: { screen: 'Appointments' } }],
            })
        );
    };

    return (
        <SafeAreaView className="flex-1 bg-white dark:bg-gray-900">
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                className="flex-1"
            >
                <ScrollView className="flex-1 p-6" showsVerticalScrollIndicator={false}>
                    <MotiView
                        from={{ opacity: 0, translateY: 20 }}
                        animate={{ opacity: 1, translateY: 0 }}
                        className="items-center mb-8 mt-4"
                    >
                        <Text className="text-2xl font-bold text-gray-900 dark:text-white text-center mb-2">
                            Session Completed
                        </Text>
                        <Text className="text-gray-500 dark:text-gray-400 text-center">
                            How was your session?
                        </Text>
                    </MotiView>

                    <MotiView
                        from={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        delay={200}
                        className="bg-gray-50 dark:bg-gray-800 rounded-3xl p-6 mb-8 items-center"
                    >
                        <Text className="text-gray-900 dark:text-white font-bold text-lg mb-4">
                            Rate your experience
                        </Text>
                        <RatingStars
                            rating={rating}
                            onRatingChange={setRating}
                            size={40}
                        />
                    </MotiView>

                    <MotiView
                        from={{ opacity: 0, translateY: 20 }}
                        animate={{ opacity: 1, translateY: 0 }}
                        delay={400}
                        className="mb-8"
                    >
                        <Text className="text-gray-900 dark:text-white font-bold text-lg mb-4">
                            What went well?
                        </Text>
                        <View className="flex-row flex-wrap">
                            {feedbackOptions.map((option, index) => (
                                <FeedbackChip
                                    key={index}
                                    label={option}
                                    isSelected={selectedChips.includes(option)}
                                    onPress={() => toggleChip(option)}
                                />
                            ))}
                        </View>
                    </MotiView>

                    <MotiView
                        from={{ opacity: 0, translateY: 20 }}
                        animate={{ opacity: 1, translateY: 0 }}
                        delay={500}
                        className="mb-8"
                    >
                        <Text className="text-gray-900 dark:text-white font-bold text-lg mb-2">
                            Additional Comments
                        </Text>
                        <TextInput
                            className="bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white p-4 rounded-xl min-h-[100px]"
                            placeholder="Share your thoughts..."
                            placeholderTextColor="#9ca3af"
                            multiline
                            textAlignVertical="top"
                            value={feedbackText}
                            onChangeText={setFeedbackText}
                        />
                    </MotiView>
                </ScrollView>

                <View className="p-4 border-t border-gray-100 dark:border-gray-800">
                    <Button
                        onPress={handleSubmit}
                        loading={loading}
                        className="w-full mb-3"
                    >
                        Submit Feedback
                    </Button>
                    <Button
                        variant="ghost"
                        onPress={navigateHome}
                        className="w-full"
                    >
                        Skip
                    </Button>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};
