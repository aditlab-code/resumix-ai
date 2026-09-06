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
  { card: string; title: string; hint: string; dot: string }
> = {
  blue: {
    card: 'bg-blue-50/50 border-blue-200 hover:border-blue-400 shadow-xs',
    title: 'text-blue-950 font-extrabold',
    hint: 'bg-slate-100 text-blue-900 font-bold border-blue-500 border',
    dot: 'bg-blue-600',
  },
  indigo: {
    card: 'bg-indigo-50/50 border-indigo-200 hover:border-indigo-400 shadow-xs',
    title: 'text-indigo-950 font-extrabold',
    hint: 'bg-slate-100 text-indigo-900 font-bold border-indigo-500 border',
    dot: 'bg-indigo-600',
  },
  amber: {
    card: 'bg-amber-50/50 border-amber-200 hover:border-amber-400 shadow-xs',
    title: 'text-amber-950 font-extrabold',
    hint: 'bg-slate-100 text-amber-900 font-bold border-amber-500 border',
    dot: 'bg-amber-600',
  },
  red: {
    card: 'bg-rose-50/50 border-rose-200 hover:border-rose-400 shadow-xs',
    title: 'text-rose-950 font-extrabold',
    hint: 'bg-slate-100 text-rose-900 font-bold border-rose-500 border',
    dot: 'bg-rose-600',
  },
  default: {
    card: 'bg-slate-50/80 border-slate-200 hover:border-slate-300 shadow-xs',
    title: 'text-slate-700 font-semibold',
    hint: 'bg-slate-100 text-slate-800 border-slate-300 border',
    dot: 'bg-slate-400',
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
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="flex flex-col gap-0.5 shrink-0" aria-hidden="true">
            <span className={cn('w-1 h-1 rounded-full', currentVariant.dot)} />
            <span className={cn('w-1 h-1 rounded-full', currentVariant.dot)} />
            <span className={cn('w-1 h-1 rounded-full', currentVariant.dot)} />
          </div>
          <CardTitle className={cn('text-xs uppercase tracking-wider truncate', currentVariant.title)}>
            {label}
          </CardTitle>
        </div>
        {hint && (
          <span className={cn('text-xs px-2.5 py-0.5 rounded-full border shadow-2xs shrink-0', currentVariant.hint)}>
            {hint}
          </span>
        )}
      </CardHeader>
      <CardContent className="p-6 pt-0">
        <div className="text-3xl font-extrabold tracking-tight text-foreground tabular-nums font-mono">
          {value}
        </div>
      </CardContent>
    </Card>
  );
};

