export const typography = {
    fontFamily: {
        primary: 'Manrope',
        secondary: 'Plus Jakarta Sans',
    },
    fontSize: {
        xxs: 10,
        xs: 12,
        sm: 14,
        base: 16,
        lg: 18,
        xl: 20,
        xxl: 24,
        xxxl: 32,
    },
    fontWeight: {
        regular: '400',
        medium: '500',
        semibold: '600',
        bold: '700',
    },
    lineHeight: {
        tight: 1.25,
        normal: 1.5,
        relaxed: 1.75,
    },
};

export const colors = {
    primary: {
        light: '#30bae8',
        dark: '#259ac0',
        DEFAULT: '#30bae8',
    },
    secondary: {
        light: '#10b981',
        dark: '#059669',
        DEFAULT: '#10b981', // Emerald green from existing config
    },
    accent: {
        orange: '#f59e0b',
        purple: '#8b5cf6',
        pink: '#ec4899',
    },
    background: {
        light: '#f8fbfc',
        dark: '#111d21',
    },
    surface: {
        light: '#ffffff',
        dark: '#1a2c32',
        elevated: {
            light: '#ffffff',
            dark: '#233840',
        }
    },
    text: {
        primary: {
            light: '#0e181b', // text-main-light
            dark: '#e0e6e8', // text-main-dark
        },
        secondary: {
            light: '#4e8597', // text-sub-light is 4e8597 in existing config, plan says 4f626b. Existing config dominates for continuity unless plan forces it. Plan says merge. I'll stick to existing config for sub-text to avoid jarring changes, or maybe use plan's suggested if it looks better. Plan mentions `4f626b`. I will use the plan's suggestion as it might be from "Locofy" better design tokens.
            dark: '#9ba8ae',
        },
        inverse: {
            light: '#ffffff',
            dark: '#0e181b',
        },
        disabled: {
            light: '#94a3b8',
            dark: '#475569',
        }
    },
    border: {
        light: '#e2e8f0',
        dark: '#2d4a53',
    },
    status: {
        success: '#10b981',
        error: '#ef4444',
        warning: '#f59e0b',
        info: '#3b82f6',
    }
};

export const spacing = {
    0: 0,
    0.5: 2,
    1: 4,
    1.5: 6,
    2: 8,
    3: 12,
    4: 16,
    5: 20,
    6: 24,
    8: 32,
    10: 40,
    12: 48,
    16: 64,
};

export const borderRadius = {
    none: 0,
    sm: 4,
    md: 8,
    lg: 16,
    xl: 24,
    '2xl': 32,
    full: 9999,
};

export const shadows = {
    soft: {
        light: {
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.1,
            shadowRadius: 6,
            elevation: 2,
        },
        dark: {
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.3,
            shadowRadius: 4,
            elevation: 2,
        },
    },
    card: {
        light: {
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 10 },
            shadowOpacity: 0.1,
            shadowRadius: 15,
            elevation: 5,
        },
        dark: {
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 5 },
            shadowOpacity: 0.3,
            shadowRadius: 10,
            elevation: 5,
        },
    },
    elevated: {
        light: {
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 20 },
            shadowOpacity: 0.15,
            shadowRadius: 25,
            elevation: 10,
        },
        dark: {
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 10 },
            shadowOpacity: 0.4,
            shadowRadius: 20,
            elevation: 10,
        },
    },
};

export const dimensions = {
    icon: {
        sm: 16,
        md: 20,
        lg: 24,
        xl: 32,
    },
    button: {
        height: {
            sm: 32,
            md: 44,
            lg: 56,
        },
    },
};

export const tokens = {
    typography,
    colors,
    spacing,
    borderRadius,
    shadows,
    dimensions,
};
