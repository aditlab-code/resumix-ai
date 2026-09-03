'use client';

import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const button = cva(
  'inline-flex items-center justify-center gap-1.5 rounded font-bold whitespace-nowrap transition-colors disabled:opacity-40 disabled:pointer-events-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40',
  {
    variants: {
      variant: {
        primary: 'bg-accent text-accent-fg hover:bg-accent/90',
        secondary: 'bg-canvas text-ink hover:bg-line',
        ghost: 'bg-transparent text-ink-muted hover:bg-canvas hover:text-ink',
        danger: 'bg-danger text-danger-fg hover:bg-danger/90',
        'danger-soft': 'bg-danger-soft text-danger hover:bg-danger/15',
      },
      size: {
        sm: 'h-7 px-2.5 text-xs',
        md: 'h-9 px-4 text-xs',
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
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, iconLeft, children, type = 'button', ...props }, ref) => (
    <button ref={ref} type={type} className={cn(button({ variant, size }), className)} {...props}>
      {iconLeft}
      {children}
    </button>
  )
);
Button.displayName = 'Button';
