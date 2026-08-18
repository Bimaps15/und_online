import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        forest: '#0b2418',
        evergreen: '#123524',
        emerald: '#1f5c3a',
        sage: '#9caf88',
        cream: '#f5f0df',
        gold: '#d4bd7f',
      },
      fontFamily: {
        serif: ['Cormorant Garamond', 'serif'],
        script: ['Great Vibes', 'cursive'],
        sans: ['Manrope', 'sans-serif'],
      },
    },
  },
  plugins: [],
} satisfies Config
