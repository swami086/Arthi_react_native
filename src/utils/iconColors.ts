import { colors } from './colors';

export type IconColorType = 'primary' | 'secondary' | 'neutral' | 'success' | 'error' | 'warning' | 'info';

/**
 * Gets the appropriate icon color based on type and theme
 */
export const getIconColor = (type: IconColorType, isDark: boolean): string => {
    switch (type) {
        case 'primary':
            return isDark ? colors.primary.dark : colors.primary.light;
        case 'secondary':
            return isDark ? colors.secondary.dark : colors.secondary.light;
        case 'success':
            return isDark ? colors.success.dark : colors.success.light;
        case 'error':
            return isDark ? colors.error.dark : colors.error.light;
        case 'warning':
            return isDark ? colors.warning.dark : colors.warning.light;
        case 'info':
            return isDark ? colors.info.dark : colors.info.light;
        case 'neutral':
        default:
            return isDark ? colors.text.secondary.dark : colors.text.secondary.light;
    }
};
