module.exports = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        purple: {
          100: '#F2F2F2',
          300: '#7765DA',
          400: '#5767D0',
          500: '#4F0DCE',
          600: '#4F0DCE',
          700: '#373737'
        },
        brand: {
          DEFAULT: '#4F0DCE',
          light: '#7765DA',
          mid: '#5767D0',
        },
        neutral: {
          100: '#F2F2F2',
          500: '#6E6E6E',
          700: '#373737'
        }
      }
    },
  },
  plugins: [],
}
