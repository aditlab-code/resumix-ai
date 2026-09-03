'use client';

import React from 'react';
import { cn } from '@/lib/utils';

type MeterTone = 'accent' | 'ok' | 'warn' | 'ink';

const barTone: Record<MeterTone, string> = {
  accent: 'bg-accent',
  ok: 'bg-ok',
  warn: 'bg-warn',
  ink: 'bg-ink',
};

interface MeterProps {
  label: React.ReactNode;
  /** 0..100 */
  percent: number;
  weight?: number;
  tone?: MeterTone;
}

export const Meter: React.FC<MeterProps> = ({ label, percent, weight, tone = 'accent' }) => {
  const clamped = Math.min(100, Math.max(0, percent));
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs">
        <span className="text-ink-muted font-medium">{label}</span>
        <span className="font-mono font-bold text-ink">
          {Math.round(clamped)}%
          {weight != null && <span className="text-ink-subtle"> ({weight}%)</span>}
        </span>
      </div>
      <div className="w-full bg-canvas h-1.5 rounded-full overflow-hidden">
        <div
          className={cn('h-full transition-all duration-500', barTone[tone])}
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  );
};
