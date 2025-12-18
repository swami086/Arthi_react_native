import { useColorScheme as useNativeWindColorScheme } from 'nativewind';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState, useCallback } from 'react';
import { Appearance } from 'react-native';

const COLOR_SCHEME_KEY = '@color_scheme';

export function useColorScheme() {
    const { colorScheme, setColorScheme } = useNativeWindColorScheme();
    const [isLoaded, setIsLoaded] = useState(false);

    // Load saved scheme or default
    useEffect(() => {
        const loadColorScheme = async () => {
            try {
                const savedScheme = await AsyncStorage.getItem(COLOR_SCHEME_KEY);
                if (savedScheme === 'dark' || savedScheme === 'light') {
                    setColorScheme(savedScheme);
                } else {
                    // If no saved preference, we default to system via NativeWind's 'system' option
                    // Note: setColorScheme accepts 'system', but colorScheme value is always resolved ('light' | 'dark')
                    setColorScheme('system');
                }
            } catch (error) {
                console.error('Failed to load color scheme:', error);
            } finally {
                setIsLoaded(true);
            }
        };

        loadColorScheme();
    }, []);

    // Determine effective dark mode.
    // NativeWind's colorScheme is 'light' | 'dark' | undefined.
    // If undefined, we fallback to Appearance.
    // We do NOT check for 'system' string here as per lint error.
    const isDark = colorScheme === 'dark' || (!colorScheme && Appearance.getColorScheme() === 'dark');

    const toggleColorScheme = useCallback(async () => {
        const newScheme = isDark ? 'light' : 'dark';

        setColorScheme(newScheme);

        try {
            await AsyncStorage.setItem(COLOR_SCHEME_KEY, newScheme);
        } catch (error) {
            console.error('Failed to save color scheme:', error);
        }
    }, [isDark, setColorScheme]);

    const setValue = useCallback(async (scheme: 'light' | 'dark' | 'system') => {
        setColorScheme(scheme);
        try {
            if (scheme === 'system') {
                await AsyncStorage.removeItem(COLOR_SCHEME_KEY);
            } else {
                await AsyncStorage.setItem(COLOR_SCHEME_KEY, scheme);
            }
        } catch (error) {
            console.error('Failed to save color scheme:', error);
        }
    }, [setColorScheme]);

    return {
        colorScheme: colorScheme ?? 'light',
        isDark,
        toggleColorScheme,
        setColorScheme: setValue,
        isLoaded
    };
}
