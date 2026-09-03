'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface StatProps {
  label: string;
  value: React.ReactNode;
  hint?: React.ReactNode;
  onClick?: () => void;
  tone?: 'ink' | 'accent' | 'warn' | 'ok';
}

const valueTone: Record<NonNullable<StatProps['tone']>, string> = {
  ink: 'text-ink-default',
  accent: 'text-brand-accent',
  warn: 'text-semantic-warning',
  ok: 'text-semantic-success',
};

export const Stat: React.FC<StatProps> = ({ label, value, hint, onClick, tone = 'ink' }) => {
  const Wrapper = onClick ? 'button' : 'div';
  return (
    <Wrapper
      onClick={onClick}
      className={cn(
        'bg-surface-raised border border-surface-border rounded-md p-6 flex flex-col gap-2.5 text-left w-full shadow-e1',
        onClick && 'hover:border-brand-accent cursor-pointer'
      )}
    >
      <span className="text-caption font-medium uppercase tracking-wider text-ink-subtle">{label}</span>
      <div className="flex items-baseline justify-between gap-2">
        <span className={cn('text-metric font-bold tracking-tight tabular-nums', valueTone[tone])}>{value}</span>
        {hint && <span className="text-caption font-semibold text-ink-muted">{hint}</span>}
      </div>
    </Wrapper>
  );
};
