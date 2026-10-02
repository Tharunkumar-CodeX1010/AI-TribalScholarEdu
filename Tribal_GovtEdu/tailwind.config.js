/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        gov: {
          navy: '#0b2545',
          darkBlue: '#134074',
          blue: '#1d4ed8',
          lightBlue: '#eef4ff',
          accent: '#c59b27',
          gold: '#d97706',
          emerald: '#059669',
          crimson: '#dc2626',
          purple: '#6d28d9',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
