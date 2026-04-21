/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html"
  ],
  theme: {
    extend: {
      colors: {
        primary: '#1e293b',
        secondary: '#475569',
        danger: '#ef4444',
        warning: '#f59e0b',
        success: '#22c55e'
      }
    },
  },
  plugins: [],
}