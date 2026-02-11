/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // 现代化主色系 - 深蓝 + 紫色混合（更专业）
        primary: {
          50: '#F0F4FF',
          100: '#E0EAFF',
          200: '#C5D9FF',
          300: '#A0BFFF',
          400: '#7A9AFF',
          500: '#5B7FFF',
          600: '#4A66CC',
          700: '#3A4D99',
          800: '#2B3666',
          900: '#1B1F33',
          DEFAULT: '#5B7FFF',
          light: '#E0EAFF',
          dark: '#3A4D99'
        },
        // 辅助色 - 紫色（用于强调）
        accent: {
          50: '#F5F3FF',
          100: '#E8E6FF',
          200: '#D4CCFF',
          300: '#B5A3FF',
          400: '#9B7FFF',
          500: '#8B5CF6',
          600: '#7C3AED',
          700: '#6D28D9',
          DEFAULT: '#8B5CF6'
        },
        // 中性色 - 优化深浅对比
        neutral: {
          text: '#1A1A1A',
          secondary: '#666666',
          disabled: '#CCCCCC',
          border: '#E0E0E0',
          bg: '#F7F8FA',
          50: '#FAFBFC',
          100: '#F3F4F6',
          200: '#E5E7EB',
          300: '#D1D5DB',
          400: '#9CA3AF',
          500: '#6B7280',
          600: '#4B5563',
          700: '#374151',
          800: '#1F2937',
          900: '#111827'
        },
        // 功能色
        success: '#10B981',
        warning: '#F59E0B',
        error: '#EF4444',
        info: '#3B82F6'
      },
      // 圆角规范
      borderRadius: {
        xs: '4px',
        sm: '6px',
        md: '8px',
        lg: '12px',
        xl: '16px',
        '2xl': '20px'
      },
      // 间距规范
      spacing: {
        xs: '4px',
        sm: '8px',
        md: '12px',
        lg: '16px',
        xl: '24px',
        '2xl': '32px',
        '3xl': '48px'
      },
      // 阴影规范
      boxShadow: {
        'xs': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        'sm': '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
        'md': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        'lg': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        'xl': '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        'hover': '0 20px 25px -5px rgba(91, 127, 255, 0.15)',
        'card': '0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px 0 rgba(0, 0, 0, 0.06)'
      },
      // 过渡时间规范
      transitionDuration: {
        'fast': '150ms',
        'base': '200ms',
        'slow': '300ms'
      },
      // 字体规范
      fontSize: {
        'xs': ['12px', { lineHeight: '16px' }],
        'sm': ['14px', { lineHeight: '20px' }],
        'base': ['16px', { lineHeight: '24px' }],
        'lg': ['18px', { lineHeight: '28px' }],
        'xl': ['20px', { lineHeight: '28px' }],
        '2xl': ['24px', { lineHeight: '32px' }],
        '3xl': ['30px', { lineHeight: '36px' }]
      }
    },
  },
  plugins: [],
}
