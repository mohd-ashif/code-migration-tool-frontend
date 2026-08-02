/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      colors: {
        darkBg: '#0B0B12',
        darkCard: '#12131F',
        darkSidebar: '#10101B',
        darkModal: '#141525',
        darkPopover: '#18192C',
        darkInput: '#0F101A',
        primary: {
          DEFAULT: '#7C6CFF',
          hover: '#6B59FF',
          active: '#5A46FF',
          light: '#A68CFF',
          dark: '#4B36D9',
        },
        secondary: {
          DEFAULT: '#A68CFF',
          hover: '#9575FF',
        },
        success: {
          DEFAULT: '#16C784',
          hover: '#13B175',
        },
        warning: {
          DEFAULT: '#F5A623',
          hover: '#E0951C',
        },
        danger: {
          DEFAULT: '#FF5D73',
          hover: '#E84A60',
        },
        info: {
          DEFAULT: '#38BDF8',
          hover: '#0EA5E9',
        },
        border: {
          DEFAULT: '#1E1F35',
          subtle: '#171829',
          hover: '#2D2E4D',
        },
      },
      borderRadius: {
        xs: '4px',
        sm: '6px',
        md: '8px',
        lg: '12px',
        xl: '16px',
        '2xl': '20px',
      },
      boxShadow: {
        glow: '0 0 20px rgba(124, 108, 255, 0.2)',
        'glow-lg': '0 0 35px rgba(124, 108, 255, 0.35)',
        'glow-success': '0 0 20px rgba(22, 199, 132, 0.2)',
        'glow-danger': '0 0 20px rgba(255, 93, 115, 0.2)',
        'glow-warning': '0 0 20px rgba(245, 166, 35, 0.2)',
        card: '0 4px 12px rgba(0, 0, 0, 0.35)',
        dialog: '0 25px 50px -12px rgba(0, 0, 0, 0.75)',
        dropdown: '0 12px 28px rgba(0, 0, 0, 0.5)',
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
        pulseGlow: {
          '0%, 100%': { opacity: '1', filter: 'brightness(1)' },
          '50%': { opacity: '0.7', filter: 'brightness(1.2)' },
        },
      },
      animation: {
        fadeIn: 'fadeIn 0.3s ease-out forwards',
        slideUp: 'slideUp 0.3s ease-out forwards',
        pulseGlow: 'pulseGlow 2s ease-in-out infinite',
      }
    },
  },
  plugins: [],
}
