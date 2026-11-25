/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      colors: {
        brand: {
          bg: '#F8FAFC',
          surface: '#FFFFFF',
          dark: '#111827',
          muted: '#64748B',
          primary: '#2563EB',
          'primary-hover': '#1D4ED8',
          success: '#16A34A',
          warning: '#F59E0B',
          border: '#E2E8F0',
        },
      },
      boxShadow: {
        card: '0 1px 3px 0 rgba(15, 23, 42, 0.06), 0 1px 2px -1px rgba(15, 23, 42, 0.04)',
        'card-hover': '0 10px 25px -5px rgba(15, 23, 42, 0.08), 0 4px 10px -6px rgba(15, 23, 42, 0.04)',
      },
    },
  },
  plugins: [],
};
