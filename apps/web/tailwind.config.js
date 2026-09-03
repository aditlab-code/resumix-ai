/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        canvas: '#f8fafc',
        surface: '#ffffff',
        line: '#cbd5e1',
        ink: {
          DEFAULT: '#0f172a',
          muted: '#1e293b',
          subtle: '#334155',
        },
        accent: {
          DEFAULT: '#1d4ed8',
          fg: '#ffffff',
          soft: '#dbeafe',
        },
        danger: {
          DEFAULT: '#dc2626',
          fg: '#ffffff',
          soft: '#fef2f2',
        },
        ok: {
          DEFAULT: '#16a34a',
          soft: '#f0fdf4',
        },
        warn: {
          DEFAULT: '#d97706',
          soft: '#fffbeb',
        },
      },
      borderRadius: {
        none: '0',
        sm: '6px',
        DEFAULT: '8px',
        md: '8px',
        lg: '8px',
        xl: '8px',
        '2xl': '10px',
        '3xl': '10px',
        full: '9999px',
      },
    },
  },
  plugins: [],
};
