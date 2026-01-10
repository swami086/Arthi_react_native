import type { Config } from 'tailwindcss';
import { colors, typography, spacing, borderRadius } from './design-system/tokens';

const config: Config = {
    content: [
        './app/**/*.{js,ts,jsx,tsx,mdx}',
        './components/**/*.{js,ts,jsx,tsx,mdx}',
        './features/**/*.{js,ts,jsx,tsx,mdx}',
    ],
    darkMode: 'class',
    theme: {
        extend: {
            colors: {
                primary: colors.primary,
                secondary: colors.secondary,
                accent: colors.accent,
                background: colors.background,
                surface: colors.surface,
                text: colors.text,
                border: colors.border,
                status: colors.status,
            },
            fontFamily: {
                primary: typography.fontFamily.primary,
                secondary: typography.fontFamily.secondary,
            },
            fontSize: typography.fontSize,
            fontWeight: typography.fontWeight,
            lineHeight: typography.lineHeight,
            spacing: spacing,
            borderRadius: borderRadius,
        },
    },
    plugins: [],
};

export default config;
