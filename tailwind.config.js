/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        green: {
          50:  '#E1F5EE',
          100: '#9FE1CB',
          500: '#1D9E75',
          600: '#0F6E56',
        },
        amber: {
          50:  '#FAEEDA',
          600: '#854F0B',
        },
        red: {
          50:  '#FCEBEB',
          600: '#A32D2D',
        },
        blue: {
          50:  '#E6F1FB',
          600: '#185FA5',
        },
      },
      fontFamily: {
        sans: ['Sarabun', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
