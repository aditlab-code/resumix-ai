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

export interface ThreeDotsAccentProps {
  colorClassName?: string;
  className?: string;
}

export const ThreeDotsAccent: React.FC<ThreeDotsAccentProps> = ({
  colorClassName = 'bg-blue-600',
  className,
}) => (
  <div className={cn('flex flex-col gap-0.5 shrink-0', className)} aria-hidden="true">
    <span className={cn('w-1 h-1 rounded-full', colorClassName)} />
    <span className={cn('w-1 h-1 rounded-full', colorClassName)} />
    <span className={cn('w-1 h-1 rounded-full', colorClassName)} />
  </div>
);

export type CardHeaderProps = React.HTMLAttributes<HTMLDivElement> & {
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  action?: React.ReactNode;
  disableBorder?: boolean;
  showAccent?: boolean;
  accentColor?: string;
};

const CardHeader = React.forwardRef<HTMLDivElement, CardHeaderProps>(
  (
    {
      className,
      title,
      subtitle,
      action,
      disableBorder = false,
      showAccent = true,
      accentColor,
      children,
      ...props
    },
    ref
  ) => {
    if (title || subtitle || action) {
      return (
        <div
          ref={ref}
          className={cn(
            'flex items-center justify-between gap-3',
            !disableBorder && 'border-b border-border pb-4 mb-4',
            className
          )}
          {...props}
        >
          <div>
            {typeof title === 'string' ? (
              <CardTitle showAccent={showAccent} accentColor={accentColor}>
                {title}
              </CardTitle>
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
      <div
        ref={ref}
        className={cn(
          'flex flex-col space-y-1.5',
          !disableBorder && 'border-b border-border pb-4 mb-4',
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);
CardHeader.displayName = 'CardHeader';

export interface CardTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {
  showAccent?: boolean;
  accentColor?: string;
}

const CardTitle = React.forwardRef<HTMLHeadingElement, CardTitleProps>(
  ({ className, showAccent = true, accentColor, children, ...props }, ref) => (
    <h3
      ref={ref}
      className={cn('font-bold leading-tight tracking-tight text-lg text-card-foreground flex items-center gap-2.5', className)}
      {...props}
    >
      {showAccent && <ThreeDotsAccent colorClassName={accentColor} />}
      {children}
    </h3>
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

export interface SectionLabelProps extends React.HTMLAttributes<HTMLParagraphElement> {
  showAccent?: boolean;
  accentColor?: string;
}

export const SectionLabel: React.FC<SectionLabelProps> = ({
  className,
  showAccent = true,
  accentColor,
  children,
  ...props
}) => (
  <p
    className={cn(
      'text-xs font-extrabold uppercase tracking-wider text-muted-foreground flex items-center gap-2 mb-2',
      className
    )}
    {...props}
  >
    {showAccent && <ThreeDotsAccent colorClassName={accentColor} />}
    {children}
  </p>
);

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent };


