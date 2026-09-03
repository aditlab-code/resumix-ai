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
        canvas: '#eef0f3',
        surface: '#ffffff',
        line: '#e0e3e9',
        ink: {
          DEFAULT: '#1f2328',
          muted: '#656d76',
          subtle: '#8c959f',
        },
        accent: {
          DEFAULT: '#1f6feb',
          fg: '#ffffff',
          soft: '#ddeaff',
        },
        danger: {
          DEFAULT: '#cf222e',
          fg: '#ffffff',
          soft: '#ffebe9',
        },
        ok: {
          DEFAULT: '#1a7f37',
          soft: '#dafbe1',
        },
        warn: {
          DEFAULT: '#9a6700',
          soft: '#fff8c5',
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
