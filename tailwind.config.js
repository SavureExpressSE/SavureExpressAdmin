/** @type {import('tailwindcss').Config} */

export default {
  purge: [],
  darkMode: false,
  theme: {
    extend: {
      colors: {
        // Brand colors
        primary: '#6c72ff', // Primary Blue
        secondary: {
          dark: '#101935', // Deep Navy
          base: '#343B4f', // Dark Gray Blue
          accent1: '#57c3ff', // Bright Cyan
          accent2: '#9a91fb', // Soft Lavender
          accent3: '#fdb52a', // Yellow Accent
        },

        // Neutral palette
        neutral: {
          900: '#080f25', // Almost Black
          800: '#212c4d', // Dark Blue Gray
          700: '#37446b', // Muted Navy
          600: '#7e89ac', // Steel Blue
          500: '#aeb9e1', // Pale Blue
          400: '#d1dbf9', // Soft Blue Tint
          300: '#d9e1fa', // Light Tint
          100: '#ffffff', // White
        },
      },
    },
  },
  variants: {
    extend: {},
  },
  plugins: [],
}
