import React from 'react';
import { View, Text, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '../../../components/Button';
import { useAuth } from '../hooks/useAuth';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

export const PendingApprovalScreen = () => {
    const { signOut, refreshProfile, loading } = useAuth();
    const [checking, setChecking] = React.useState(false);

    const handleCheckStatus = async () => {
        setChecking(true);
        await refreshProfile();
        // The AppNavigator will automatically redirect if status changed to approved
        setTimeout(() => setChecking(false), 1000);
    };

    return (
        <SafeAreaView className="flex-1 bg-background-light dark:bg-background-dark items-center justify-center px-6">
            <View className="items-center w-full max-w-sm">
                <View className="w-24 h-24 bg-yellow-100 dark:bg-yellow-900/30 rounded-full items-center justify-center mb-6">
                    <Icon name="clock-outline" size={48} color="#eab308" />
                </View>

                <Text className="text-2xl font-bold text-text-main-light dark:text-white text-center mb-2">
                    Application Under Review
                </Text>

                <Text className="text-text-sub-light dark:text-gray-400 text-center mb-8 leading-6">
                    Thanks for applying to be a mentor! Your profile is currently being reviewed by our admin team. This usually takes 24-48 hours.
                </Text>

                <View className="bg-white dark:bg-gray-800 p-4 rounded-xl w-full mb-8 shadow-sm">
                    <View className="flex-row items-center mb-2">
                        <Icon name="information-outline" size={20} color="#4e8597" style={{ marginRight: 8 }} />
                        <Text className="font-semibold text-text-main-light dark:text-white">Next Steps</Text>
                    </View>
                    <Text className="text-sm text-text-sub-light dark:text-gray-400 ml-7">
                        • We may contact you for additional verification.{'\n'}
                        • You'll receive an email once your account is approved.{'\n'}
                        • You can check back here anytime.
                    </Text>
                </View>

                <Button
                    title="Check Approval Status"
                    onPress={handleCheckStatus}
                    loading={checking}
                    className="w-full mb-4"
                />

                <Button
                    title="Sign Out"
                    onPress={signOut}
                    variant="outline"
                    className="w-full border-gray-300 dark:border-gray-600"
                    textClassName="text-gray-600 dark:text-gray-400"
                />
            </View>
        </SafeAreaView>
    );
};
