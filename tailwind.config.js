/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: ["class"],
  plugins: [require('tailwindcss-flip')],
  theme: {
    extend: {},
  },
  plugins: [],
}