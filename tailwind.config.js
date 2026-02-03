/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        // Backgrounds
        'brand-primary': '#0A0E27',
        'brand-card': '#0F1629',
        'brand-card-hover': '#141B2E',
        'brand-elevated': '#1A2332',
        
        // Accents
        'accent-cyan': '#00D9FF',
        'accent-success': '#00E676',
        'accent-warning': '#FF9F40',
        'accent-danger': '#FF4757',
        'accent-critical': '#D32F2F',

        // Neutrals
        'text-primary': '#FFFFFF',
        'text-secondary': 'rgba(255,255,255,0.7)',
        'text-tertiary': '#8B93B0',
        'text-disabled': 'rgba(255,255,255,0.3)',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        display: ['Manrope', 'sans-serif'],
        mono: ['IBM Plex Mono', 'monospace'],
      },
      boxShadow: {
        'card': '0 2px 8px rgba(0,0,0,0.12)',
        'card-hover': '0 8px 24px rgba(0,0,0,0.24)',
        'glow-cyan': '0 0 16px rgba(0,217,255,0.4)',
        'glow-success': '0 0 16px rgba(0,230,118,0.4)',
        'glow-danger': '0 0 16px rgba(255,71,87,0.4)',
      },
      keyframes: {
        slideIn: {
          "0%": { opacity: "0", transform: "translateY(-8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        fadeInUp: {
          "0%": { opacity: "0", transform: "translateY(32px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        'pulse-slow': {
          "0%, 100%": { transform: "scale(1)", opacity: "1" },
          "50%": { transform: "scale(1.03)", opacity: "0.9" },
        }
      },
      animation: {
        slideIn: "slideIn 0.2s ease-out",
        fadeInUp: "fadeInUp 0.6s ease-out forwards",
        'pulse-slow': "pulse-slow 2s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
