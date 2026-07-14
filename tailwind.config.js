/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      colors: {
        darkBg: '#0B0B12',
        darkCard: '#12131F',
        darkSidebar: '#10101B',
        primary: '#7C6CFF',
        secondary: '#A68CFF',
        success: '#16C784',
        warning: '#F5A623',
        error: '#FF5D73',
      },
      borderRadius: {
        '2xl': '16px',
      },
      boxShadow: {
        glow: '0 0 20px rgba(124, 108, 255, 0.15)',
        'glow-lg': '0 0 35px rgba(124, 108, 255, 0.25)',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(12px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
      animation: {
        fadeIn: 'fadeIn 0.3s ease-out forwards',
        slideUp: 'slideUp 0.3s ease-out forwards',
      }
    },
  },
  plugins: [],
}
