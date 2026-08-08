/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eef2ff',
          100: '#e0e7ff',
          200: '#c7d2fe',
          300: '#a5b4fc',
          400: '#818cf8',
          500: '#6366f1',
          600: '#4f46e5',
          700: '#4338ca',
          800: '#3730a3',
          900: '#312e81',
          950: '#1e1b4b',
          DEFAULT: '#4f46e5',
        },
        danger: {
          500: '#ef4444',
          DEFAULT: '#ef4444',
        },
        warning: {
          500: '#f59e0b',
          DEFAULT: '#f59e0b',
        },
        success: {
          500: '#10b981',
          DEFAULT: '#10b981',
        },
        dark: {
          900: '#0f172a',
          950: '#020617',
        },
      },
    },
  },
  plugins: [],
};
