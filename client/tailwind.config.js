/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        base: 'rgb(var(--bg-base) / <alpha-value>)',
        elevated: 'rgb(var(--bg-elevated) / <alpha-value>)',
        muted: 'rgb(var(--bg-muted) / <alpha-value>)',
        foreground: 'rgb(var(--text-primary) / <alpha-value>)',
        subtle: 'rgb(var(--text-muted) / <alpha-value>)',
        border: 'rgb(var(--border-default) / <alpha-value>)',
        accent: {
          DEFAULT: 'rgb(var(--accent) / <alpha-value>)',
          hover: 'rgb(var(--accent-hover) / <alpha-value>)',
        },
        brand: {
          primary: 'rgb(var(--primary) / <alpha-value>)',
          secondary: 'rgb(var(--secondary) / <alpha-value>)',
        },
      },
      textColor: {
        primary: 'rgb(var(--text-primary) / <alpha-value>)',
        secondary: 'rgb(var(--text-secondary) / <alpha-value>)',
      },
      fontFamily: {
        // --portfolio-font already includes fallbacks; don't append more families after the var()
        sans: ['var(--portfolio-font)'],
        display: ['var(--marketing-display)', 'Georgia', 'serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      boxShadow: {
        glass: '0 8px 32px rgb(0 0 0 / 0.2), inset 0 1px 0 rgb(255 255 255 / 0.06)',
        'glass-lg': '0 16px 48px rgb(0 0 0 / 0.25), inset 0 1px 0 rgb(255 255 255 / 0.08)',
      },
      animation: {
        'fade-up': 'fadeUp 0.6s ease-out forwards',
      },
      keyframes: {
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
}
