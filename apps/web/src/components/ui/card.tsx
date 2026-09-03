'use client';

import React from 'react';
import { cn } from '@/lib/utils';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  accentTop?: boolean;
}

export const Card: React.FC<CardProps> = ({
  className,
  accentTop = false,
  children,
  ...props
}) => (
  <div
    className={cn(
      'bg-surface border border-slate-300 rounded-lg p-5 shadow-xs transition-all hover:border-slate-400 relative overflow-hidden',
      accentTop && 'before:absolute before:top-0 before:left-0 before:right-0 before:h-1 before:bg-accent',
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
  <div className={cn('flex items-center justify-between gap-3 border-b border-slate-200 pb-3 mb-4', className)}>
    <div>
      {typeof title === 'string' ? (
        <h2 className="text-sm font-black tracking-tight text-slate-900 uppercase flex items-center gap-2">
          <span className="w-1.5 h-3.5 bg-accent rounded-xs inline-block"></span>
          {title}
        </h2>
      ) : (
        title
      )}
      {subtitle && <p className="text-[11px] font-medium text-slate-600 mt-0.5">{subtitle}</p>}
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
    className={cn('text-[10px] font-black uppercase tracking-wider text-slate-600 flex items-center gap-1.5', className)}
    {...props}
  >
    <span className="w-1 h-1 bg-accent rounded-full inline-block"></span>
    {children}
  </p>
);
