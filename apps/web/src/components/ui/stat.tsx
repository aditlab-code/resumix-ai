'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from './card';

interface StatProps {
  label: string;
  value: React.ReactNode;
  hint?: React.ReactNode;
  onClick?: () => void;
  variant?: 'blue' | 'indigo' | 'amber' | 'red' | 'default';
  tone?: 'ink' | 'accent' | 'warn' | 'ok';
}

const variantStyles: Record<
  NonNullable<StatProps['variant']>,
  { card: string; title: string; hint: string }
> = {
  blue: {
    card: 'bg-blue-100/80 border-blue-300 hover:border-blue-500 shadow-xs',
    title: 'text-blue-950 font-extrabold',
    hint: 'bg-blue-600 text-white font-bold border-blue-700',
  },
  indigo: {
    card: 'bg-indigo-100/80 border-indigo-300 hover:border-indigo-500 shadow-xs',
    title: 'text-indigo-950 font-extrabold',
    hint: 'bg-indigo-600 text-white font-bold border-indigo-700',
  },
  amber: {
    card: 'bg-amber-100/80 border-amber-300 hover:border-amber-500 shadow-xs',
    title: 'text-amber-950 font-extrabold',
    hint: 'bg-amber-600 text-white font-bold border-amber-700',
  },
  red: {
    card: 'bg-rose-100/80 border-rose-300 hover:border-rose-500 shadow-xs',
    title: 'text-rose-950 font-extrabold',
    hint: 'bg-rose-600 text-white font-bold border-rose-700',
  },
  default: {
    card: 'bg-card text-card-foreground border-border hover:border-primary/50',
    title: 'text-muted-foreground font-semibold',
    hint: 'bg-background/60 text-muted-foreground border-border/50',
  },
};

export const Stat: React.FC<StatProps> = ({ label, value, hint, onClick, variant = 'default' }) => {
  const currentVariant = variantStyles[variant] || variantStyles.default;

  return (
    <Card
      onClick={onClick}
      className={cn(
        'transition-all duration-200 shadow-sm hover:shadow-md border',
        currentVariant.card,
        onClick && 'cursor-pointer'
      )}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-6">
        <CardTitle className={cn('text-xs uppercase tracking-wider', currentVariant.title)}>
          {label}
        </CardTitle>
        {hint && (
          <span className={cn('text-xs px-2.5 py-0.5 rounded-full border shadow-2xs', currentVariant.hint)}>
            {hint}
          </span>
        )}
      </CardHeader>
      <CardContent className="p-6 pt-0">
        <div className="text-3xl font-extrabold tracking-tight text-foreground tabular-nums">
          {value}
        </div>
      </CardContent>
    </Card>
  );
};

