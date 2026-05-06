/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./App.tsx",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Manrope', 'sans-serif'],
        serif: ['Cinzel', 'serif'],
      },
      colors: {
        ivory: {
          50: '#FDFCFB',
          100: '#F9F8F6',
          200: '#F2F0EB',
        },
        charcoal: {
          800: '#2D2A26',
          900: '#1A1816',
        },
        gold: {
          400: '#D4AF37', // Muted metallic gold
          500: '#C5A059',
          600: '#997B3D',
        },
        cosmic: {
          50: '#F0F2F6',
          100: '#E6E6FA',
          200: '#C5CCDA',
          300: '#8A99B3',
          400: '#6C7E9E',
          500: '#4F5D75', // Muted Indigo
          600: '#3D495E',
          700: '#2A354A',
          800: '#1A2234',
          900: '#0F1626',
          950: '#0A0E17',
        }
      },
      backgroundImage: {
        'constellation': "url('https://www.transparenttextures.com/patterns/stardust.png')",
      }
    }
  },
  plugins: [],
}
