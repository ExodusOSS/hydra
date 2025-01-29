import plugin from 'tailwindcss/plugin'
import forms from '@tailwindcss/forms'

const hideScrollbarPlugin = plugin(({ addUtilities }) => {
  addUtilities({
    '.scrollbar-hide': {
      // For Firefox.
      'scrollbar-width': 'none',
      // For Chrome, Safari, and Edge.
      '&::-webkit-scrollbar': {
        display: 'none',
      },
    },
  })
})

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/ui/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        deep: {
          50: '#1a1d2a',
          100: '#151827',
          200: '#121423',
          300: '#0e101f',
          400: '#0a0c1b',
          500: '#070818',
          600: '#030712',
          700: '#02050e',
          800: '#01040b',
          900: '#000309',
        },
      },
    },
  },
  plugins: [hideScrollbarPlugin, forms],
}
