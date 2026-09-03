'use client';

import React from 'react';
import { ApplicationStatus, ParseStatus } from '@cv-ats/contracts';
import { cn } from '@/lib/utils';

export type StatusType = ApplicationStatus | ParseStatus;
type Tone = 'neutral' | 'accent' | 'ok' | 'warn' | 'danger';

const toneClass: Record<Tone, string> = {
  neutral: 'bg-slate-100 text-slate-800 border border-slate-300',
  accent: 'bg-blue-50 text-blue-800 border border-blue-300 font-bold',
  ok: 'bg-emerald-50 text-emerald-800 border border-emerald-300 font-bold',
  warn: 'bg-amber-50 text-amber-900 border border-amber-300 font-bold',
  danger: 'bg-red-50 text-red-800 border border-red-300 font-bold',
};

const statusMap: Record<StatusType, { label: string; tone: Tone }> = {
  // Parse statuses
  uploaded: { label: 'UPLOADED', tone: 'neutral' },
  queued: { label: 'QUEUED', tone: 'accent' },
  processing: { label: 'PROCESSING', tone: 'accent' },
  processed: { label: 'PROCESSED', tone: 'ok' },
  needs_review: { label: 'NEEDS REVIEW', tone: 'warn' },
  failed: { label: 'FAILED', tone: 'danger' },
  // Application statuses
  applied: { label: 'APPLIED', tone: 'neutral' },
  screening: { label: 'SCREENING', tone: 'accent' },
  interview: { label: 'INTERVIEW', tone: 'accent' },
  rejected: { label: 'REJECTED', tone: 'neutral' },
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
        'inline-flex items-center gap-1.5 rounded px-2 py-0.5 text-[10px] font-mono tracking-wider uppercase shadow-2xs',
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
