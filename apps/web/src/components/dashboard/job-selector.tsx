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
  const selectedJob = jobs.find((j) => j.id === selectedJobId) || jobs[0];

  return (
    <div className="bg-surface rounded p-2 space-y-2">
      <div className="flex items-center gap-1.5 overflow-x-auto">
        {jobs.map((job) => {
          const isSelected = job.id === selectedJobId;
          return (
            <button
              key={job.id}
              onClick={() => onSelectJob(job.id)}
              className={cn(
                'px-3 py-1.5 rounded text-xs font-bold flex items-center gap-1.5 shrink-0 transition-colors',
                isSelected
                  ? 'bg-accent text-accent-fg'
                  : 'bg-canvas text-ink-muted hover:text-ink'
              )}
            >
              {job.title}
              <span
                className={cn(
                  'px-1.5 rounded font-mono text-[10px]',
                  isSelected ? 'bg-white/20' : 'bg-line text-ink-muted'
                )}
              >
                {job.applications_count}
              </span>
            </button>
          );
        })}
      </div>

      {selectedJob && (
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-ink-muted px-1">
          <span>
            Min. pengalaman{' '}
            <strong className="text-ink">{selectedJob.minimum_experience_months} bln</strong>
          </span>
          <span className="flex items-center gap-1">
            Skill wajib:
            {selectedJob.mandatory_skills.map((skill) => (
              <span key={skill} className="px-1.5 py-0.5 bg-canvas rounded text-[11px] font-semibold text-ink">
                {skill}
              </span>
            ))}
          </span>
        </div>
      )}
    </div>
  );
};
