import { useColorScheme as useNativeWindColorScheme, colorScheme } from 'nativewind';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';

const COLOR_SCHEME_KEY = '@color_scheme';

export function useColorScheme() {
    const { colorScheme: currentScheme } = useNativeWindColorScheme();
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        const loadColorScheme = async () => {
            try {
                const savedScheme = await AsyncStorage.getItem(COLOR_SCHEME_KEY);
                if (savedScheme === 'dark' || savedScheme === 'light') {
                    colorScheme.set(savedScheme);
                }
            } catch (error) {
                console.error('Failed to load color scheme:', error);
            } finally {
                setIsLoaded(true);
            }
        };

        loadColorScheme();
    }, []);

    const toggleColorScheme = async () => {
        const newScheme = currentScheme === 'dark' ? 'light' : 'dark';
        colorScheme.set(newScheme);
        try {
            await AsyncStorage.setItem(COLOR_SCHEME_KEY, newScheme);
        } catch (error) {
            console.error('Failed to save color scheme:', error);
        }
    };

    const setColorScheme = async (scheme: 'light' | 'dark') => {
        colorScheme.set(scheme);
        try {
            await AsyncStorage.setItem(COLOR_SCHEME_KEY, scheme);
        } catch (error) {
             console.error('Failed to save color scheme:', error);
        }
    };

    return {
        colorScheme: currentScheme ?? 'light',
        isDark: currentScheme === 'dark',
        toggleColorScheme,
        setColorScheme,
        isLoaded
    };
}
