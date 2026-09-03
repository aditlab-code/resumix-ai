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
    <div className="bg-surface-sunken border border-surface-border rounded-md p-3 space-y-2.5 shadow-e1">
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

      {selectedJob && (
        <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5 text-caption text-ink-subtle px-1">
          <span>
            Min. pengalaman{' '}
            <strong className="text-ink-default font-semibold">{selectedJob.minimum_experience_months} bln</strong>
          </span>
          <span className="flex items-center gap-1.5 flex-wrap">
            Skill wajib:
            {selectedJob.mandatory_skills.map((skill) => (
              <span key={skill} className="px-2 py-0.5 bg-surface-base border border-surface-border rounded-sm text-[11px] font-semibold text-ink-default shadow-2xs">
                {skill}
              </span>
            ))}
          </span>
        </div>
      )}
    </div>
  );
};
