'use client';

import React from 'react';
import { CandidateApplication, JobPosting } from '@/lib/types';
import { Stat } from '@/components/ui';

interface StatsOverviewProps {
  jobs: JobPosting[];
  applications: CandidateApplication[];
  onNavigateToCandidates: () => void;
}

export const StatsOverview: React.FC<StatsOverviewProps> = ({
  jobs,
  applications,
  onNavigateToCandidates,
}) => {
  const activeJobs = jobs.filter((j) => j.status === 'open').length;
  const processing = applications.filter(
    (a) => a.parse_status === 'processing' || a.parse_status === 'queued'
  ).length;
  const warnings = applications.filter(
    (a) => a.parse_status === 'needs_review' || a.parse_status === 'failed'
  ).length;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
      <Stat label="Lowongan Aktif" value={activeJobs} hint="terbuka" variant="blue" />
      <Stat label="Total Kandidat" value={applications.length} hint="aplikasi" variant="indigo" />
      <Stat
        label="Diproses AI"
        value={processing}
        variant="amber"
        hint={processing > 0 ? 'berjalan' : 'selesai'}
      />
      <Stat
        label="Perlu Review"
        value={warnings}
        variant="red"
        hint="lihat kandidat"
        onClick={onNavigateToCandidates}
      />
    </div>
  );
};
