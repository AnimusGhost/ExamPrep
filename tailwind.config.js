/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f2f7ff',
          100: '#dbe8ff',
          200: '#b5d1ff',
          300: '#87b3ff',
          400: '#5e8cff',
          500: '#3b6bff',
          600: '#2a51d1',
          700: '#2142ab',
          800: '#1f3a8a',
          900: '#1a2f6b'
        },
        ink: {
          900: '#0b1020',
          800: '#1a2138',
          700: '#2b3550'
        }
      },
      boxShadow: {
        card: '0 10px 30px rgba(15, 23, 42, 0.12)',
        soft: '0 6px 20px rgba(15, 23, 42, 0.08)'
      }
    }
  },
  plugins: []
};
