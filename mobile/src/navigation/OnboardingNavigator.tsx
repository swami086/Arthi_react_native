import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { WelcomeScreen } from '../features/onboarding/screens/WelcomeScreen';
import { FeaturesScreen } from '../features/onboarding/screens/FeaturesScreen';
import { SafetyScreen } from '../features/onboarding/screens/SafetyScreen';
import { OnboardingStackParamList } from './types';

const Stack = createStackNavigator<OnboardingStackParamList>();

export const OnboardingNavigator = () => {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="Welcome" component={WelcomeScreen} />
            <Stack.Screen name="Features" component={FeaturesScreen} />
            <Stack.Screen name="Safety" component={SafetyScreen} />
        </Stack.Navigator>
    );
};
