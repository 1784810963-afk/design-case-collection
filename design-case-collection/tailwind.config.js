/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#5B7FFF',
          light: '#E8F0FF',
          dark: '#4A66CC'
        },
        neutral: {
          text: '#1A1A1A',
          secondary: '#666666',
          disabled: '#CCCCCC',
          border: '#E0E0E0',
          bg: '#F7F8FA'
        },
        success: '#52C41A',
        warning: '#FAAD14',
        error: '#FF4D4F'
      }
    },
  },
  plugins: [],
}
