import { useColorScheme as useNativeWindColorScheme } from 'nativewind';

export function useColorScheme() {
    const { colorScheme, toggleColorScheme, setColorScheme } = useNativeWindColorScheme();
    return {
        colorScheme: colorScheme ?? 'light',
        isDark: colorScheme === 'dark',
        toggleColorScheme,
        setColorScheme,
    };
}
