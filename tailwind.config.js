/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        prism: {
          50: '#f7f7f8',
          100: '#ececef',
          200: '#d5d5db',
          300: '#b1b1bc',
          400: '#868695',
          500: '#4a4a57',
          600: '#3a3a45',
          700: '#2d2d36',
          800: '#1f1f26',
          900: '#18181d',
          950: '#0f0f12',
        },
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'system-ui', '-apple-system', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
