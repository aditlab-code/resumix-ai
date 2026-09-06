'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  accentTop?: boolean;
  interactive?: boolean;
  elevation?: 'e0' | 'e1' | 'e2' | 'e3' | 'e4';
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, accentTop = false, interactive = false, elevation = 'e1', children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'rounded-xl border border-border bg-card text-card-foreground shadow-sm relative overflow-hidden transition-all duration-200',
        elevation === 'e0' && 'shadow-none',
        elevation === 'e2' && 'shadow-md',
        elevation === 'e3' && 'shadow-lg',
        elevation === 'e4' && 'shadow-xl',
        interactive && 'hover:border-primary/50 cursor-pointer hover:shadow-md',
        accentTop && 'before:absolute before:top-0 before:left-0 before:right-0 before:h-1 before:bg-primary',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
);
Card.displayName = 'Card';

export type CardHeaderProps = React.HTMLAttributes<HTMLDivElement> & {
  title?: React.ReactNode;
  action?: React.ReactNode;
  subtitle?: React.ReactNode;
};

const CardHeader = React.forwardRef<HTMLDivElement, CardHeaderProps>(
  ({ className, title, subtitle, action, children, ...props }, ref) => {
    if (title || subtitle || action) {
      return (
        <div
          ref={ref}
          className={cn('flex items-center justify-between gap-3 border-b border-border pb-4 mb-4 p-6', className)}
          {...props}
        >
          <div>
            {typeof title === 'string' ? (
              <h3 className="text-lg font-semibold text-card-foreground tracking-tight flex items-center gap-2">
                <span className="w-1.5 h-3.5 bg-primary rounded-sm inline-block"></span>
                {title}
              </h3>
            ) : (
              title
            )}
            {subtitle && <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>}
          </div>
          {action}
        </div>
      );
    }
    return (
      <div ref={ref} className={cn('flex flex-col space-y-1.5 p-6', className)} {...props}>
        {children}
      </div>
    );
  }
);
CardHeader.displayName = 'CardHeader';


const CardTitle = React.forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h3 ref={ref} className={cn('font-semibold leading-none tracking-tight text-lg', className)} {...props} />
  )
);
CardTitle.displayName = 'CardTitle';

const CardDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => (
    <p ref={ref} className={cn('text-sm text-muted-foreground', className)} {...props} />
  )
);
CardDescription.displayName = 'CardDescription';

const CardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('p-6 pt-0', className)} {...props} />
  )
);
CardContent.displayName = 'CardContent';

const CardFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('flex items-center p-6 pt-0', className)} {...props} />
  )
);
CardFooter.displayName = 'CardFooter';

export const SectionLabel: React.FC<React.HTMLAttributes<HTMLParagraphElement>> = ({
  className,
  children,
  ...props
}) => (
  <p
    className={cn('text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2 mb-2', className)}
    {...props}
  >
    <span className="w-1.5 h-1.5 bg-primary rounded-full inline-block"></span>
    {children}
  </p>
);


export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent };


