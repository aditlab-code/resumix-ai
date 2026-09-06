'use client';

import React, { useState } from 'react';
import { JobPosting } from '@/lib/types';
import { Plus, MapPin, Clock, Users, Edit3, Trash2, Briefcase } from 'lucide-react';
import { Button, Card, Toolbar, SearchInput, EmptyState } from '@/components/ui';

import { cn } from '@/lib/utils';

interface JobsManagerViewProps {
  jobs: JobPosting[];
  selectedJobId?: string;
  onOpenCreateJobModal: () => void;
  onSelectJobForCandidates: (jobId: string) => void;
  onEditJob: (job: JobPosting) => void;
  onDeleteJob: (jobId: string) => void;
}

export const JobsManagerView: React.FC<JobsManagerViewProps> = ({
  jobs,
  selectedJobId,
  onOpenCreateJobModal,
  onSelectJobForCandidates,
  onEditJob,
  onDeleteJob,
}) => {
  const [query, setQuery] = useState('');

  const filtered = jobs.filter(
    (j) =>
      j.title.toLowerCase().includes(query.toLowerCase()) ||
      j.department.toLowerCase().includes(query.toLowerCase()) ||
      j.mandatory_skills.some((s) => s.toLowerCase().includes(query.toLowerCase()))
  );

  return (
    <div className="space-y-6 w-full min-w-0">
      <Toolbar>
        <SearchInput
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search position, division, or skill criteria..."
          className="w-full sm:max-w-md"
        />
      </Toolbar>

      {filtered.length === 0 ? (
        <EmptyState
          icon={<Briefcase className="w-8 h-8 text-brand-accent" />}
          title={jobs.length === 0 ? 'No Job Available Posted Yet' : 'No Jobs Found'}
          description={
            jobs.length === 0
              ? 'Post a new job Available or import job descriptions from LinkedIn/Glints to start screening resumes.'
              : 'No jobs matched your search criteria.'
          }
          actionLabel="Create New Job Available"
          onAction={onOpenCreateJobModal}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((job) => {
            const isActive = selectedJobId === job.id;
            return (
              <Card
                key={job.id}
                interactive
                className={cn(
                  'p-6 flex flex-col justify-between gap-5 transition-all duration-200 border shadow-xs',
                  isActive
                    ? 'bg-blue-50/60 border-blue-500 ring-1 ring-blue-500 shadow-sm'
                    : 'bg-slate-50/80 border-slate-200 hover:border-blue-300'
                )}
              >
                <div className="space-y-4">
                  <div className="flex justify-between items-start gap-2">
                    <div>
                      <div className="flex items-center gap-2.5 min-w-0 mb-1">
                        <div className="flex flex-col gap-0.5 shrink-0" aria-hidden="true">
                          <span className={cn('w-1 h-1 rounded-full', isActive ? 'bg-blue-600' : 'bg-slate-400')} />
                          <span className={cn('w-1 h-1 rounded-full', isActive ? 'bg-blue-600' : 'bg-slate-400')} />
                          <span className={cn('w-1 h-1 rounded-full', isActive ? 'bg-blue-600' : 'bg-slate-400')} />
                        </div>
                        <span className={cn('text-xs font-extrabold uppercase tracking-wider block truncate', isActive ? 'text-blue-950' : 'text-slate-600')}>
                          {job.department}
                        </span>
                      </div>
                      <h3 className="text-lg font-bold text-foreground leading-snug">{job.title}</h3>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => onEditJob(job)}
                        className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors focus-ring"
                        aria-label="Edit job"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onDeleteJob(job.id)}
                        className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-md transition-colors focus-ring"
                        aria-label="Delete job"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2 text-xs text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-muted-foreground/70 shrink-0" />
                      <span>{job.location}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-muted-foreground/70 shrink-0" />
                      <span>Min. <strong className="text-foreground font-bold font-mono tabular-nums">{job.minimum_experience_months} mos</strong></span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-muted-foreground/70 shrink-0" />
                      <span><strong className="text-foreground font-extrabold font-mono tabular-nums">{job.applications_count}</strong> applicants</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1.5 pt-3.5 border-t border-border">
                    {job.mandatory_skills.map((skill) => (
                      <span
                        key={skill}
                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-800 border border-slate-300 shadow-2xs"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                <Button
                  variant={isActive ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => onSelectJobForCandidates(job.id)}
                  className="w-full mt-2"
                >
                  View applicants ({job.applications_count})
                </Button>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};
