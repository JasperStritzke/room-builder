/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        "primary": "#EA5808",
        "secondary": "#33363F",
        "accent": "#D4D4D4"
      },
    },
  },
  plugins: [],
}