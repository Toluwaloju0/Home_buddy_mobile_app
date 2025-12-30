/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,html}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#10B981', // Green shade from the design
        dark: '#1F2937',
        light: '#F3F4F6'
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
