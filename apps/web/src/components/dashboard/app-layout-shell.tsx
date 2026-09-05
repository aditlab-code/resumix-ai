'use client';

import React, { useState } from 'react';
import { Sidebar } from '@/components/dashboard/sidebar';
import { Header } from '@/components/dashboard/header';
import { useAppData } from '@/context/app-data-context';
import { CvUploadModal } from '@/components/dashboard/cv-upload-modal';
import { JobFormModal } from '@/components/dashboard/job-form-modal';
import { AuditLogModal } from '@/components/dashboard/audit-log-modal';
import { SkillTaxonomyModal } from '@/components/dashboard/skill-taxonomy-modal';
import { CandidateDetailDrawer } from '@/components/dashboard/candidate-detail-drawer';
import { DeleteCandidateModal } from '@/components/dashboard/delete-candidate-modal';
import { ToastContainer } from '@/components/ui/toast';
import { ConfirmDialog } from '@/components/ui';

export function AppLayoutShell({ children }: { children: React.ReactNode }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const {
    isMounted,
    jobs,
    selectedJobId,
    activeJob,
    selectedCandidate,
    setSelectedCandidate,
    editingJob,
    setEditingJob,
    deletingJob,
    setDeletingJob,
    deletingApplication,
    setDeletingApplication,
    isUploadModalOpen,
    setIsUploadModalOpen,
    isCreateJobModalOpen,
    setIsCreateJobModalOpen,
    isAuditLogModalOpen,
    setIsAuditLogModalOpen,
    isSkillTaxonomyModalOpen,
    setIsSkillTaxonomyModalOpen,
    auditLogs,
    toasts,
    dismissToast,
    addToast,
    addAuditLog,
    handleClearAuditLogs,
    handleCreateJobSuccess,
    handleEditJobSuccess,
    confirmDeleteJob,
    handleUploadSuccess,
    handleStatusChange,
    handleSaveEditSuccess,
    handleReprocessCv,
    handleConfirmDeleteCandidate,
  } = useAppData();

  if (!isMounted) {
    return (
      <div className="p-6 space-y-3 animate-pulse">
        <div className="h-10 bg-surface border border-line rounded" />
        <div className="grid grid-cols-4 gap-3 h-24">
          <div className="bg-surface border border-line rounded" />
          <div className="bg-surface border border-line rounded" />
          <div className="bg-surface border border-line rounded" />
          <div className="bg-surface border border-line rounded" />
        </div>
        <div className="h-64 bg-surface border border-line rounded" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-surface-canvas text-ink-default">
      <Sidebar
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
      />

      <main className="flex-1 p-6 space-y-6 w-full min-w-0 max-w-[1440px] mx-auto">
        <Header
          onSaveSettings={() =>
            addToast('success', 'Settings saved', 'All ATS pipeline parameters were successfully updated.')
          }
          onToggleMobileMenu={() => setIsMobileMenuOpen((prev) => !prev)}
        />

        {children}

        <CvUploadModal
          isOpen={isUploadModalOpen}
          onClose={() => setIsUploadModalOpen(false)}
          jobs={jobs}
          selectedJobId={selectedJobId}
          onUploadSuccess={handleUploadSuccess}
        />

        <JobFormModal
          mode="create"
          isOpen={isCreateJobModalOpen}
          onClose={() => setIsCreateJobModalOpen(false)}
          onSuccess={handleCreateJobSuccess}
        />

        <JobFormModal
          mode="edit"
          isOpen={!!editingJob}
          job={editingJob}
          onClose={() => setEditingJob(null)}
          onSuccess={handleEditJobSuccess}
        />

        <AuditLogModal
          isOpen={isAuditLogModalOpen}
          onClose={() => setIsAuditLogModalOpen(false)}
          logs={auditLogs}
          onClearLogs={handleClearAuditLogs}
        />

        <SkillTaxonomyModal
          isOpen={isSkillTaxonomyModalOpen}
          onClose={() => setIsSkillTaxonomyModalOpen(false)}
          onAddToast={addToast}
          onAddAuditLog={addAuditLog}
        />

        <CandidateDetailDrawer
          isOpen={!!selectedCandidate}
          onClose={() => setSelectedCandidate(null)}
          application={selectedCandidate}
          job={activeJob}
          onStatusChange={handleStatusChange}
          onSaveExtraction={handleSaveEditSuccess}
          onReprocessCv={handleReprocessCv}
          onDeleteCandidate={(app) => setDeletingApplication(app)}
        />

        <DeleteCandidateModal
          isOpen={!!deletingApplication}
          onClose={() => setDeletingApplication(null)}
          application={deletingApplication}
          onConfirmDelete={handleConfirmDeleteCandidate}
        />

        <ConfirmDialog
          isOpen={!!deletingJob}
          onClose={() => setDeletingJob(null)}
          onConfirm={confirmDeleteJob}
          title="Delete Job Available"
          message={`Delete job "${deletingJob?.title}"? This action cannot be undone.`}
          confirmLabel="Delete"
          tone="danger"
        />

        <ToastContainer
          toasts={toasts}
          onDismiss={dismissToast}
        />
      </main>
    </div>
  );
}
