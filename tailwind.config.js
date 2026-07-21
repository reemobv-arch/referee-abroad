/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#44A546',
          dark: '#2F7D33',
          light: '#E7F4E1',
        },
        ink: '#1b1b1b',
        page: '#f4f5f4',
      },
      fontFamily: {
        sans: ['"Baloo 2"', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card: '0 1px 0 #ececec, 0 6px 20px -12px rgba(0,0,0,0.15)',
      },
    },
  },
  plugins: [],
}
