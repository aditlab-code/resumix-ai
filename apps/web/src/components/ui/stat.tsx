'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface StatProps {
  label: string;
  value: React.ReactNode;
  hint?: React.ReactNode;
  onClick?: () => void;
  variant?: 'blue' | 'indigo' | 'amber' | 'red' | 'default';
  tone?: 'ink' | 'accent' | 'warn' | 'ok';
}

const variantStyles: Record<NonNullable<StatProps['variant']>, { bg: string; text: string; hint: string; metric: string }> = {
  blue: {
    bg: 'bg-blue-50/90 border-blue-200 shadow-e1',
    text: 'text-blue-900',
    hint: 'text-blue-700 font-bold',
    metric: 'text-blue-700 font-extrabold',
  },
  indigo: {
    bg: 'bg-indigo-50/90 border-indigo-200 shadow-e1',
    text: 'text-indigo-900',
    hint: 'text-indigo-700 font-bold',
    metric: 'text-indigo-700 font-extrabold',
  },
  amber: {
    bg: 'bg-amber-50/90 border-amber-200 shadow-e1',
    text: 'text-amber-900',
    hint: 'text-amber-700 font-bold',
    metric: 'text-amber-700 font-extrabold',
  },
  red: {
    bg: 'bg-red-50/90 border-red-200 shadow-e1',
    text: 'text-red-900',
    hint: 'text-red-700 font-bold',
    metric: 'text-red-700 font-extrabold',
  },
  default: {
    bg: 'bg-surface-raised border-surface-border shadow-e1',
    text: 'text-ink-subtle',
    hint: 'text-ink-muted font-semibold',
    metric: 'text-ink-default font-extrabold',
  },
};

export const Stat: React.FC<StatProps> = ({ label, value, hint, onClick, variant = 'default' }) => {
  const Wrapper = onClick ? 'button' : 'div';
  const style = variantStyles[variant];

  return (
    <Wrapper
      onClick={onClick}
      className={cn(
        'border rounded-md p-6 flex flex-col gap-2.5 text-left w-full relative overflow-hidden',
        style.bg,
        onClick && 'hover:border-slate-400 cursor-pointer'
      )}
    >
      <span className={cn('text-caption font-bold uppercase tracking-wider', style.text)}>{label}</span>
      <div className="flex items-baseline justify-between gap-2">
        <span className={cn('text-metric tracking-tight tabular-nums', style.metric)}>{value}</span>
        {hint && <span className={cn('text-caption', style.hint)}>{hint}</span>}
      </div>
    </Wrapper>
  );
};
