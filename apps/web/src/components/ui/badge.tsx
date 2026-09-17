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
        success: 'bg-slate-100 text-emerald-900 border-emerald-500 font-bold',
        warning: 'bg-slate-100 text-amber-900 border-amber-500 font-bold',
        danger: 'bg-slate-100 text-rose-900 border-rose-500 font-bold',
        accent: 'bg-slate-100 text-blue-900 border-blue-500 font-bold',
        neutral: 'bg-slate-100 text-slate-800 border-slate-300 font-bold',
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
  neutral: 'bg-slate-100 text-slate-800 border-slate-300 font-extrabold',
  accent: 'bg-slate-100 text-blue-900 border-blue-500 font-extrabold',
  ok: 'bg-slate-100 text-emerald-900 border-emerald-500 font-extrabold',
  warn: 'bg-slate-100 text-amber-900 border-amber-500 font-extrabold',
  danger: 'bg-slate-100 text-rose-900 border-rose-500 font-extrabold',
};

const dotColorClass: Record<Tone, string> = {
  neutral: 'bg-slate-400',
  accent: 'bg-blue-600',
  ok: 'bg-emerald-600',
  warn: 'bg-amber-600',
  danger: 'bg-rose-600',
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

const PULSE: StatusType[] = ['processing'];

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
      <span
        className={cn(
          'w-1.5 h-1.5 rounded-full shrink-0',
          dotColorClass[config.tone],
          PULSE.includes(status) && 'animate-pulse'
        )}
      />
      {config.label}
    </span>
  );
};

export { Badge, badgeVariants };
