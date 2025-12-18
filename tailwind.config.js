/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./App.{js,jsx,ts,tsx}', './src/**/*.{js,jsx,ts,tsx}'],
  darkMode: 'class',
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: '#30bae8',
        'primary-dark': '#259bc2',
        secondary: '#6d13ec', // Adding the second primary color mentioned in step 1
        'background-light': '#f6f7f8',
        'background-dark': '#111d21',
        'text-main-light': '#0e181b',
        'text-main-dark': '#ffffff',
        'text-sub-light': '#4e8597',
        'text-sub-dark': '#9abec9',
      },
      fontFamily: {
        display: ['Plus Jakarta Sans', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
