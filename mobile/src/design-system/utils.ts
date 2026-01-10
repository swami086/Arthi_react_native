import { tokens } from './tokens';
import { useColorScheme } from 'nativewind';
import { Platform } from 'react-native';

/**
 * Get color based on current theme
 */
export const getColor = (
    colorPath: keyof typeof tokens.colors | string,
    variant?: 'light' | 'dark' | 'DEFAULT'
): string => {
    // Simple implementation for now, can be expanded for nested paths
    const keys = colorPath.split('.');
    let current: any = tokens.colors;

    for (const key of keys) {
        if (current[key]) {
            current = current[key];
        } else {
            return colorPath; // Return raw string if not found in tokens
        }
    }

    if (typeof current === 'string') return current;

    // If it's an object with light/dark/DEFAULT
    if (variant && current[variant]) return current[variant];

    return current.DEFAULT || current.light || '#000000';
};

/**
 * Get spacing value
 */
export const getSpacing = (size: keyof typeof tokens.spacing): number => {
    return tokens.spacing[size];
};

/**
 * Get font size
 */
export const getFontSize = (size: keyof typeof tokens.typography.fontSize): number => {
    return tokens.typography.fontSize[size];
};

/**
 * Get border radius
 */
export const getBorderRadius = (size: keyof typeof tokens.borderRadius): number => {
    return tokens.borderRadius[size];
};

/**
 * Get shadow style based on theme
 */
export const getShadow = (level: keyof typeof tokens.shadows, isDark: boolean) => {
    const theme = isDark ? 'dark' : 'light';
    return tokens.shadows[level][theme];
};

/**
 * Helper to resolve responsive values or conditional styles
 */
export const resolveThemeValue = <T>(light: T, dark: T, isDark: boolean): T => {
    return isDark ? dark : light;
};
