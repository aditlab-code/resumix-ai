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
  ink: 'text-ink',
  accent: 'text-accent',
  warn: 'text-warn',
  ok: 'text-ok',
};

export const Stat: React.FC<StatProps> = ({ label, value, hint, onClick, tone = 'ink' }) => {
  const Wrapper = onClick ? 'button' : 'div';
  return (
    <Wrapper
      onClick={onClick}
      className={cn(
        'bg-surface border border-line rounded p-4 flex flex-col gap-2 text-left w-full',
        onClick && 'hover:border-ink-subtle transition-colors'
      )}
    >
      <span className="text-xs font-bold uppercase tracking-wider text-ink-subtle">{label}</span>
      <div className="flex items-baseline justify-between gap-2">
        <span className={cn('text-3xl font-extrabold tabular-nums', valueTone[tone])}>{value}</span>
        {hint && <span className="text-xs font-bold text-ink-muted">{hint}</span>}
      </div>
    </Wrapper>
  );
};
