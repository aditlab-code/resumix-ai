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
        onOpenCreateJobModal={() => setIsCreateJobModalOpen(true)}
        onSelectJobForCandidates={handleSelectJobForCandidates}
        onEditJob={(job) => setEditingJob(job)}
        onDeleteJob={(jobId) => setDeletingJob(jobs.find((j) => j.id === jobId) || null)}
      />

      {jobs.length === 0 ? (
        <EmptyState
          icon={<Briefcase className="w-8 h-8 text-brand-accent" />}
          title="Belum Ada Lowongan Kerja Diterbitkan"
          description="Sistem siap menerima kriteria lowongan. Buat lowongan kerja baru untuk mulai menerima dan menganalisis CV pelamar."
          actionLabel="Buat Lowongan Kerja Baru"
          onAction={() => setIsCreateJobModalOpen(true)}
        />
      ) : (
        <div className="space-y-6 pt-4 border-t border-surface-border">
          {/* Candidate Evaluation for Selected Job */}
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-1">
              <div>
                <h2 className="text-h2 font-bold text-ink-default">
                  Evaluasi Pelamar — <span className="text-brand-accent">{activeJob?.title || 'Posisi'}</span>
                </h2>
              </div>
            </div>

            {/* Global Underline Button Tabs */}
            <SubNavTab
              tabs={[
                { id: 'table', label: 'Tabel Pelamar', count: jobApplications.length },
                { id: 'kanban', label: 'Kanban Board' },
                { id: 'compare', label: 'Komparasi Matriks' },
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
