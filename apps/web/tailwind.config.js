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
        brand: {
          accent: 'var(--brand-accent, #1D4ED8)',
          accent_hover: 'var(--brand-accent-hover, #1E40AF)',
          accent_soft: 'var(--brand-accent-soft, #DBEAFE)',
        },
        ink: {
          DEFAULT: 'var(--ink-default, #0F172A)',
          default: 'var(--ink-default, #0F172A)',
          muted: 'var(--ink-muted, #1E293B)',
          subtle: 'var(--ink-subtle, #475569)',
          faint: 'var(--ink-faint, #94A3B8)',
          inverse: 'var(--ink-inverse, #FFFFFF)',
          brand: 'var(--ink-brand, #1D4ED8)',
        },
        surface: {
          canvas: 'var(--surface-canvas, #F1F5F9)',
          base: 'var(--surface-base, #FFFFFF)',
          raised: 'var(--surface-raised, #FFFFFF)',
          hover: 'var(--surface-hover, #F8FAFC)',
          active: 'var(--surface-active, #EFF6FF)',
          overlay: 'var(--surface-overlay, #FFFFFF)',
          sunken: 'var(--surface-sunken, #E2E8F0)',
          border: 'var(--surface-border, #E2E8F0)',
          border_strong: 'var(--surface-border-strong, #CBD5E1)',
          border_subtle: 'var(--surface-border-subtle, #F1F5F9)',
        },
        semantic: {
          success: '#15803D',
          success_soft: '#DCFCE7',
          warning: '#B45309',
          warning_soft: '#FEF3C7',
          danger: '#B91C1C',
          danger_soft: '#FEE2E2',
          info: '#1D4ED8',
          info_soft: '#DBEAFE',
        },
        // Backwards compatibility aliases
        canvas: 'var(--surface-canvas, #F1F5F9)',
        line: 'var(--surface-border, #E2E8F0)',
        accent: {
          DEFAULT: 'var(--brand-accent, #1D4ED8)',
          fg: '#FFFFFF',
          soft: 'var(--brand-accent-soft, #DBEAFE)',
        },
        danger: {
          DEFAULT: '#B91C1C',
          fg: '#FFFFFF',
          soft: '#FEE2E2',
        },
        ok: {
          DEFAULT: '#15803D',
          soft: '#DCFCE7',
        },
        warn: {
          DEFAULT: '#B45309',
          soft: '#FEF3C7',
        },
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', "'Segoe UI'", 'Roboto', 'sans-serif'],
        mono: ["'JetBrains Mono'", "'Fira Code'", 'monospace'],
      },
      fontSize: {
        display: ['32px', { lineHeight: '40px', letterSpacing: '-0.02em', fontWeight: '700' }],
        h1: ['24px', { lineHeight: '32px', letterSpacing: '-0.01em', fontWeight: '700' }],
        h2: ['18px', { lineHeight: '26px', fontWeight: '600' }],
        h3: ['15px', { lineHeight: '22px', fontWeight: '600' }],
        body: ['14px', { lineHeight: '21px', fontWeight: '400' }],
        caption: ['12px', { lineHeight: '16px', letterSpacing: '0.02em', fontWeight: '500' }],
        metric: ['28px', { lineHeight: '34px', letterSpacing: '-0.01em', fontWeight: '700' }],
      },
      borderRadius: {
        sm: '6px',
        md: '10px',
        lg: '14px',
        pill: '999px',
      },
      boxShadow: {
        e1: '0 1px 2px rgba(15, 23, 42, 0.04), 0 1px 3px rgba(15, 23, 42, 0.08)',
        'e1-card': '0 1px 2px rgba(15, 23, 42, 0.04), 0 1px 3px rgba(15, 23, 42, 0.08)',
        e2: '0 2px 4px rgba(15, 23, 42, 0.06), 0 4px 12px rgba(29, 78, 216, 0.10)',
        'e2-hover': '0 2px 4px rgba(15, 23, 42, 0.06), 0 4px 12px rgba(29, 78, 216, 0.10)',
        e3: '0 8px 16px rgba(15, 23, 42, 0.10), 0 2px 6px rgba(15, 23, 42, 0.06)',
        'e3-dropdown': '0 8px 16px rgba(15, 23, 42, 0.10), 0 2px 6px rgba(15, 23, 42, 0.06)',
        e4: '0 16px 40px rgba(15, 23, 42, 0.18), 0 4px 12px rgba(15, 23, 42, 0.08)',
        'e4-modal': '0 16px 40px rgba(15, 23, 42, 0.18), 0 4px 12px rgba(15, 23, 42, 0.08)',
        focus: '0 0 0 3px rgba(29, 78, 216, 0.30)',
      },
      transitionDuration: {
        fast: '120ms',
        base: '200ms',
        slow: '320ms',
      },
      transitionTimingFunction: {
        smooth: 'cubic-bezier(0.22, 1, 0.36, 1)',
      },
    },
  },
  plugins: [],
};
