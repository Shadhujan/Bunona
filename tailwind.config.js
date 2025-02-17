/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0) rotate(0deg)' },
          '25%': { transform: 'translateY(-30px) rotate(15deg)' },
          '50%': { transform: 'translateY(0) rotate(0deg)' },
          '75%': { transform: 'translateY(30px) rotate(-15deg)' }
        },
        spring: {
          '0%': { transform: 'scale(0)', opacity: '0' },
          '50%': { transform: 'scale(1.3)', opacity: '0.5' },
          '75%': { transform: 'scale(0.7)', opacity: '0.75' },
          '100%': { transform: 'scale(1)', opacity: '1' }
        }
      },
      animation: {
        float: 'float 4s ease-in-out infinite',
        spring: 'spring 0.8s ease-out forwards'
      }
    },
  },
  plugins: [],
};