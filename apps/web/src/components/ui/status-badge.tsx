'use client';

import React from 'react';
import { ApplicationStatus, ParseStatus } from '@cv-ats/contracts';

export type StatusType = ApplicationStatus | ParseStatus;

interface StatusBadgeProps {
  status: StatusType;
  className?: string;
}

const statusConfig: Record<
  StatusType,
  { label: string; bg: string; text: string; border: string; dotColor: string }
> = {
  // Parse Statuses
  uploaded: {
    label: 'Uploaded',
    bg: 'bg-slate-100',
    text: 'text-slate-700',
    border: 'border-slate-300',
    dotColor: 'bg-slate-500',
  },
  queued: {
    label: 'Queued',
    bg: 'bg-blue-50',
    text: 'text-blue-700',
    border: 'border-blue-200',
    dotColor: 'bg-blue-500',
  },
  processing: {
    label: 'Processing AI',
    bg: 'bg-sky-50',
    text: 'text-sky-700',
    border: 'border-sky-200',
    dotColor: 'bg-sky-500',
  },
  processed: {
    label: 'Processed',
    bg: 'bg-emerald-50',
    text: 'text-emerald-700',
    border: 'border-emerald-200',
    dotColor: 'bg-emerald-500',
  },
  needs_review: {
    label: 'Needs Review',
    bg: 'bg-amber-50',
    text: 'text-amber-800',
    border: 'border-amber-200',
    dotColor: 'bg-amber-500',
  },
  failed: {
    label: 'Failed',
    bg: 'bg-rose-50',
    text: 'text-rose-700',
    border: 'border-rose-200',
    dotColor: 'bg-rose-500',
  },
  // Application Statuses
  applied: {
    label: 'Applied',
    bg: 'bg-indigo-50',
    text: 'text-indigo-700',
    border: 'border-indigo-200',
    dotColor: 'bg-indigo-500',
  },
  screening: {
    label: 'Screening',
    bg: 'bg-cyan-50',
    text: 'text-cyan-800',
    border: 'border-cyan-200',
    dotColor: 'bg-cyan-500',
  },
  interview: {
    label: 'Interview',
    bg: 'bg-violet-50',
    text: 'text-violet-700',
    border: 'border-violet-200',
    dotColor: 'bg-violet-500',
  },
  rejected: {
    label: 'Rejected',
    bg: 'bg-stone-100',
    text: 'text-stone-600',
    border: 'border-stone-300',
    dotColor: 'bg-stone-400',
  },
  hired: {
    label: 'Hired',
    bg: 'bg-teal-50',
    text: 'text-teal-800',
    border: 'border-teal-200',
    dotColor: 'bg-teal-500',
  },
  withdrawn: {
    label: 'Withdrawn',
    bg: 'bg-slate-100',
    text: 'text-slate-500',
    border: 'border-slate-300',
    dotColor: 'bg-slate-400',
  },
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className = '' }) => {
  const config = statusConfig[status] || statusConfig.uploaded;
  const isPulse = status === 'processing' || status === 'queued' || status === 'needs_review';

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${config.bg} ${config.text} ${config.border} ${className}`}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full ${config.dotColor} mr-1.5 ${
          isPulse ? 'animate-ping' : ''
        }`}
      />
      {config.label}
    </span>
  );
};
