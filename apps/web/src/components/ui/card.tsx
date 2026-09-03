'use client';

import React from 'react';
import { cn } from '@/lib/utils';

export const Card: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className,
  children,
  ...props
}) => (
  <div className={cn('bg-surface rounded p-4', className)} {...props}>
    {children}
  </div>
);

interface CardHeaderProps {
  title: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}

export const CardHeader: React.FC<CardHeaderProps> = ({ title, action, className }) => (
  <div className={cn('flex items-center justify-between gap-3', className)}>
    {typeof title === 'string' ? <h2>{title}</h2> : title}
    {action}
  </div>
);

export const SectionLabel: React.FC<React.HTMLAttributes<HTMLParagraphElement>> = ({
  className,
  children,
  ...props
}) => (
  <p
    className={cn('text-xs font-bold uppercase tracking-wider text-ink-subtle', className)}
    {...props}
  >
    {children}
  </p>
);
