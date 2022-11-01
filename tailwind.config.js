/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
    container: {
      center: true,
      padding: '1rem'

    },
    fontFamily:{
      'sans': ['Rubik', 'ui-sans-serif', 'system-ui', 'sans-serif']
    }
  },
  plugins: [],
}
