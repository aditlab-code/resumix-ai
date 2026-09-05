'use client';

import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 gap-2 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        default: 'bg-primary !text-white font-bold hover:bg-primary/90 shadow-sm',
        primary: 'bg-primary !text-white font-bold hover:bg-primary/90 shadow-sm',
        destructive: 'bg-destructive !text-white font-bold hover:bg-destructive/90 shadow-sm',
        danger: 'bg-destructive !text-white font-bold hover:bg-destructive/90 shadow-sm',
        success: 'bg-emerald-600 !text-white font-bold hover:bg-emerald-700 shadow-sm',
        'danger-soft': 'bg-destructive/10 text-destructive font-bold border border-destructive/20 hover:bg-destructive/20',
        outline: 'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
        secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80 border border-border',
        ghost: 'hover:bg-accent hover:text-accent-foreground',
        link: 'text-primary underline-offset-4 hover:underline',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-8 rounded-md px-3 text-caption',
        md: 'h-9 px-4 text-body',
        lg: 'h-11 rounded-md px-8 text-body font-bold',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  iconLeft?: React.ReactNode;
  iconRight?: React.ReactNode;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, iconLeft, iconRight, children, type = 'button', ...props }, ref) => {
    if (asChild) {
      return (
        <Slot className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props}>
          {children}
        </Slot>
      );
    }
    return (
      <button
        ref={ref}
        type={type}
        className={cn(buttonVariants({ variant, size, className }))}
        {...props}
      >
        {iconLeft && <span className="inline-flex shrink-0 items-center justify-center text-current">{iconLeft}</span>}
        {children}
        {iconRight && <span className="inline-flex shrink-0 items-center justify-center text-current">{iconRight}</span>}
      </button>
    );
  }
);
Button.displayName = 'Button';

export { Button, buttonVariants };

