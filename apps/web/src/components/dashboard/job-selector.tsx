'use client';

import React from 'react';
import { JobPosting } from '@/lib/types';
import { cn } from '@/lib/utils';

interface JobSelectorProps {
  jobs: JobPosting[];
  selectedJobId: string;
  onSelectJob: (jobId: string) => void;
}

export const JobSelector: React.FC<JobSelectorProps> = ({ jobs, selectedJobId, onSelectJob }) => {
  return (
    <div className="bg-surface-sunken border border-surface-border rounded-md p-3 shadow-e1">
      <div className="flex items-center gap-2 overflow-x-auto">
        {jobs.map((job) => {
          const isSelected = job.id === selectedJobId;
          return (
            <button
              key={job.id}
              onClick={() => onSelectJob(job.id)}
              className={cn(
                'px-3.5 py-2 rounded-md text-caption flex items-center gap-2 shrink-0 focus-ring',
                isSelected
                  ? 'bg-brand-accent text-white font-bold shadow-e1'
                  : 'bg-surface-base text-ink-subtle font-semibold border border-surface-border hover:bg-surface-border hover:text-ink-default'
              )}
            >
              {job.title}
              <span
                className={cn(
                  'px-2 py-0.5 rounded-pill text-[11px] font-semibold',
                  isSelected ? 'bg-white/20 text-white' : 'bg-surface-sunken text-ink-subtle border border-surface-border'
                )}
              >
                {job.applications_count}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
