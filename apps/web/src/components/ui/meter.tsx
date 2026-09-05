'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { Progress } from './progress';

type MeterTone = 'accent' | 'ok' | 'warn' | 'ink';

const barTone: Record<MeterTone, string> = {
  accent: 'bg-primary',
  ok: 'bg-emerald-500',
  warn: 'bg-amber-500',
  ink: 'bg-foreground',
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
    <div className="space-y-1.5 w-full">
      <div className="flex justify-between items-center text-xs gap-2">
        <span className="text-muted-foreground font-medium truncate">{label}</span>
        <span className="font-mono font-bold text-foreground shrink-0">
          {Math.round(clamped)}%
          {weight != null && <span className="text-muted-foreground font-normal"> ({weight}%)</span>}
        </span>
      </div>
      <Progress value={clamped} className="h-2 w-full" indicatorClassName={barTone[tone]} />
    </div>
  );
};

