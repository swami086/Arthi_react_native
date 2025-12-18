/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./App.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        primary: "#30bae8",
        "primary-dark": "#259ac0",

        background: "#f8fbfc",
        "background-light": "#f8fbfc",
        "background-dark": "#111d21",

        surface: "#ffffff",
        "surface-light": "#ffffff",
        "surface-dark": "#1a2c32",

        text: "#0e181b",
        "text-main-light": "#0e181b",
        "text-main-dark": "#e0e6e8",

        "text-sub-light": "#4e8597",
        "text-sub-dark": "#9ba8ae",

        secondary: "#10b981",
        error: "#ef4444",
      },
      fontFamily: {
        sans: ["Plus Jakarta Sans", "Manrope", "sans-serif"],
      },
      boxShadow: {
        soft: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
        card: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
      },
    },
  },
  plugins: [],
}
