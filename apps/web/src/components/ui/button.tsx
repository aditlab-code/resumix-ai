'use client';

import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const button = cva(
  'inline-flex items-center justify-center gap-1.5 rounded-md font-semibold whitespace-nowrap disabled:opacity-40 disabled:pointer-events-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent/30 focus-visible:ring-offset-1',
  {
    variants: {
      variant: {
        primary: 'bg-brand-accent text-white font-bold hover:bg-brand-accent_hover shadow-e1',
        secondary: 'bg-surface-sunken text-ink-default font-semibold border border-surface-border hover:bg-surface-border hover:text-ink-default shadow-2xs',
        ghost: 'bg-transparent text-ink-subtle hover:bg-surface-sunken hover:text-ink-default',
        danger: 'bg-semantic-danger text-white font-bold hover:bg-red-800 shadow-e1',
        'danger-soft': 'bg-semantic-danger_soft text-semantic-danger font-semibold hover:bg-red-200',
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
