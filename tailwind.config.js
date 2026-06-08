/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // Soft, welcoming church palette.
        navy: {
          DEFAULT: '#1e3a5f',
          light: '#2f4f78',
          dark: '#16293f'
        },
        sage: {
          DEFAULT: '#7c9885',
          light: '#9bb3a3',
          dark: '#5f7a68',
          mist: '#eef2ee'
        },
        gold: {
          DEFAULT: '#c8a96a',
          light: '#dec798',
          dark: '#a8884c',
          mist: '#f7f1e3'
        },
        cream: '#fbfaf7',
        ink: '#2b2b2b'
      },
      fontFamily: {
        // Distinctive but highly readable pairing: a warm serif for display,
        // a clean humanist sans for body text (large + accessible for older members).
        display: ['"Fraunces"', 'Georgia', 'serif'],
        sans: ['"Source Sans 3"', 'system-ui', 'sans-serif']
      },
      borderRadius: {
        xl: '1rem',
        '2xl': '1.5rem',
        '3xl': '2rem'
      },
      boxShadow: {
        card: '0 2px 16px rgba(30, 58, 95, 0.08)',
        'card-hover': '0 6px 28px rgba(30, 58, 95, 0.14)',
        soft: '0 1px 3px rgba(30, 58, 95, 0.06)'
      },
      fontSize: {
        // Slightly larger base scale for readability.
        base: ['1.0625rem', { lineHeight: '1.65' }]
      }
    }
  },
  plugins: []
}
