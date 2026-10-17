/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        party: {
          dark: '#0a051b',
          surface: '#130c2e',
          card: '#1b123d',
          border: '#2c1e63',
          pink: '#ff2a85',
          cyan: '#00f0ff',
          purple: '#8b5cf6',
          yellow: '#facc15',
          emerald: '#10b981',
        },
      },
      fontFamily: {
        sans: ['Outfit', 'Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'pulse-glow': 'pulseGlow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 3s ease-in-out infinite',
        'spin-slow': 'spin 12s linear infinite',
        'bounce-subtle': 'bounceSubtle 1.5s ease-in-out infinite',
      },
      keyframes: {
        pulseGlow: {
          '0%, 100%': { opacity: '1', filter: 'drop-shadow(0 0 15px rgba(255, 42, 133, 0.6))' },
          '50%': { opacity: '0.7', filter: 'drop-shadow(0 0 5px rgba(0, 240, 255, 0.4))' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        bounceSubtle: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-4px)' },
        },
      },
    },
  },
  plugins: [],
}

