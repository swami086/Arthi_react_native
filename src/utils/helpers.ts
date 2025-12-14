export const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString(undefined, {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
    });
};

export const formatTime = (date: string) => {
    return new Date(date).toLocaleTimeString(undefined, {
        hour: '2-digit',
        minute: '2-digit',
    });
};

import AsyncStorage from '@react-native-async-storage/async-storage';

const ONBOARDING_KEY = '@onboarding_completed';

export const getOnboardingStatus = async (): Promise<boolean> => {
    try {
        const value = await AsyncStorage.getItem(ONBOARDING_KEY);
        return value === 'true';
    } catch (e) {
        console.error('Error reading onboarding status', e);
        return false;
    }
};

export const setOnboardingCompleted = async (completed: boolean = true): Promise<void> => {
    try {
        await AsyncStorage.setItem(ONBOARDING_KEY, String(completed));
    } catch (e) {
        console.error('Error setting onboarding status', e);
    }
};
