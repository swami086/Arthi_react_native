import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { AuthNavigator } from './AuthNavigator';
import { OnboardingNavigator } from './OnboardingNavigator';
import { MainNavigator } from './MainNavigator';
import { RootStackParamList } from './types';
import { useAuth } from '../features/auth/hooks/useAuth';
import { ActivityIndicator, View } from 'react-native';
import { BookingScreen } from '../features/appointments/screens/BookingScreen';
import { ChatDetailScreen } from '../features/messages/screens/ChatDetailScreen';
import { getOnboardingStatus } from '../utils/helpers';

const Stack = createStackNavigator<RootStackParamList>();

export const AppNavigator = () => {
    const { user, loading } = useAuth();
    const [isOnboardingCompleted, setIsOnboardingCompleted] = React.useState<boolean | null>(null);

    React.useEffect(() => {
        const checkOnboarding = async () => {
            const status = await getOnboardingStatus();
            setIsOnboardingCompleted(status);
        };
        checkOnboarding();
    }, []);

    if (loading || isOnboardingCompleted === null) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color="#30bae8" />
            </View>
        );
    }

    return (
        <NavigationContainer>
            <Stack.Navigator screenOptions={{ headerShown: false }}>
                {user ? (
                    <>
                        <Stack.Screen name="Main" component={MainNavigator} />
                        <Stack.Screen name="Booking" component={BookingScreen} />
                        <Stack.Screen name="ChatDetail" component={ChatDetailScreen} />
                    </>
                ) : (
                    <>
                        {!isOnboardingCompleted && (
                            <Stack.Screen name="Onboarding" component={OnboardingNavigator} />
                        )}
                        <Stack.Screen name="Auth" component={AuthNavigator} />
                    </>
                )}
            </Stack.Navigator>
        </NavigationContainer>
    );
};
