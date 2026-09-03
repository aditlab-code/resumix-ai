'use client';

import React, { useState, useEffect } from 'react';
import { Sidebar } from '@/components/dashboard/sidebar';
import { Header, ActiveViewType } from '@/components/dashboard/header';
import { StatsOverview } from '@/components/dashboard/stats-overview';
import { JobSelector } from '@/components/dashboard/job-selector';
import { CandidateTable } from '@/components/dashboard/candidate-table';
import { KanbanBoard } from '@/components/candidates/kanban-board';
import { CandidateComparator } from '@/components/candidates/candidate-comparator';
import { ScoreBreakdownCard } from '@/components/scoring/score-breakdown';
import { JobsManagerView } from '@/components/dashboard/jobs-manager-view';
import { GlobalCandidatesView } from '@/components/dashboard/global-candidates-view';
import { PipelineSettingsView } from '@/components/dashboard/pipeline-settings-view';

import { CvUploadModal } from '@/components/dashboard/cv-upload-modal';
import { JobFormModal } from '@/components/dashboard/job-form-modal';
import { AuditLogModal } from '@/components/dashboard/audit-log-modal';
import { SkillTaxonomyModal } from '@/components/dashboard/skill-taxonomy-modal';
import { CandidateDetailDrawer } from '@/components/dashboard/candidate-detail-drawer';
import { DeleteCandidateModal } from '@/components/dashboard/delete-candidate-modal';
import { ToastContainer, ToastMessage } from '@/components/ui/toast';
import { Card, ConfirmDialog, Button, EmptyState } from '@/components/ui';
import { Scale, Table, Kanban, Briefcase } from 'lucide-react';

import { INITIAL_JOBS, INITIAL_APPLICATIONS, INITIAL_AUDIT_LOGS } from '@/lib/mock-data';
import { JobPosting, CandidateApplication, AuditLogItem } from '@/lib/types';
import { ApplicationStatus } from '@cv-ats/contracts';
import { fetchJobs, fetchJobApplications, updateApplicationStatus as apiUpdateStatus } from '@/lib/api-client';

import { SAMPLE_PDF_BASE64 } from '@/lib/sample-pdf';

export default function HRDashboardPage() {
  const [activeView, setActiveView] = useState<ActiveViewType>('dashboard');
  const [candidateViewMode, setCandidateViewMode] = useState<'table' | 'kanban' | 'compare'>('table');
  const [isMounted, setIsMounted] = useState(false);

  const [jobs, setJobs] = useState<JobPosting[]>(INITIAL_JOBS);
  const [applications, setApplications] = useState<CandidateApplication[]>(INITIAL_APPLICATIONS);
  const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>(INITIAL_AUDIT_LOGS);

  // Restore state from localStorage or API
  useEffect(() => {
    async function loadLiveData() {
      try {
        const savedJobs = localStorage.getItem('cv_ats_jobs');
        if (savedJobs !== null) {
          const parsed = JSON.parse(savedJobs);
          if (Array.isArray(parsed)) {
            setJobs(parsed);
          }
        } else {
          const liveJobsResponse = await fetchJobs().catch(() => null);
          if (liveJobsResponse && Array.isArray(liveJobsResponse.data) && liveJobsResponse.data.length > 0) {
            setJobs(liveJobsResponse.data);
          } else {
            setJobs(INITIAL_JOBS);
          }
        }

        const savedApps = localStorage.getItem('cv_ats_applications');
        if (savedApps) {
          const parsed = JSON.parse(savedApps);
          if (Array.isArray(parsed)) {
            // Filter out old demo applications
            const realApps = parsed.filter(
              (app: any) => !['app-101', 'app-102', 'app-103', 'app-104'].includes(app.id)
            );
            setApplications(
              realApps.map((app: any) => ({
                ...app,
                pdf_url: app.pdf_url || SAMPLE_PDF_BASE64,
              }))
            );
          }
        } else {
          setApplications([]);
        }

        const savedLogs = localStorage.getItem('cv_ats_audit_logs');
        if (savedLogs) {
          const parsed = JSON.parse(savedLogs);
          if (Array.isArray(parsed)) setAuditLogs(parsed);
        }
      } catch (e) {
        console.error('Failed to load initial data:', e);
      } finally {
        setIsMounted(true);
      }
    }
    loadLiveData();
  }, []);

  useEffect(() => {
    if (isMounted) localStorage.setItem('cv_ats_jobs', JSON.stringify(jobs));
  }, [jobs, isMounted]);

  useEffect(() => {
    if (isMounted) localStorage.setItem('cv_ats_applications', JSON.stringify(applications));
  }, [applications, isMounted]);

  useEffect(() => {
    if (isMounted) localStorage.setItem('cv_ats_audit_logs', JSON.stringify(auditLogs));
  }, [auditLogs, isMounted]);

  const [selectedJobId, setSelectedJobId] = useState<string>('job-1');
  const [selectedCandidate, setSelectedCandidate] = useState<CandidateApplication | null>(null);
  const [deletingApplication, setDeletingApplication] = useState<CandidateApplication | null>(null);
  const [editingJob, setEditingJob] = useState<JobPosting | null>(null);
  const [deletingJob, setDeletingJob] = useState<JobPosting | null>(null);
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);

  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isCreateJobModalOpen, setIsCreateJobModalOpen] = useState(false);
  const [isAuditLogModalOpen, setIsAuditLogModalOpen] = useState(false);
  const [isSkillTaxonomyModalOpen, setIsSkillTaxonomyModalOpen] = useState(false);

  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = (type: 'success' | 'error' | 'info', title: string, description?: string) => {
    setToasts((prev) => [
      ...prev,
      { id: `toast-${Date.now()}-${Math.random()}`, type, title, description },
    ]);
  };

  const addAuditLog = (action: string, entity: string, entityId: string, details: string) => {
    const newLog: AuditLogItem = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString(),
      actor: 'HR Specialist (User)',
      action,
      target_entity: entity,
      entity_id: entityId,
      details,
    };
    setAuditLogs((prev) => [newLog, ...prev]);
  };

  const handleClearAuditLogs = () => {
    setAuditLogs([]);
    if (typeof window !== 'undefined') localStorage.setItem('cv_ats_audit_logs', '[]');
    addToast('info', 'Audit log dibersihkan', 'Seluruh catatan aktivitas dihapus.');
  };

  const confirmResetData = () => {
    setJobs(INITIAL_JOBS.map((j) => ({ ...j, applications_count: 0 })));
    setApplications([]);
    setAuditLogs([]);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('cv_ats_jobs');
      localStorage.removeItem('cv_ats_applications');
      localStorage.removeItem('cv_ats_audit_logs');
    }
    addToast('info', 'Data pelamar dibersihkan', 'Sistem siap menerima unggahan berkas CV PDF asli.');
  };

  const handleSelectJob = (jobId: string) => setSelectedJobId(jobId);

  const handleSelectJobForCandidates = (jobId: string) => {
    setSelectedJobId(jobId);
    setActiveView('dashboard');
  };

  const jobApplications = applications.filter((app) => app.job_id === selectedJobId);
  const activeJob = jobs.find((j) => j.id === selectedJobId) || jobs[0] || INITIAL_JOBS[0];

  const featuredCandidate =
    selectedCandidate && selectedCandidate.job_id === selectedJobId
      ? selectedCandidate
      : jobApplications.length > 0
        ? [...jobApplications].sort((a, b) => b.job_fit_score - a.job_fit_score)[0]
        : null;

  const handleCreateJobSuccess = (newJob: JobPosting) => {
    setJobs((prev) => [newJob, ...prev]);
    setSelectedJobId(newJob.id);
    addAuditLog(
      'job_created',
      'job_postings',
      newJob.id,
      `Menerbitkan lowongan baru "${newJob.title}" dengan skill wajib [${newJob.mandatory_skills.join(', ')}].`
    );
    addToast('success', 'Lowongan baru diterbitkan', `Posisi ${newJob.title} siap menerima CV.`);
  };

  const handleEditJobSuccess = (updatedJob: JobPosting) => {
    setJobs((prev) => prev.map((j) => (j.id === updatedJob.id ? updatedJob : j)));
    addAuditLog(
      'job_updated',
      'job_postings',
      updatedJob.id,
      `Memperbarui kriteria lowongan "${updatedJob.title}" (skill wajib: [${updatedJob.mandatory_skills.join(', ')}]).`
    );
    addToast('success', 'Lowongan diperbarui', `Kriteria posisi ${updatedJob.title} disimpan.`);
  };

  const confirmDeleteJob = () => {
    const jobToDelete = deletingJob;
    if (!jobToDelete) return;

    setJobs((prev) => prev.filter((j) => j.id !== jobToDelete.id));
    if (selectedJobId === jobToDelete.id) {
      const remaining = jobs.filter((j) => j.id !== jobToDelete.id);
      setSelectedJobId(remaining[0]?.id || '');
    }
    setApplications((prev) => prev.filter((a) => a.job_id !== jobToDelete.id));
    setDeletingJob(null);

    addAuditLog(
      'job_deleted',
      'job_postings',
      jobToDelete.id,
      `Menghapus lowongan kerja "${jobToDelete.title}".`
    );
    addToast('error', 'Lowongan dihapus', `Posisi ${jobToDelete.title} telah dihapus.`);
  };

  const handleUploadSuccess = (newApp: CandidateApplication) => {
    setSelectedJobId(newApp.job_id);
    if (candidateViewMode === 'compare') setCandidateViewMode('table');

    setApplications((prev) => [newApp, ...prev.filter((a) => a.id !== newApp.id)]);
    setJobs((prev) =>
      prev.map((j) =>
        j.id === newApp.job_id ? { ...j, applications_count: (j.applications_count || 0) + 1 } : j
      )
    );
    addAuditLog(
      'cv_uploaded',
      'candidate_documents',
      newApp.document_id,
      `Berhasil mengunggah CV ${newApp.original_filename} untuk kandidat ${newApp.candidate_name}. Parse status: ${newApp.parse_status}.`
    );
    addToast(
      'success',
      'CV diunggah & diproses AI',
      `Kandidat ${newApp.candidate_name} mendapat Job-Fit Score ${newApp.job_fit_score}/100.`
    );
    setSelectedCandidate(newApp);
  };

  const handleStatusChange = async (appId: string, newStatus: ApplicationStatus) => {
    // Sync with backend API
    apiUpdateStatus(appId, newStatus).catch((err) => {
      console.warn('[HRDashboardPage] Status API sync note:', err.message);
    });

    setApplications((prev) =>
      prev.map((app) => (app.id === appId ? { ...app, status: newStatus } : app))
    );
    if (selectedCandidate?.id === appId) {
      setSelectedCandidate((prev) => (prev ? { ...prev, status: newStatus } : null));
    }
    const appName = applications.find((a) => a.id === appId)?.candidate_name || 'Kandidat';
    addAuditLog(
      'application_status_changed',
      'applications',
      appId,
      `Mengubah status rekrutmen kandidat ${appName} menjadi "${newStatus}".`
    );
    addToast('info', 'Status aplikasi diperbarui', `Status ${appName} kini "${newStatus}".`);
  };

  const handleSaveEditSuccess = (updatedApp: CandidateApplication) => {
    setApplications((prev) => prev.map((app) => (app.id === updatedApp.id ? updatedApp : app)));
    if (selectedCandidate?.id === updatedApp.id) setSelectedCandidate(updatedApp);
    addAuditLog(
      'candidate_profile_edited',
      'candidates',
      updatedApp.candidate_id,
      `HR melakukan koreksi manual data ekstraksi AI untuk ${updatedApp.candidate_name}. Job-Fit score baru: ${updatedApp.job_fit_score}.`
    );
    addToast(
      'success',
      'Data ekstraksi diperbarui',
      `Skor Job-Fit ${updatedApp.candidate_name} dihitung ulang menjadi ${updatedApp.job_fit_score}/100.`
    );
  };

  const handleReprocessCv = async (appId: string) => {
    const app = applications.find((a) => a.id === appId);
    if (!app) return;

    addToast('info', 'Reprocessing diantrekan', `Mulai pemrosesan ulang AI untuk ${app.candidate_name}...`);
    setApplications((prev) =>
      prev.map((a) => (a.id === appId ? { ...a, parse_status: 'processing' } : a))
    );

    await new Promise((r) => setTimeout(r, 1500));

    setApplications((prev) =>
      prev.map((a) =>
        a.id === appId
          ? {
              ...a,
              parse_status: 'processed',
              parse_error: undefined,
              cv_extraction: { ...a.cv_extraction, extraction_warnings: [] },
            }
          : a
      )
    );

    if (selectedCandidate?.id === appId) {
      setSelectedCandidate((prev) =>
        prev
          ? {
              ...prev,
              parse_status: 'processed',
              parse_error: undefined,
              cv_extraction: { ...prev.cv_extraction, extraction_warnings: [] },
            }
          : null
      );
    }

    addAuditLog(
      'cv_processing_completed',
      'applications',
      appId,
      `Pekerjaan reprocessing CV selesai untuk ${app.candidate_name}. Status diset ke "processed".`
    );
    addToast('success', 'Reprocessing selesai', `CV ${app.candidate_name} sukses diproses ulang.`);
  };

  const handleConfirmDeleteCandidate = (appId: string) => {
    const targetApp = applications.find((a) => a.id === appId);
    if (!targetApp) return;

    setApplications((prev) => prev.filter((a) => a.id !== appId));
    setJobs((prev) =>
      prev.map((j) =>
        j.id === targetApp.job_id
          ? { ...j, applications_count: Math.max(0, (j.applications_count || 1) - 1) }
          : j
      )
    );
    if (selectedCandidate?.id === appId) setSelectedCandidate(null);
    setDeletingApplication(null);

    addAuditLog(
      'candidate_data_deleted',
      'candidates',
      targetApp.candidate_id,
      `Hapus permanen kandidat ${targetApp.candidate_name} (${targetApp.email}) beserta dokumen privat dan Job-Fit score dari database.`
    );
    addToast(
      'error',
      'Kandidat dihapus permanen',
      `Data kandidat ${targetApp.candidate_name} telah dihapus total.`
    );
  };

  const handleSelectCandidate = (app: CandidateApplication) => {
    setSelectedCandidate(app);
    addAuditLog(
      'cv_viewed',
      'candidate_documents',
      app.document_id,
      `HR meninjau detail profil kandidat & CV ${app.candidate_name}.`
    );
  };

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
    <div className="flex min-h-screen bg-canvas text-ink">
      <Sidebar
        activeView={activeView}
        onViewChange={setActiveView}
        onResetData={() => setIsResetConfirmOpen(true)}
      />

      <main className="flex-1 p-6 space-y-4 overflow-y-auto w-full min-w-0">
        <Header
          activeView={activeView}
          onOpenUploadModal={() => setIsUploadModalOpen(true)}
          onOpenCreateJobModal={() => setIsCreateJobModalOpen(true)}
          onOpenAuditLogs={() => setIsAuditLogModalOpen(true)}
          onOpenSkillTaxonomyModal={() => setIsSkillTaxonomyModalOpen(true)}
        />

        {activeView === 'dashboard' && (
          <>
            <StatsOverview
              jobs={jobs}
              applications={applications}
              onOpenAuditLogs={() => setIsAuditLogModalOpen(true)}
            />

            {jobs.length === 0 ? (
              <EmptyState
                icon={<Briefcase className="w-8 h-8 text-accent" />}
                title="Belum Ada Lowongan Kerja Diterbitkan"
                description="Sistem siap menerima kriteria lowongan. Buat lowongan kerja baru atau impor deskripsi posisi dari LinkedIn/Glints untuk mulai menerima dan meng-analisis CV pelamar."
                actionLabel="Buat Lowongan Kerja Baru"
                onAction={() => setIsCreateJobModalOpen(true)}
              />
            ) : (
              <>
                <JobSelector
                  jobs={jobs}
                  selectedJobId={selectedJobId}
                  onSelectJob={handleSelectJob}
                />

                {/* Unified Candidate Navigation Bar & View Content */}
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-3 px-1 border-b border-line pb-2.5">
                    <div>
                      <h2>Kandidat — {activeJob?.title || 'Posisi'}</h2>
                      <p className="text-xs text-ink-muted">
                        {jobApplications.length} pelamar terdaftar
                      </p>
                    </div>

                    {/* Unified Segmented Nav Tab Control */}
                    <div className="flex items-center bg-surface border border-line p-1 rounded-lg shadow-2xs">
                      <button
                        onClick={() => setCandidateViewMode('table')}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-all text-xs font-semibold ${
                          candidateViewMode === 'table'
                            ? 'bg-accent text-accent-fg shadow-2xs font-bold'
                            : 'text-ink-muted hover:text-ink hover:bg-canvas'
                        }`}
                      >
                        <Table className="w-3.5 h-3.5" />
                        Table
                      </button>
                      
                      <button
                        onClick={() => setCandidateViewMode('kanban')}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-all text-xs font-semibold ${
                          candidateViewMode === 'kanban'
                            ? 'bg-accent text-accent-fg shadow-2xs font-bold'
                            : 'text-ink-muted hover:text-ink hover:bg-canvas'
                        }`}
                      >
                        <Kanban className="w-3.5 h-3.5" />
                        Kanban
                      </button>

                      <button
                        onClick={() => setCandidateViewMode('compare')}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-all text-xs font-semibold ${
                          candidateViewMode === 'compare'
                            ? 'bg-accent text-accent-fg shadow-2xs font-bold'
                            : 'text-ink-muted hover:text-ink hover:bg-canvas'
                        }`}
                      >
                        <Scale className="w-3.5 h-3.5" />
                        Compare ({jobApplications.length})
                      </button>
                    </div>
                  </div>

                  {/* Active Tab Content */}
                  {candidateViewMode === 'compare' ? (
                    <CandidateComparator
                      applications={jobApplications}
                      onClose={() => setCandidateViewMode('table')}
                    />
                  ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                      <div className="lg:col-span-2 space-y-2">
                        {candidateViewMode === 'table' ? (
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

                      <div className="space-y-2">
                        <div className="flex items-center justify-between gap-3 px-1">
                          <h2>Penjelasan Skor AI</h2>
                          {featuredCandidate && (
                            <span className="text-xs font-bold text-accent truncate max-w-[140px]">
                              {featuredCandidate.candidate_name}
                            </span>
                          )}
                        </div>

                        {featuredCandidate ? (
                          <ScoreBreakdownCard score={featuredCandidate.score_breakdown} />
                        ) : (
                          <Card className="text-center text-ink-subtle text-xs py-6">
                            Belum ada kandidat pada lowongan ini.
                          </Card>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}
          </>
        )}


        {activeView === 'jobs' && (
          <JobsManagerView
            jobs={jobs}
            onOpenCreateJobModal={() => setIsCreateJobModalOpen(true)}
            onSelectJobForCandidates={handleSelectJobForCandidates}
            onEditJob={(job) => setEditingJob(job)}
            onDeleteJob={(jobId) => setDeletingJob(jobs.find((j) => j.id === jobId) || null)}
          />
        )}

        {activeView === 'candidates' && (
          <GlobalCandidatesView
            applications={applications}
            jobs={jobs}
            onSelectCandidate={handleSelectCandidate}
            onOpenUploadModal={() => setIsUploadModalOpen(true)}
            onDeleteCandidate={(app) => setDeletingApplication(app)}
            onReprocessCv={handleReprocessCv}
          />
        )}

        {activeView === 'settings' && (
          <PipelineSettingsView
            onSaveSettings={(msg) => addToast('success', 'Pengaturan disimpan', msg)}
          />
        )}

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
          isOpen={isResetConfirmOpen}
          onClose={() => setIsResetConfirmOpen(false)}
          onConfirm={confirmResetData}
          title="Reset data demo"
          message="Seluruh data dikembalikan ke sample awal. Data hasil hapus & tambah baru akan hilang."
          confirmLabel="Reset"
          tone="danger"
        />

        <ConfirmDialog
          isOpen={!!deletingJob}
          onClose={() => setDeletingJob(null)}
          onConfirm={confirmDeleteJob}
          title="Hapus lowongan"
          message={`Hapus lowongan "${deletingJob?.title}"? Tindakan ini tidak dapat dibatalkan.`}
          confirmLabel="Hapus"
          tone="danger"
        />

        <ToastContainer
          toasts={toasts}
          onDismiss={(id) => setToasts((prev) => prev.filter((t) => t.id !== id))}
        />
      </main>
    </div>
  );
}
