'use client';

import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const button = cva(
  'inline-flex items-center justify-center gap-1.5 rounded-md whitespace-nowrap disabled:opacity-40 disabled:pointer-events-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600/30 focus-visible:ring-offset-1',
  {
    variants: {
      variant: {
        primary: 'bg-blue-600 text-white font-bold hover:bg-blue-700 shadow-e1',
        secondary: 'bg-slate-100 text-slate-900 font-bold border border-slate-300 hover:bg-slate-200 shadow-2xs',
        ghost: 'bg-transparent text-slate-700 font-semibold hover:bg-slate-100 hover:text-slate-900',
        danger: 'bg-red-700 text-white font-bold hover:bg-red-800 shadow-e1',
        'danger-soft': 'bg-red-50 text-red-700 font-bold border border-red-200 hover:bg-red-100',
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
