'use client';

import React from 'react';
import { cn } from '@/lib/utils';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  accentTop?: boolean;
  interactive?: boolean;
  elevation?: 'e0' | 'e1' | 'e2' | 'e3' | 'e4';
}

export const Card: React.FC<CardProps> = ({
  className,
  accentTop = false,
  interactive = false,
  elevation = 'e1',
  children,
  ...props
}) => (
  <div
    className={cn(
      'bg-surface-raised border border-surface-border rounded-md p-5 relative overflow-hidden',
      elevation === 'e0' && 'shadow-none',
      elevation === 'e1' && 'shadow-e1',
      elevation === 'e2' && 'shadow-e2',
      elevation === 'e3' && 'shadow-e3',
      elevation === 'e4' && 'shadow-e4',
      interactive && 'hover:border-brand-accent cursor-pointer',
      accentTop && 'before:absolute before:top-0 before:left-0 before:right-0 before:h-1 before:bg-brand-accent',
      className
    )}
    {...props}
  >
    {children}
  </div>
);

interface CardHeaderProps {
  title: React.ReactNode;
  action?: React.ReactNode;
  subtitle?: React.ReactNode;
  className?: string;
}

export const CardHeader: React.FC<CardHeaderProps> = ({ title, subtitle, action, className }) => (
  <div className={cn('flex items-center justify-between gap-3 border-b border-surface-border pb-3 mb-4', className)}>
    <div>
      {typeof title === 'string' ? (
        <h3 className="text-h3 font-bold text-ink-default tracking-tight flex items-center gap-2">
          <span className="w-1.5 h-3.5 bg-brand-accent rounded-sm inline-block"></span>
          {title}
        </h3>
      ) : (
        title
      )}
      {subtitle && <p className="text-caption text-ink-subtle mt-0.5">{subtitle}</p>}
    </div>
    {action}
  </div>
);

export const SectionLabel: React.FC<React.HTMLAttributes<HTMLParagraphElement>> = ({
  className,
  children,
  ...props
}) => (
  <p
    className={cn('text-caption font-semibold uppercase tracking-wider text-ink-subtle flex items-center gap-1.5', className)}
    {...props}
  >
    <span className="w-1.5 h-1.5 bg-brand-accent rounded-full inline-block"></span>
    {children}
  </p>
);

