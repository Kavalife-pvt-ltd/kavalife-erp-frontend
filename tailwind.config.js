/**
 * @type {import('tailwindcss').Config}
 */

const config = {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'media',
  theme: {
    extend: {
      colors: {
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        primaryText: 'var(--primaryText)',
        accent: 'var(--accentPink)',
        stroke: 'var(--stroke)',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        custom: '0px 10px 24px 0px rgba(0, 0, 0, 0.10)',
      },
    },
    screens: {
      xs: '365px',
      sm: '640px',
      md: '768px',
      lg: '1024px',
      xl: '1280px',
    },
  },
  plugins: [require('@tailwindcss/forms'), require('@tailwindcss/typography')],
};

export default config;
