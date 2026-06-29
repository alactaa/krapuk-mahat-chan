/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        dark: '#1A1A2E',
        card: 'rgba(255,255,255,0.08)',
        green: '#00C853',
        red: '#FF3D00',
        gold: '#FFD600',
        purple: '#9C27B0',
      },
      fontFamily: {
        mitr: ['Mitr', 'sans-serif'],
      },
      borderRadius: {
        '2xl': '20px',
        '3xl': '28px',
      },
    },
  },
  plugins: [],
}
