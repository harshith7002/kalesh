/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#000000',
        card: '#16181C',
        line: '#2F3336',
        gold: '#F59E0B',
        sky: '#1D9BF0',
        mute: '#71767B',
        text: '#E7E9EA',
        danger: '#F4212E',
      },
      keyframes: {
        pop: {
          '0%': { transform: 'scale(1)' },
          '40%': { transform: 'scale(1.45)' },
          '100%': { transform: 'scale(1)' },
        },
        rise: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slide: {
          '0%': { transform: 'translateX(100%)' },
          '100%': { transform: 'translateX(0)' },
        },
        glow: {
          '0%, 100%': { boxShadow: '0 0 6px rgba(244,33,46,.55), 0 0 0 rgba(244,33,46,0)' },
          '50%': { boxShadow: '0 0 16px rgba(244,33,46,.95), 0 0 34px rgba(244,33,46,.4)' },
        },
      },
      animation: {
        pop: 'pop .35s ease-out',
        rise: 'rise .3s ease-out both',
        slide: 'slide .22s ease-out both',
        glow: 'glow 1.6s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}
