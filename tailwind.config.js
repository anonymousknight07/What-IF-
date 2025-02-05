/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#1e1c0b',
        secondary: '#2a2815',
        accent: '#ffefe3',
      },
    },
  },
  plugins: [],
};