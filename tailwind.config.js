/** @type {import('tailwindcss').Config} */

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    container: {
      center: true,
    },
    extend: {
      colors: {
        primary: {
          50: '#eef2f7',
          100: '#d4dde9',
          200: '#a9bfd4',
          300: '#7ea1be',
          400: '#5383a8',
          500: '#1e3a5f',
          600: '#1a3251',
          700: '#152943',
          800: '#112135',
          900: '#0c1827',
        },
        accent: {
          gold: '#c9a96e',
          'gold-light': '#e0d0a8',
          'gold-dark': '#a8884e',
          coral: '#e07b5a',
          'coral-light': '#eb9f87',
          'coral-dark': '#c45a3a',
          success: '#4caf7d',
          'success-light': '#6ecf9d',
        },
        surface: {
          paper: '#faf8f5',
          card: '#ffffff',
          ink: '#3d4f5f',
          'ink-light': '#6b7d8e',
          border: '#e8e4df',
        }
      },
      fontFamily: {
        serif: ['"Noto Serif SC"', 'Georgia', 'serif'],
        sans: ['"Noto Sans SC"', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'Menlo', 'monospace'],
      },
      borderRadius: {
        'btn': '8px',
      },
      boxShadow: {
        'card': '0 1px 3px rgba(30, 58, 95, 0.06), 0 1px 2px rgba(30, 58, 95, 0.04)',
        'card-hover': '0 4px 12px rgba(30, 58, 95, 0.1), 0 2px 4px rgba(30, 58, 95, 0.06)',
        'btn': '0 1px 2px rgba(30, 58, 95, 0.1)',
        'modal': '0 20px 60px rgba(30, 58, 95, 0.15)',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'slide-right': 'slideRight 0.3s ease-out',
        'pulse-soft': 'pulseSoft 2s infinite',
        'check': 'check 0.4s ease-out',
        'shake': 'shake 0.4s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideRight: {
          '0%': { opacity: '0', transform: 'translateX(-10px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.6' },
        },
        check: {
          '0%': { transform: 'scale(0)' },
          '50%': { transform: 'scale(1.2)' },
          '100%': { transform: 'scale(1)' },
        },
        shake: {
          '0%, 100%': { transform: 'translateX(0)' },
          '25%': { transform: 'translateX(-4px)' },
          '75%': { transform: 'translateX(4px)' },
        },
      },
    },
  },
  plugins: [],
};