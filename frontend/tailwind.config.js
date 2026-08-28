/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ivory: '#F7F3EC',
        'ivory-dark': '#EDE8DF',
        charcoal: '#1C1A17',
        'charcoal-light': '#2E2C28',
        'warm-charcoal': '#1C1A17',
        brass: '#A8823D',
        'brass-dark': '#8A6A2F',
        'brass-light': '#C9A55A',
        gold: '#A8823D',
        stone: '#DDD5C7',
        'stone-light': '#EDE8DF',
        'stone-dark': '#B8AFA3',
        'warm-taupe': '#DDD5C7',
        muted: '#6B6560',
        cream: '#FAF7F2',
        success: '#4A7C59',
        error: '#B84040',
      },
      fontFamily: {
        display: ['"Playfair Display"', 'Georgia', 'serif'],
        body: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      fontSize: {
        'display-2xl': ['4.5rem', { lineHeight: '1.1', letterSpacing: '-0.02em' }],
        'display-xl': ['3.75rem', { lineHeight: '1.1', letterSpacing: '-0.02em' }],
        'display-lg': ['3rem', { lineHeight: '1.15', letterSpacing: '-0.01em' }],
        'display-md': ['2.25rem', { lineHeight: '1.2' }],
        'display-sm': ['1.875rem', { lineHeight: '1.3' }],
      },
      gridTemplateRows: {
        '2': 'repeat(2, minmax(0, 1fr))',
      },
      spacing: {
        18: '4.5rem',
        22: '5.5rem',
        88: '22rem',
        128: '32rem',
      },
      animation: {
        'ticker': 'ticker 30s linear infinite',
        'fade-in': 'fadeIn 0.5s ease forwards',
        'slide-in-right': 'slideInRight 0.35s ease forwards',
        'slide-in-up': 'slideInUp 0.4s ease forwards',
        'spin-slow': 'spin 8s linear infinite',
        'pulse-soft': 'pulseSoft 2s ease-in-out infinite',
      },
      keyframes: {
        ticker: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideInRight: {
          '0%': { transform: 'translateX(100%)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        slideInUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
        },
      },
      transitionTimingFunction: {
        'luxury': 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
      },
      backdropBlur: {
        xs: '2px',
      },
      boxShadow: {
        'luxury': '0 4px 24px rgba(28, 26, 23, 0.08)',
        'luxury-lg': '0 8px 48px rgba(28, 26, 23, 0.12)',
        'luxury-xl': '0 16px 64px rgba(28, 26, 23, 0.16)',
        'brass': '0 4px 24px rgba(168, 130, 61, 0.25)',
      },
    },
  },
  plugins: [],
};
