'use client';

import React from 'react';
import { CandidateApplication, JobPosting } from '@/lib/types';
import { Stat } from '@/components/ui';

interface StatsOverviewProps {
  jobs: JobPosting[];
  applications: CandidateApplication[];
  onOpenAuditLogs: () => void;
}

export const StatsOverview: React.FC<StatsOverviewProps> = ({
  jobs,
  applications,
  onOpenAuditLogs,
}) => {
  const activeJobs = jobs.filter((j) => j.status === 'open').length;
  const processing = applications.filter(
    (a) => a.parse_status === 'processing' || a.parse_status === 'queued'
  ).length;
  const warnings = applications.filter(
    (a) => a.parse_status === 'needs_review' || a.parse_status === 'failed'
  ).length;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      <Stat label="Lowongan Aktif" value={activeJobs} hint="terbuka" />
      <Stat label="Total Kandidat" value={applications.length} hint="aplikasi" />
      <Stat
        label="Diproses AI"
        value={processing}
        tone={processing > 0 ? 'accent' : 'ink'}
        hint={processing > 0 ? 'berjalan' : 'selesai'}
      />
      <Stat
        label="Perlu Review"
        value={warnings}
        tone="warn"
        hint="audit log"
        onClick={onOpenAuditLogs}
      />
    </div>
  );
};
