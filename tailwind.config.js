/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        display: ['Plus Jakarta Sans', 'Georgia', 'serif'],
        body: ['Plus Jakarta Sans', 'sans-serif'],
        mono: ['Plus Jakarta Sans', 'monospace'],
      },
      colors: {
        forest: {
          50:  '#f0f5f0',
          100: '#dceadc',
          200: '#b8d5b8',
          300: '#8ab88a',
          400: '#5a9a5a',
          500: '#3a7d3a',
          600: '#2d6230',
          700: '#224d25',
          800: '#173a1a',
          900: '#0e270f',
          950: '#071309',
        },
        cream: '#f5f2eb',
      },
      animation: {
        'fade-in': 'fadeIn 0.6s ease forwards',
        'slide-up': 'slideUp 0.5s ease forwards',
        'pulse-soft': 'pulseSoft 2s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: { from: { opacity: '0' }, to: { opacity: '1' } },
        slideUp: { from: { opacity: '0', transform: 'translateY(16px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        pulseSoft: { '0%,100%': { opacity: '1' }, '50%': { opacity: '0.6' } },
      },
    },
  },
  plugins: [],
}
