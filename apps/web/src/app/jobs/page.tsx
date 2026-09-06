'use client';

import React from 'react';
import { useAppData } from '@/context/app-data-context';
import { JobsManagerView } from '@/components/dashboard/jobs-manager-view';
import { CandidateTable } from '@/components/dashboard/candidate-table';
import { KanbanBoard } from '@/components/candidates/kanban-board';
import { CandidateComparator } from '@/components/candidates/candidate-comparator';
import { SubNavTab } from '@/components/dashboard/sub-nav-tab';
import { EmptyState } from '@/components/ui';
import { Briefcase } from 'lucide-react';

export default function JobsPage() {
  const {
    jobs,
    selectedJobId,
    activeJob,
    jobApplications,
    candidateViewMode,
    setCandidateViewMode,
    handleSelectJob,
    setIsCreateJobModalOpen,
    setIsUploadModalOpen,
    setEditingJob,
    setDeletingJob,
    setDeletingApplication,
    handleSelectCandidate,
    handleReprocessCv,
    handleStatusChange,
  } = useAppData();

  const handleSelectJobForCandidates = (jobId: string) => {
    handleSelectJob(jobId);
  };

  return (
    <div className="space-y-6">
      {/* 1. Job Management Cards */}
      <JobsManagerView
        jobs={jobs}
        selectedJobId={selectedJobId}
        onOpenCreateJobModal={() => setIsCreateJobModalOpen(true)}
        onSelectJobForCandidates={handleSelectJobForCandidates}
        onEditJob={(job) => setEditingJob(job)}
        onDeleteJob={(jobId) => setDeletingJob(jobs.find((j) => j.id === jobId) || null)}
      />

      {jobs.length === 0 ? (
        <EmptyState
          icon={<Briefcase className="w-8 h-8 text-brand-accent" />}
          title="No Job Openings Posted Yet"
          description="The system is ready for job criteria. Create a new job opening to start receiving and analyzing candidate resumes."
          actionLabel="Create New Job Opening"
          onAction={() => setIsCreateJobModalOpen(true)}
        />
      ) : (
        <div className="space-y-6 pt-4 border-t border-surface-border">
          {/* Candidate Evaluation for Selected Job */}
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-1">
              <div>
                <h2 className="text-h2 font-bold text-ink-default">
                  Applicant Evaluation — <span className="text-brand-accent">{activeJob?.title || 'Position'}</span>
                </h2>
              </div>
            </div>

            {/* Global Underline Button Tabs */}
            <SubNavTab
              tabs={[
                { id: 'table', label: 'Table', count: jobApplications.length },
                { id: 'kanban', label: 'Board' },
                { id: 'compare', label: 'Comparison' },
              ]}
              activeTab={candidateViewMode}
              onTabChange={setCandidateViewMode}
            />

            {/* Active Tab Content (Full Width Layout) */}
            {candidateViewMode === 'compare' ? (
              <CandidateComparator
                applications={jobApplications}
                onClose={() => setCandidateViewMode('table')}
              />
            ) : candidateViewMode === 'table' ? (
              <CandidateTable
                applications={jobApplications}
                onSelectCandidate={handleSelectCandidate}
                onReprocessCv={handleReprocessCv}
                onOpenUploadModal={() => setIsUploadModalOpen(true)}
                onDeleteCandidate={(app) => setDeletingApplication(app)}
              />
            ) : (
              <KanbanBoard
                applications={jobApplications}
                onSelectCandidate={handleSelectCandidate}
                onUpdateStatus={handleStatusChange}
                onDeleteCandidate={(app) => setDeletingApplication(app)}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}
