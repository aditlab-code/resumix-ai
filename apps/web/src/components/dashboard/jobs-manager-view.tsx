'use client';

import React, { useState } from 'react';
import { JobPosting } from '@/lib/types';
import { Plus, MapPin, Clock, Users, Edit3, Trash2, Briefcase } from 'lucide-react';
import { Button, Card, Toolbar, SearchInput, EmptyState } from '@/components/ui';

interface JobsManagerViewProps {
  jobs: JobPosting[];
  onOpenCreateJobModal: () => void;
  onSelectJobForCandidates: (jobId: string) => void;
  onEditJob: (job: JobPosting) => void;
  onDeleteJob: (jobId: string) => void;
}

export const JobsManagerView: React.FC<JobsManagerViewProps> = ({
  jobs,
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
          title={jobs.length === 0 ? 'No Job Openings Posted Yet' : 'No Jobs Found'}
          description={
            jobs.length === 0
              ? 'Post a new job opening or import job descriptions from LinkedIn/Glints to start screening resumes.'
              : 'No jobs matched your search criteria.'
          }
          actionLabel="Create New Job Opening"
          onAction={onOpenCreateJobModal}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((job) => (
            <Card key={job.id} interactive className="p-6 flex flex-col justify-between gap-5">
              <div className="space-y-4">
                <div className="flex justify-between items-start gap-2">
                  <div>
                    <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block mb-1">
                      {job.department}
                    </span>
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
                    <span>Min. <strong className="text-foreground font-semibold">{job.minimum_experience_months} mos</strong></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-muted-foreground/70 shrink-0" />
                    <span><strong className="text-foreground font-semibold">{job.applications_count}</strong> applicants</span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-1.5 pt-3.5 border-t border-border">
                  {job.mandatory_skills.map((skill) => (
                    <span
                      key={skill}
                      className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-secondary text-secondary-foreground border border-border"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => onSelectJobForCandidates(job.id)}
                className="w-full mt-2"
              >
                View applicants ({job.applications_count})
              </Button>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
