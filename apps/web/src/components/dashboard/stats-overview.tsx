'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { CandidateApplication, JobPosting } from '@/lib/types';
import { Stat } from '@/components/ui';

interface StatsOverviewProps {
  jobs: JobPosting[];
  applications: CandidateApplication[];
  onNavigateToCandidates?: () => void;
}

export const StatsOverview: React.FC<StatsOverviewProps> = ({
  jobs,
  applications,
  onNavigateToCandidates,
}) => {
  const router = useRouter();

  const handleNavigate = () => {
    if (onNavigateToCandidates) {
      onNavigateToCandidates();
    } else {
      router.push('/candidates');
    }
  };

  const activeJobs = jobs.filter((j) => j.status === 'open').length;
  const processing = applications.filter(
    (a) => a.parse_status === 'processing' || a.parse_status === 'queued'
  ).length;
  const warnings = applications.filter(
    (a) => a.parse_status === 'needs_review' || a.parse_status === 'failed'
  ).length;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
      <Stat
        label="Available Jobs"
        value={activeJobs}
        hint="Open Positions"
        variant="blue"
        onClick={() => router.push('/jobs')}
      />
      <Stat
        label="Total Applied"
        value={applications.length}
        hint="All Applications"
        variant="indigo"
        onClick={() => router.push('/candidates')}
      />
      <Stat
        label="In Progress"
        value={processing}
        variant="amber"
        hint={processing > 0 ? 'Processing' : 'Idle'}
      />
      <Stat
        label="Attention Needed"
        value={warnings}
        variant="red"
        hint="Review"
        onClick={handleNavigate}
      />
    </div>
  );
};
