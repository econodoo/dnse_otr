/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'car-black': '#0a0b0e',
        'car-card': '#14171f',
        'car-card-hover': '#1d222e',
        'car-border': '#262c3d',
        'car-green': '#00e676',
        'car-red': '#ff1744',
        'car-purple': '#e040fb',
        'car-yellow': '#ffd600',
        'car-cyan': '#00e5ff',
        'car-blue': '#2979ff',
      },
    },
  },
  plugins: [],
}
