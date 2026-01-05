/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // EverettYoung Brand Colors
        background: '#1E222B',
        primary: {
          DEFAULT: '#8484E6',
          green: '#A2C799',
        },
        accent: '#587553',
        neutral: {
          light: '#B5BAD0',
          DEFAULT: '#9297A8',
        },
      },
      fontFamily: {
        sans: ['Liter', 'system-ui', 'Arial', 'sans-serif'],
      },
      spacing: {
        // 4px base spacing system
        '1': '4px',
        '2': '8px',
        '3': '12px',
        '4': '16px',
        '6': '24px',
        '8': '32px',
        '12': '48px',
      },
      fontSize: {
        // Type scale: 14px base, 1.25 ratio
        'base': '14px',
        'lg': '18px',
        'xl': '22px',
        '2xl': '28px',
        '3xl': '35px',
        '4xl': '44px',
      },
      borderRadius: {
        'DEFAULT': '8px',
      },
      boxShadow: {
        'card': '0 1px 3px rgba(0,0,0,0.1)',
      },
    },
  },
  plugins: [],
}
