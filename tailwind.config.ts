import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        background: '#0a0a0c',
        foreground: '#e8e8e8',
        accent: '#b8f53e',
        'accent-dim': '#8bc62e',
        card: '#141418',
        'card-hover': '#1a1a20',
        border: '#2a2a32',
        muted: '#6b6b78',
        danger: '#ef4444',
        warning: '#f59e0b',
        info: '#3b82f6',
      },
      fontFamily: {
        display: ['Orbitron', 'sans-serif'],
        body: ['Noto Sans TC', 'sans-serif'],
      },
    },
  },
  plugins: [],
  container: {
    center: true,
    padding: '1rem',
  },
}

export default config
