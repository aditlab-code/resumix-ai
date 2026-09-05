'use client';

import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const button = cva(
  'inline-flex items-center justify-center gap-1.5 rounded-md whitespace-nowrap disabled:opacity-40 disabled:pointer-events-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400/30 focus-visible:ring-offset-1 transition-colors select-none',
  {
    variants: {
      variant: {
        primary: 'bg-blue-600 !text-white font-bold hover:bg-blue-700 shadow-e1',
        secondary: 'bg-surface-sunken text-ink-default font-bold border border-surface-border hover:bg-surface-hover shadow-2xs',
        ghost: 'bg-transparent text-ink-subtle font-semibold hover:bg-surface-hover hover:text-ink-default',
        danger: 'bg-rose-600 !text-white font-bold hover:bg-rose-700 shadow-e1',
        success: 'bg-emerald-600 !text-white font-bold hover:bg-emerald-700 shadow-e1',
        'danger-soft': 'bg-rose-50 text-rose-700 font-bold border border-rose-200 hover:bg-rose-100',
      },
      size: {
        sm: 'h-8 px-3 text-caption',
        md: 'h-9 px-4 text-body',
        lg: 'h-11 px-5 text-body font-bold',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
  VariantProps<typeof button> {
  iconLeft?: React.ReactNode;
  iconRight?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, iconLeft, iconRight, children, type = 'button', ...props }, ref) => (
    <button ref={ref} type={type} className={cn(button({ variant, size }), className)} {...props}>
      {iconLeft && <span className="inline-flex shrink-0 items-center justify-center text-current">{iconLeft}</span>}
      {children}
      {iconRight && <span className="inline-flex shrink-0 items-center justify-center text-current">{iconRight}</span>}
    </button>
  )
);
Button.displayName = 'Button';
