/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./App.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#30bae8",
          dark: "#259ac0",
        },
        secondary: {
          DEFAULT: "#10b981",
          dark: "#059669",
        },
        accent: {
          orange: "#f59e0b",
          purple: "#8b5cf6",
          pink: "#ec4899",
        },
        background: {
          DEFAULT: "#f8fbfc",
          light: "#f8fbfc",
          dark: "#111d21",
        },
        surface: {
          DEFAULT: "#ffffff",
          light: "#ffffff",
          dark: "#1a2c32",
          elevated: "#ffffff", // heavy lift for dark mode handling in classes
          "elevated-dark": "#233840",
        },
        text: {
          DEFAULT: "#0e181b",
          primary: {
            DEFAULT: "#0e181b",
            light: "#0e181b",
            dark: "#e0e6e8",
          },
          secondary: {
            DEFAULT: "#4f626b",
            light: "#4f626b",
            dark: "#9ba8ae",
          },
          inverse: {
            DEFAULT: "#ffffff",
            dark: "#0e181b",
          },
        },
        border: {
          DEFAULT: "#e2e8f0",
          item: "#e2e8f0",
          dark: "#2d4a53",
        },
        status: {
          success: "#10b981",
          error: "#ef4444",
          warning: "#f59e0b",
          info: "#3b82f6",
        },
        // Legacy support to avoid breaking immediately (optional, but good practice)
        "background-light": "#f8fbfc",
        "background-dark": "#111d21",
        "surface-light": "#ffffff",
        "surface-dark": "#1a2c32",
        "text-main-light": "#0e181b",
        "text-main-dark": "#e0e6e8",
        "text-sub-light": "#4f626b",
        "text-sub-dark": "#9ba8ae",
      },
      fontFamily: {
        sans: ["Manrope", "Plus Jakarta Sans", "sans-serif"],
        primary: ["Manrope", "sans-serif"],
        secondary: ["Plus Jakarta Sans", "sans-serif"],
      },
      fontSize: {
        xxs: "10px",
        xs: "12px",
        sm: "14px",
        base: "16px",
        lg: "18px",
        xl: "20px",
        xxl: "24px",
        xxxl: "32px",
      },
      borderRadius: {
        xl: "24px",
        "2xl": "32px",
        "3xl": "48px",
      },
      spacing: {
        0.5: "2px",
        1.5: "6px",
      },
      boxShadow: {
        soft: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
        card: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
        elevated: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
      },
    },
  },
  plugins: [],
}
