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
  darkMode: 'class',
  content: ['./index.html', './src/ui/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        border: 'var(--border)',
        input: 'var(--input)',
        ring: 'var(--ring)',
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        primary: {
          DEFAULT: 'var(--primary)',
          foreground: 'var(--primary-foreground)',
        },
        secondary: {
          DEFAULT: 'var(--secondary)',
          foreground: 'var(--secondary-foreground)',
        },
        destructive: {
          DEFAULT: 'var(--destructive)',
          foreground: 'var(--destructive-foreground)',
        },
        muted: {
          DEFAULT: 'var(--muted)',
          foreground: 'var(--muted-foreground)',
        },
        accent: {
          DEFAULT: 'var(--accent)',
          foreground: 'var(--accent-foreground)',
        },
        popover: {
          DEFAULT: 'var(--background)',
          foreground: 'var(--foreground)',
        },
        card: {
          DEFAULT: 'var(--background)',
          foreground: 'var(--foreground)',
        },
        admonition: {
          green: 'var(--admonition-green)',
          'green-light': 'var(--admonition-green-light)',
          cyan: 'var(--admonition-cyan)',
          'cyan-light': 'var(--admonition-cyan-light)',
          orange: 'var(--admonition-orange)',
          'orange-light': 'var(--admonition-orange-light)',
          yellow: 'var(--admonition-yellow)',
          'yellow-light': 'var(--admonition-yellow-light)',
        },
      },
      backgroundImage: {
        'cta-gradient':
          'linear-gradient(to right, var(--cta-gradient-start), var(--cta-gradient-end))',
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'Inter'],
        inter: ['var(--font-inter)', 'Inter'],
        eudoxus: ['var(--font-eudoxus)', 'Eudoxus Sans'],
      },
      opacity: {
        2: '0.02',
        4: '0.04',
        8: '0.08',
        12: '0.12',
        16: '0.16',
        24: '0.24',
        32: '0.32',
        64: '0.64',
      },
    },
  },
  plugins: [hideScrollbarPlugin, forms],
}
