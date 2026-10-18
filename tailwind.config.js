/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#635BDB',
          hover: '#5249CD',
          light: '#EEEDFD',
          dark: '#413AAB',
        },
        navy: {
          DEFAULT: '#171A35',
          light: '#23274E',
          card: '#1D2142',
        },
        mint: {
          DEFAULT: '#35C9A5',
          light: '#E6FAF5',
          dark: '#249E81',
        },
        danger: {
          DEFAULT: '#E85D75',
          light: '#FDECEF',
          dark: '#C73852',
        },
        warning: {
          DEFAULT: '#F2B84B',
          light: '#FEF8EC',
          dark: '#D19623',
        },
        surface: {
          light: '#F7F8FC',
          card: '#FFFFFF',
          border: '#E3E6F0',
          darkBg: '#0F1123',
          darkCard: '#171A35',
          darkBorder: '#272B4E',
        },
        ink: {
          primary: '#20243A',
          secondary: '#7B8197',
          muted: '#A5AABF',
          darkPrimary: '#F1F3FB',
          darkSecondary: '#9EA5BE',
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        'card': '0 2px 10px rgba(23, 26, 53, 0.04)',
        'card-hover': '0 8px 24px rgba(99, 91, 219, 0.1)',
        'modal': '0 20px 40px rgba(23, 26, 53, 0.2)',
      }
    },
  },
  plugins: [],
}
