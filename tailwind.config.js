/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    screens: {
      'sm': '640px',
      // => @media (min-width: 640px) { ... }

      'md': '768px',
      // => @media (min-width: 768px) { ... }

      'lg': '900px',
      // => @media (min-width: 1024px) { ... }

      'xl': '1280px',
      // => @media (min-width: 1280px) { ... }

      '2xl': '1536px',
      // => @media (min-width: 1536px) { ... }
    },
    extend: {
      colors: {
        primary: {
          DEFAULT: '#1E88E5', // Blue
          light: '#63B8FF',  // Light Blue
          dark: '#005CB2',   // Dark Blue
        },
        secondary: {
          DEFAULT: '#FFC107', // Gold/Yellow
          light: '#FFD54F',   // Light Yellow
          dark: '#FF8F00',    // Dark Yellow
        },
        neutral: {
          DEFAULT: '#F5F5F5', // Light Gray (Background)
          dark: '#9E9E9E',    // Neutral Gray
          light: '#E0E0E0',   // Divider/Secondary Background
        },
        success: {
          DEFAULT: '#43A047', // Green
          light: '#66BB6A',   // Light Green
          dark: '#2E7D32',    // Dark Green
        },
        danger: {
          DEFAULT: '#E53935', // Red
          light: '#EF5350',   // Light Red
          dark: '#B71C1C',    // Dark Red
        },
        info: {
          DEFAULT: '#26C6DA', // Teal
          light: '#4DD0E1',   // Light Teal
          dark: '#00838F',    // Dark Teal
        },
        text: {
          DEFAULT: '#212121', // Dark Charcoal
          secondary: '#757575', // Secondary Text
        },
      },
    },
  },
  plugins: [],
};
