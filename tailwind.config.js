/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Core surfaces & ink
        border: 'var(--border)',
        background: 'var(--bg)',
        'bg-subtle': 'var(--bg-subtle)',
        surface: 'var(--surface)',
        'surface-1': 'var(--surface-1)',
        'surface-2': 'var(--surface-2)',
        'surface-3': 'var(--surface-3)',
        'surface-highlight': 'var(--surface-highlight)',
        'surface-elevated': 'var(--surface-elevated)',
        'surface-muted': 'var(--surface-muted)',
        text: 'var(--text)',
        'text-muted': 'var(--text-muted)',
        ink: 'var(--ink)',
        'ink-2': 'var(--ink-2)',
        'ink-3': 'var(--ink-3)',
        'ink-4': 'var(--ink-4)',

        // Borders
        'border-default': 'var(--border-default)',
        'border-subtle': 'var(--border-subtle)',
        'border-soft': 'var(--border-soft)',

        // Gold accents
        gold: 'var(--gold)',
        'gold-dark': 'var(--gold-dark)',
        'gold-light': 'var(--gold-light)',
        'gold-soft': 'var(--gold-soft)',

        // Semantic / primary (aliased onto the cream/gold palette)
        primary: 'var(--primary)',
        'primary-light': 'var(--primary-light)',
        secondary: 'var(--secondary)',
        success: 'var(--success)',
        warning: 'var(--warning)',
        error: 'var(--error)',
        info: 'var(--info)',

        // Legacy majestic aliases (kept for older components, now cream/gold)
        'majestic-dark': 'var(--majestic-dark)',
        'majestic-light': 'var(--majestic-light)',

        // Warm / cream
        warm: 'var(--warm)',
        cream: 'var(--cream)',

        // Section tints (desaturated)
        quran: 'var(--quran)',
        'quran-light': 'var(--quran-light)',
        search: 'var(--search)',
        'search-light': 'var(--search-light)',
        library: 'var(--library)',
        'library-light': 'var(--library-light)',
        duas: 'var(--duas)',
        'duas-light': 'var(--duas-light)',
        hifz: 'var(--hifz)',
        'hifz-light': 'var(--hifz-light)',
        learn: 'var(--learn)',
        'learn-light': 'var(--learn-light)',
      },
      fontFamily: {
        arabic: ['var(--font-arabic)', 'Noto Naskh Arabic', 'serif'],
        bengali: ['var(--font-bengali-ui)', 'Noto Sans Bengali', 'sans-serif'],
        sans: ['var(--font-ui)'],
        display: ['var(--font-display)', 'Georgia', 'serif'],
      },
      boxShadow: {
        soft: 'var(--shadow-soft)',
        elevated: 'var(--shadow-elevated)',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-up': 'slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
        'scale-in': 'scaleIn 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.9)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
      },
    },
  },
  plugins: [],
}
