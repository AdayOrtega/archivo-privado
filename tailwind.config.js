/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['Cormorant Garamond', 'Georgia', 'serif'],
        body: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'SFMono-Regular', 'Consolas', 'monospace'],
      },
      colors: {
        ink: '#080807',
        obsidian: '#11100e',
        velvet: '#4a161d',
        brass: '#d8b36a',
        champagne: '#f1e2bf',
        smoke: '#9a9388',
        pine: '#163a32',
        ember: '#b7563a',
      },
      boxShadow: {
        aureate: '0 0 0 1px rgba(216, 179, 106, .18), 0 24px 70px rgba(0,0,0,.42)',
      },
    },
  },
  plugins: [],
};
