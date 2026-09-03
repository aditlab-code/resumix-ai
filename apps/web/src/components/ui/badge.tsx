'use client';

import React from 'react';
import { ApplicationStatus, ParseStatus } from '@cv-ats/contracts';
import { cn } from '@/lib/utils';

export type StatusType = ApplicationStatus | ParseStatus;
type Tone = 'neutral' | 'accent' | 'ok' | 'warn' | 'danger';

const toneClass: Record<Tone, string> = {
  neutral: 'bg-canvas text-ink-muted',
  accent: 'bg-accent-soft text-accent',
  ok: 'bg-ok-soft text-ok',
  warn: 'bg-warn-soft text-warn',
  danger: 'bg-danger-soft text-danger',
};

const statusMap: Record<StatusType, { label: string; tone: Tone }> = {
  // Parse statuses
  uploaded: { label: 'Uploaded', tone: 'neutral' },
  queued: { label: 'Queued', tone: 'accent' },
  processing: { label: 'Processing', tone: 'accent' },
  processed: { label: 'Processed', tone: 'ok' },
  needs_review: { label: 'Needs Review', tone: 'warn' },
  failed: { label: 'Failed', tone: 'danger' },
  // Application statuses
  applied: { label: 'Applied', tone: 'neutral' },
  screening: { label: 'Screening', tone: 'accent' },
  interview: { label: 'Interview', tone: 'accent' },
  rejected: { label: 'Rejected', tone: 'neutral' },
  hired: { label: 'Hired', tone: 'ok' },
  withdrawn: { label: 'Withdrawn', tone: 'neutral' },
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
        'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-bold',
        toneClass[config.tone],
        className
      )}
    >
      {PULSE.includes(status) && (
        <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
      )}
      {config.label}
    </span>
  );
};
