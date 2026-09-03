'use client';

import React from 'react';
import { ChevronRight, RefreshCw } from 'lucide-react';
import { CandidateApplication, JobPosting } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Column, StatusBadge } from '@/components/ui';

interface BuildColumnsArgs {
  jobs?: JobPosting[];
  onSelect: (app: CandidateApplication) => void;
  onReprocess?: (appId: string) => void;
}

const getScoreBadgeClass = (s: number) => {
  if (s >= 80) return 'bg-semantic-success_soft text-semantic-success border-semantic-success/20';
  if (s >= 60) return 'bg-semantic-warning_soft text-semantic-warning border-semantic-warning/20';
  return 'bg-semantic-danger_soft text-semantic-danger border-semantic-danger/20';
};

export function buildCandidateColumns({
  jobs,
  onSelect,
  onReprocess,
}: BuildColumnsArgs): Column<CandidateApplication>[] {
  const columns: Column<CandidateApplication>[] = [
    {
      key: 'candidate',
      header: 'Kandidat',
      render: (app) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-pill bg-surface-sunken border border-surface-border flex items-center justify-center font-bold text-ink-default text-caption shrink-0">
            {app.candidate_name.charAt(0)}
          </div>
          <div className="min-w-0">
            <span className="font-semibold text-body text-ink-default block group-hover:text-brand-accent transition-colors truncate">
              {app.candidate_name}
            </span>
            <span className="text-caption text-ink-subtle block truncate">{app.email}</span>
          </div>
        </div>
      ),
    },
  ];

  if (jobs) {
    columns.push({
      key: 'job',
      header: 'Lowongan',
      render: (app) => (
        <span className="text-caption font-semibold text-brand-accent">
          {jobs.find((j) => j.id === app.job_id)?.title || '—'}
        </span>
      ),
    });
  }

  columns.push(
    {
      key: 'score',
      header: 'Job-Fit Score',
      render: (app) => (
        <div className="flex items-center gap-2">
          <span className={cn('px-2.5 py-1 rounded-pill border text-caption font-bold tabular-nums', getScoreBadgeClass(app.job_fit_score))}>
            {app.job_fit_score}%
          </span>
          <span className="text-caption text-ink-subtle font-mono">
            {app.score_breakdown.matched_skills.length} skill
          </span>
        </div>
      ),
    },
    {
      key: 'experience',
      header: 'Pengalaman',
      render: (app) => (
        <span className="text-caption font-semibold text-ink-muted">
          {app.cv_extraction.total_experience_months || 0} bln
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (app) => (
        <div className="flex flex-wrap items-center gap-1.5">
          <StatusBadge status={app.status} />
          {app.parse_status !== 'processed' && <StatusBadge status={app.parse_status} />}
        </div>
      ),
    },
    {
      key: 'action',
      header: '',
      align: 'right',
      render: (app) => (
        <div onClick={(e) => e.stopPropagation()} className="flex justify-end">
          {onReprocess && app.parse_status === 'failed' ? (
            <button
              onClick={() => onReprocess(app.id)}
              className="inline-flex items-center gap-1 text-caption font-semibold text-semantic-warning bg-semantic-warning_soft px-3 py-1.5 rounded-md hover:bg-amber-200 transition-colors focus-ring"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Reprocess
            </button>
          ) : (
            <button
              onClick={() => onSelect(app)}
              className="inline-flex items-center gap-1 text-caption font-semibold text-ink-subtle bg-surface-sunken border border-surface-border px-3 py-1.5 rounded-md hover:text-ink-default hover:bg-surface-border transition-colors focus-ring"
            >
              Detail
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      ),
    }
  );

  return columns;
}
