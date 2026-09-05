'use client';

import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { ApplicationStatus, ParseStatus } from '@cv-ats/contracts';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-bold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 shadow-2xs',
  {
    variants: {
      variant: {
        default: 'border-transparent bg-primary text-primary-foreground hover:bg-primary/80',
        secondary: 'border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80',
        destructive: 'border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80',
        outline: 'text-foreground border-border',
        success: 'bg-emerald-500/15 text-emerald-800 dark:text-emerald-200 border-emerald-500/35 font-bold',
        warning: 'bg-amber-500/15 text-amber-900 dark:text-amber-200 border-amber-500/35 font-bold',
        danger: 'bg-rose-500/15 text-rose-800 dark:text-rose-200 border-rose-500/35 font-bold',
        accent: 'bg-blue-500/15 text-blue-800 dark:text-blue-200 border-blue-500/35 font-bold',
        neutral: 'bg-slate-200 dark:bg-slate-800 text-slate-900 dark:text-slate-100 border-slate-300 dark:border-slate-700 font-bold',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export type StatusType = ApplicationStatus | ParseStatus;
type Tone = 'neutral' | 'accent' | 'ok' | 'warn' | 'danger';

const toneClass: Record<Tone, string> = {
  neutral: 'bg-slate-500/15 text-slate-800 dark:text-slate-200 border-slate-500/30 font-extrabold',
  accent: 'bg-blue-500/15 text-blue-700 dark:text-blue-300 border-blue-500/35 font-extrabold',
  ok: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/35 font-extrabold',
  warn: 'bg-amber-500/15 text-amber-800 dark:text-amber-300 border-amber-500/35 font-extrabold',
  danger: 'bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/35 font-extrabold',
};

const statusMap: Record<StatusType, { label: string; tone: Tone }> = {
  // Parse statuses
  uploaded: { label: 'UPLOADED', tone: 'neutral' },
  queued: { label: 'QUEUED', tone: 'warn' },
  processing: { label: 'PROCESSING', tone: 'accent' },
  processed: { label: 'PROCESSED', tone: 'ok' },
  needs_review: { label: 'NEEDS REVIEW', tone: 'warn' },
  failed: { label: 'FAILED', tone: 'danger' },
  // Application statuses
  applied: { label: 'APPLIED', tone: 'neutral' },
  screening: { label: 'SCREENING', tone: 'accent' },
  interview: { label: 'INTERVIEW', tone: 'accent' },
  rejected: { label: 'REJECTED', tone: 'danger' },
  hired: { label: 'HIRED', tone: 'ok' },
  withdrawn: { label: 'WITHDRAWN', tone: 'neutral' },
};

const PULSE: StatusType[] = ['processing', 'queued', 'needs_review'];

interface StatusBadgeProps {
  status: StatusType;
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className = '' }) => {
  const config = statusMap[status] || statusMap.uploaded;

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-extrabold tracking-wider uppercase border shadow-2xs',
        toneClass[config.tone],
        className
      )}
    >
      {PULSE.includes(status) && (
        <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse shrink-0" />
      )}
      {config.label}
    </span>
  );
};

export { Badge, badgeVariants };

