import { useColorScheme as useNativeWindColorScheme, colorScheme } from 'nativewind';

export function useColorScheme() {
    const { colorScheme: currentScheme } = useNativeWindColorScheme();
    return {
        colorScheme: currentScheme ?? 'light',
        isDark: currentScheme === 'dark',
        toggleColorScheme: () => {
            const newScheme = currentScheme === 'dark' ? 'light' : 'dark';
            colorScheme.set(newScheme);
        },
        setColorScheme: (scheme: 'light' | 'dark') => {
            colorScheme.set(scheme);
        },
    };
}
