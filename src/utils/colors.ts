/**
 * Theme-aware color utilities
 */

export const colors = {
    primary: {
        light: '#30bae8',
        dark: '#259ac0',
    },
    secondary: {
        light: '#6d13ec',
        dark: '#8855ff',
    },
    accent: {
        orange: '#F97316',
        purple: '#8B5CF6',
        green: '#10B981',
    },
    error: {
        light: '#EF4444',
        dark: '#F87171',
    },
    warning: {
        light: '#F59E0B',
        dark: '#FBBF24',
    },
    info: {
        light: '#3B82F6',
        dark: '#60A5FA',
    },
    status: {
        success: '#22C55E',
        error: '#EF4444',
    },
    surface: {
        light: '#ffffff',
        dark: '#1a2c32',
        'dark-highlight': '#1e2e34',
        0: '#1a2c32',
        1: '#1e2e34',
        2: '#23343a',
    },
    background: {
        light: '#f8fbfc',
        dark: '#111d21',
    },
    border: {
        light: '#e2e8f0',
        dark: '#1e293b',
    },
    text: {
        primary: {
            light: '#0e181b',
            dark: '#e0e6e8',
        },
        secondary: {
            light: '#4f626b',
            dark: '#9ba8ae',
        },
    },
};

export const getPrimaryColor = (isDark: boolean) => isDark ? colors.primary.dark : colors.primary.light;
export const getSecondaryColor = (isDark: boolean) => isDark ? colors.secondary.dark : colors.secondary.light;
export const getSurfaceColor = (isDark: boolean) => isDark ? colors.surface.dark : colors.surface.light;
export const getBackgroundColor = (isDark: boolean) => isDark ? colors.background.dark : colors.background.light;
export const getTextPrimaryColor = (isDark: boolean) => isDark ? colors.text.primary.dark : colors.text.primary.light;
export const getTextSecondaryColor = (isDark: boolean) => isDark ? colors.text.secondary.dark : colors.text.secondary.light;

export const getAccentColor = (type: 'orange' | 'purple' | 'green') => colors.accent[type];
export const getStatusColor = (type: 'success' | 'error') => colors.status[type];
