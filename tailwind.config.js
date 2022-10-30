/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
    container: {
      center: true,
    },
    fontFamily:{
      'sans': ['Rubik', 'ui-sans-serif', 'system-ui', 'sans-serif']
    }
  },
  plugins: [],
}
