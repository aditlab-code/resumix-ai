'use client';

import React from 'react';
import { useAppData } from '@/context/app-data-context';
import { GlobalCandidatesView } from '@/components/dashboard/global-candidates-view';

export default function CandidatesPage() {
  const {
    applications,
    jobs,
    handleSelectCandidate,
    setIsUploadModalOpen,
    setDeletingApplication,
    handleReprocessCv,
    handleStatusChange,
  } = useAppData();

  return (
    <div className="space-y-6">
      <GlobalCandidatesView
        applications={applications}
        jobs={jobs}
        onSelectCandidate={handleSelectCandidate}
        onOpenUploadModal={() => setIsUploadModalOpen(true)}
        onDeleteCandidate={(app) => setDeletingApplication(app)}
        onReprocessCv={handleReprocessCv}
        onUpdateStatus={handleStatusChange}
      />
    </div>
  );
}
