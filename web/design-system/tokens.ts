export const typography = {
    fontFamily: {
        primary: ['var(--font-manrope)', 'sans-serif'],
        secondary: ['var(--font-plus-jakarta)', 'sans-serif'],
    },
    fontSize: {
        xxs: '0.625rem',    // 10px
        xs: '0.75rem',      // 12px
        sm: '0.875rem',     // 14px
        base: '1rem',       // 16px
        lg: '1.125rem',     // 18px
        xl: '1.25rem',      // 20px
        xxl: '1.5rem',      // 24px
        xxxl: '2rem',       // 32px
    },
    fontWeight: {
        regular: 400,
        medium: 500,
        semibold: 600,
        bold: 700,
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
        DEFAULT: '#10b981',
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
            light: '#0e181b',
            dark: '#e0e6e8',
        },
        secondary: {
            light: '#4e8597',
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
    0: '0',
    0.5: '0.125rem',
    1: '0.25rem',
    1.5: '0.375rem',
    2: '0.5rem',
    3: '0.75rem',
    4: '1rem',
    5: '1.25rem',
    6: '1.5rem',
    8: '2rem',
    10: '2.5rem',
    12: '3rem',
    16: '4rem',
};

export const borderRadius = {
    none: '0',
    sm: '0.25rem',
    md: '0.5rem',
    lg: '1rem',
    xl: '1.5rem',
    '2xl': '2rem',
    full: '9999px',
};
