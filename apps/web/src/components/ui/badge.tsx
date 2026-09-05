'use client';

import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { ApplicationStatus, ParseStatus } from '@cv-ats/contracts';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
  {
    variants: {
      variant: {
        default: 'border-transparent bg-primary text-primary-foreground hover:bg-primary/80',
        secondary: 'border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80',
        destructive: 'border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80',
        outline: 'text-foreground',
        success: 'border-transparent bg-emerald-100 text-emerald-900 border-emerald-300 font-bold',
        warning: 'border-transparent bg-amber-100 text-amber-950 border-amber-300 font-bold',
        danger: 'border-transparent bg-rose-100 text-rose-900 border-rose-300 font-bold',
        accent: 'border-transparent bg-blue-100 text-blue-900 border-blue-300 font-bold',
        neutral: 'border-transparent bg-slate-200 text-slate-900 border-slate-300 font-bold',
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
  neutral: 'bg-slate-200 text-slate-900 border border-slate-300 font-bold',
  accent: 'bg-blue-100 text-blue-900 border border-blue-300 font-bold',
  ok: 'bg-emerald-100 text-emerald-900 border border-emerald-300 font-bold',
  warn: 'bg-amber-100 text-amber-950 border border-amber-300 font-bold',
  danger: 'bg-rose-100 text-rose-900 border border-rose-300 font-bold',
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
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-bold tracking-wider uppercase shadow-2xs',
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

