/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/ui/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#204391',
      },
      fontFamily: {
        sans: ['"Lexend"', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
