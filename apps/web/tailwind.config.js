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
        canvas: '#f4f5f7',
        surface: '#ffffff',
        line: '#e4e6eb',
        ink: {
          DEFAULT: '#1a1c1e',
          muted: '#5f6570',
          subtle: '#8b909a',
        },
        accent: {
          DEFAULT: '#2563eb',
          fg: '#ffffff',
          soft: '#eef3ff',
        },
        danger: {
          DEFAULT: '#dc2626',
          fg: '#ffffff',
          soft: '#fdecec',
        },
        ok: {
          DEFAULT: '#15803d',
          soft: '#e9f6ec',
        },
        warn: {
          DEFAULT: '#b45309',
          soft: '#fbf1e3',
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
