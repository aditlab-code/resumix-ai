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

const scoreTone = (s: number) =>
  s >= 80 ? 'text-accent' : s >= 60 ? 'text-ink' : 'text-warn';

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
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded bg-canvas flex items-center justify-center font-extrabold text-ink-muted text-xs shrink-0">
            {app.candidate_name.charAt(0)}
          </div>
          <div className="min-w-0">
            <span className="font-bold text-ink block group-hover:text-accent transition-colors truncate">
              {app.candidate_name}
            </span>
            <span className="text-xs text-ink-subtle block truncate">{app.email}</span>
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
        <span className="text-xs font-semibold text-accent">
          {jobs.find((j) => j.id === app.job_id)?.title || '—'}
        </span>
      ),
    });
  }

  columns.push(
    {
      key: 'score',
      header: 'Job-Fit',
      render: (app) => (
        <div className="flex items-baseline gap-1.5">
          <span className={cn('font-mono font-extrabold text-sm', scoreTone(app.job_fit_score))}>
            {app.job_fit_score}%
          </span>
          <span className="text-[10px] text-ink-subtle font-mono">
            {app.score_breakdown.matched_skills.length} skill
          </span>
        </div>
      ),
    },
    {
      key: 'experience',
      header: 'Pengalaman',
      render: (app) => (
        <span className="text-xs font-semibold text-ink-muted">
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
              className="inline-flex items-center gap-1 text-xs font-semibold text-warn bg-warn-soft px-2.5 py-1 rounded hover:bg-warn/15 transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Reprocess
            </button>
          ) : (
            <button
              onClick={() => onSelect(app)}
              className="inline-flex items-center gap-1 text-xs font-bold text-ink-muted bg-canvas px-2.5 py-1 rounded hover:text-ink transition-colors"
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
