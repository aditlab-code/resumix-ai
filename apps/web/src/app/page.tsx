'use client';

import React, { useState, useEffect } from 'react';
import { Sidebar } from '@/components/dashboard/sidebar';
import { Header, ActiveViewType } from '@/components/dashboard/header';
import { StatsOverview } from '@/components/dashboard/stats-overview';
import { JobSelector } from '@/components/dashboard/job-selector';
import { CandidateTable } from '@/components/dashboard/candidate-table';
import { ScoreBreakdownCard } from '@/components/scoring/score-breakdown';
import { JobsManagerView } from '@/components/dashboard/jobs-manager-view';
import { GlobalCandidatesView } from '@/components/dashboard/global-candidates-view';
import { PipelineSettingsView } from '@/components/dashboard/pipeline-settings-view';

import { CvUploadModal } from '@/components/dashboard/cv-upload-modal';
import { CreateJobModal } from '@/components/dashboard/create-job-modal';
import { EditJobModal } from '@/components/dashboard/edit-job-modal';
import { AuditLogModal } from '@/components/dashboard/audit-log-modal';
import { ExtractionReviewModal } from '@/components/dashboard/extraction-review-modal';
import { CandidateDetailDrawer } from '@/components/dashboard/candidate-detail-drawer';
import { DeleteCandidateModal } from '@/components/dashboard/delete-candidate-modal';
import { ToastContainer, ToastMessage } from '@/components/ui/toast';

import { INITIAL_JOBS, INITIAL_APPLICATIONS, INITIAL_AUDIT_LOGS } from '@/lib/mock-data';
import { JobPosting, CandidateApplication, AuditLogItem } from '@/lib/types';
import { ApplicationStatus } from '@cv-ats/contracts';

import { SAMPLE_PDF_BASE64 } from '@/lib/sample-pdf';

export default function HRDashboardPage() {
  const [activeView, setActiveView] = useState<ActiveViewType>('dashboard');
  const [isMounted, setIsMounted] = useState(false);

  // Initial State initialized consistently for SSR & Client Hydration
  const [jobs, setJobs] = useState<JobPosting[]>(INITIAL_JOBS);
  const [applications, setApplications] = useState<CandidateApplication[]>(INITIAL_APPLICATIONS);
  const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>(INITIAL_AUDIT_LOGS);

  // Hydration Safe: Load from localStorage ONLY after client mount
  useEffect(() => {
    try {
      const savedJobs = localStorage.getItem('cv_ats_jobs');
      if (savedJobs) {
        const parsed = JSON.parse(savedJobs);
        if (Array.isArray(parsed) && parsed.length > 0) setJobs(parsed);
      }

      const savedApps = localStorage.getItem('cv_ats_applications');
      if (savedApps) {
        const parsed = JSON.parse(savedApps);
        if (Array.isArray(parsed)) {
          setApplications(parsed.map((app: any) => ({
            ...app,
            pdf_url: app.pdf_url || SAMPLE_PDF_BASE64,
          })));
        }
      }

      const savedLogs = localStorage.getItem('cv_ats_audit_logs');
      if (savedLogs) {
        const parsed = JSON.parse(savedLogs);
        if (Array.isArray(parsed)) setAuditLogs(parsed);
      }
    } catch (e) {
      console.error('Failed to restore state from localStorage:', e);
    }
    setIsMounted(true);
  }, []);

  // Save to localStorage after initial mount
  useEffect(() => {
    if (isMounted) {
      localStorage.setItem('cv_ats_jobs', JSON.stringify(jobs));
    }
  }, [jobs, isMounted]);

  useEffect(() => {
    if (isMounted) {
      localStorage.setItem('cv_ats_applications', JSON.stringify(applications));
    }
  }, [applications, isMounted]);

  useEffect(() => {
    if (isMounted) {
      localStorage.setItem('cv_ats_audit_logs', JSON.stringify(auditLogs));
    }
  }, [auditLogs, isMounted]);

  const [selectedJobId, setSelectedJobId] = useState<string>('job-1');
  const [selectedCandidate, setSelectedCandidate] = useState<CandidateApplication | null>(null);
  const [editingApplication, setEditingApplication] = useState<CandidateApplication | null>(null);
  const [deletingApplication, setDeletingApplication] = useState<CandidateApplication | null>(null);
  const [editingJob, setEditingJob] = useState<JobPosting | null>(null);

  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isCreateJobModalOpen, setIsCreateJobModalOpen] = useState(false);
  const [isAuditLogModalOpen, setIsAuditLogModalOpen] = useState(false);

  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = (type: 'success' | 'error' | 'info', title: string, description?: string) => {
    const newToast: ToastMessage = {
      id: `toast-${Date.now()}-${Math.random()}`,
      type,
      title,
      description,
    };
    setToasts((prev) => [...prev, newToast]);
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

  // Reset to initial demo data
  const handleResetData = () => {
    if (window.confirm('Apakah Anda yakin ingin mengembalikan seluruh data ke sampel awal? Data hasil hapus & tambah baru akan direset.')) {
      setJobs(INITIAL_JOBS);
      setApplications(INITIAL_APPLICATIONS);
      setAuditLogs(INITIAL_AUDIT_LOGS);
      if (typeof window !== 'undefined') {
        localStorage.removeItem('cv_ats_jobs');
        localStorage.removeItem('cv_ats_applications');
        localStorage.removeItem('cv_ats_audit_logs');
      }
      addToast('info', 'Data Direset ke Sample Awal', 'Seluruh database telah dikembalikan ke data awal.');
    }
  };

  // Job selection
  const handleSelectJob = (jobId: string) => {
    setSelectedJobId(jobId);
  };

  // Switch to candidates table for a specific job from JobsManager
  const handleSelectJobForCandidates = (jobId: string) => {
    setSelectedJobId(jobId);
    setActiveView('dashboard');
  };

  // Applications for currently selected job
  const jobApplications = applications.filter((app) => app.job_id === selectedJobId);
  const activeJob = jobs.find((j) => j.id === selectedJobId) || jobs[0] || INITIAL_JOBS[0];

  // Featured Candidate for Score Breakdown card
  const featuredCandidate =
    selectedCandidate && selectedCandidate.job_id === selectedJobId
      ? selectedCandidate
      : jobApplications.length > 0
      ? [...jobApplications].sort((a, b) => b.job_fit_score - a.job_fit_score)[0]
      : null;

  // Job Handlers
  const handleCreateJobSuccess = (newJob: JobPosting) => {
    setJobs((prev) => [newJob, ...prev]);
    setSelectedJobId(newJob.id);

    addAuditLog(
      'job_created',
      'job_postings',
      newJob.id,
      `Menerbitkan lowongan baru "${newJob.title}" dengan skill wajib [${newJob.mandatory_skills.join(', ')}].`
    );

    addToast('success', 'Lowongan Baru Diterbitkan', `Posisi ${newJob.title} siap menerima berkas CV.`);
  };

  const handleEditJobSuccess = (updatedJob: JobPosting) => {
    setJobs((prev) => prev.map((j) => (j.id === updatedJob.id ? updatedJob : j)));

    addAuditLog(
      'job_updated',
      'job_postings',
      updatedJob.id,
      `Memperbarui kriteria lowongan "${updatedJob.title}" (Skill wajib: [${updatedJob.mandatory_skills.join(', ')}]).`
    );

    addToast('success', 'Lowongan Diperbarui', `Kriteria posisi ${updatedJob.title} berhasil disimpan.`);
  };

  const handleDeleteJob = (jobId: string) => {
    const jobToDelete = jobs.find((j) => j.id === jobId);
    if (!jobToDelete) return;

    if (window.confirm(`Apakah Anda yakin ingin menghapus lowongan "${jobToDelete.title}"?`)) {
      setJobs((prev) => prev.filter((j) => j.id !== jobId));
      if (selectedJobId === jobId && jobs.length > 1) {
        setSelectedJobId(jobs.find((j) => j.id !== jobId)?.id || '');
      }

      addAuditLog(
        'job_deleted',
        'job_postings',
        jobId,
        `Menghapus lowongan kerja "${jobToDelete.title}".`
      );

      addToast('error', 'Lowongan Dihapus', `Posisi ${jobToDelete.title} telah dihapus.`);
    }
  };

  // Candidate Handlers
  const handleUploadSuccess = (newApp: CandidateApplication) => {
    setApplications((prev) => [newApp, ...prev]);

    setJobs((prev) =>
      prev.map((j) =>
        j.id === newApp.job_id ? { ...j, applications_count: j.applications_count + 1 } : j
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
      'CV Berhasil Diunggah & Diproses AI',
      `Kandidat ${newApp.candidate_name} mendapat Job-Fit Score ${newApp.job_fit_score}/100.`
    );

    setSelectedCandidate(newApp);
  };

  const handleStatusChange = (appId: string, newStatus: ApplicationStatus) => {
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

    addToast('info', 'Status Aplikasi Diperbarui', `Status ${appName} kini menjadi "${newStatus}".`);
  };

  const handleSaveEditSuccess = (updatedApp: CandidateApplication) => {
    setApplications((prev) =>
      prev.map((app) => (app.id === updatedApp.id ? updatedApp : app))
    );

    if (selectedCandidate?.id === updatedApp.id) {
      setSelectedCandidate(updatedApp);
    }

    addAuditLog(
      'candidate_profile_edited',
      'candidates',
      updatedApp.candidate_id,
      `HR melakukan koreksi manual data ekstraksi AI untuk ${updatedApp.candidate_name}. Job-Fit score baru: ${updatedApp.job_fit_score}.`
    );

    addToast(
      'success',
      'Data Ekstraksi Berhasil Diperbarui',
      `Skor Job-Fit ${updatedApp.candidate_name} dihitung ulang menjadi ${updatedApp.job_fit_score}/100.`
    );
  };

  const handleReprocessCv = async (appId: string) => {
    const app = applications.find((a) => a.id === appId);
    if (!app) return;

    addToast('info', 'Reprocessing CV Diantrekan', `Mulai pemrosesan ulang AI untuk ${app.candidate_name}...`);

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

    addToast('success', 'Reprocessing Selesai', `CV ${app.candidate_name} sukses diproses ulang.`);
  };

  // Hard Delete Candidate Handler
  const handleConfirmDeleteCandidate = (appId: string) => {
    const targetApp = applications.find((a) => a.id === appId);
    if (!targetApp) return;

    setApplications((prev) => prev.filter((a) => a.id !== appId));

    setJobs((prev) =>
      prev.map((j) =>
        j.id === targetApp.job_id
          ? { ...j, applications_count: Math.max(0, j.applications_count - 1) }
          : j
      )
    );

    if (selectedCandidate?.id === appId) {
      setSelectedCandidate(null);
    }

    addAuditLog(
      'candidate_data_deleted',
      'candidates',
      targetApp.candidate_id,
      `Hapus permanen kandidat ${targetApp.candidate_name} (${targetApp.email}) beserta dokumen privat dan Job-Fit score dari database.`
    );

    addToast(
      'error',
      'Kandidat Berhasil Dihapus Permanen',
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

  // Prevent Hydration mismatch: return skeleton before mount
  if (!isMounted) {
    return (
      <div className="space-y-8 pb-12 text-slate-900 animate-pulse">
        <div className="h-20 bg-white rounded-2xl border border-slate-200" />
        <div className="grid grid-cols-4 gap-4 h-24 bg-white rounded-2xl border border-slate-200" />
        <div className="h-64 bg-white rounded-2xl border border-slate-200" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-slate-100 text-slate-900">
      {/* Left Sidebar (ERP Module Navigation) */}
      <Sidebar
        activeView={activeView}
        onViewChange={(view) => setActiveView(view)}
        onResetData={handleResetData}
      />

      {/* Main Content Area */}
      <main className="flex-1 p-6 space-y-6 overflow-y-auto w-full min-w-0">
        {/* TopBar (Breadcrumb Context & Primary Global Actions) */}
        <Header
          activeView={activeView}
          onOpenUploadModal={() => setIsUploadModalOpen(true)}
          onOpenCreateJobModal={() => setIsCreateJobModalOpen(true)}
          onOpenAuditLogs={() => setIsAuditLogModalOpen(true)}
        />

      {/* VIEW 1: Dashboard HR (Default View) */}
      {activeView === 'dashboard' && (
        <>
          {/* Metric Stat Cards */}
          <StatsOverview
            jobs={jobs}
            applications={applications}
            onOpenAuditLogs={() => setIsAuditLogModalOpen(true)}
          />

          {/* Target Job Selector Tabs */}
          {jobs.length > 0 && (
            <JobSelector
              jobs={jobs}
              selectedJobId={selectedJobId}
              onSelectJob={handleSelectJob}
            />
          )}

          {/* Main Content Grid: Candidate Table + Score Breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column (2/3): Candidate Table */}
            <div className="lg:col-span-2 space-y-3">
              <div className="flex justify-between items-center bg-white p-3.5 rounded-xl border border-slate-300">
                <div>
                  <h2 className="text-base font-bold text-slate-900">
                    Peringkat & Tabel Kandidat ({activeJob?.title || 'Posisi Lowongan'})
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Pilih baris kandidat untuk melihat detail profil, resume PDF, dan aksi HR.
                  </p>
                </div>
                <span className="text-xs font-mono font-bold px-3 py-1 bg-slate-100 text-sky-800 border border-slate-300 rounded-lg">
                  {jobApplications.length} Pelamar
                </span>
              </div>

              <CandidateTable
                applications={jobApplications}
                onSelectCandidate={handleSelectCandidate}
                onReprocessCv={handleReprocessCv}
                onOpenUploadModal={() => setIsUploadModalOpen(true)}
                onDeleteCandidate={(app) => setDeletingApplication(app)}
              />
            </div>

            {/* Right Column (1/3): Active Candidate Score Breakdown Card */}
            <div className="space-y-3">
              <div className="flex justify-between items-center bg-white p-3.5 rounded-xl border border-slate-300">
                <h2 className="text-base font-bold text-slate-900">Penjelasan Skor AI</h2>
                {featuredCandidate && (
                  <span className="text-xs font-bold text-sky-800 truncate max-w-[140px]">
                    {featuredCandidate.candidate_name}
                  </span>
                )}
              </div>

              {featuredCandidate ? (
                <ScoreBreakdownCard score={featuredCandidate.score_breakdown} />
              ) : (
                <div className="bg-white border border-slate-300 rounded-xl p-6 text-center text-slate-500 text-xs">
                  Belum ada kandidat pada lowongan ini. Unggah CV untuk melihat kalkulasi skor AI.
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* VIEW 2: Lowongan Kerja Manager View */}
      {activeView === 'jobs' && (
        <JobsManagerView
          jobs={jobs}
          onOpenCreateJobModal={() => setIsCreateJobModalOpen(true)}
          onSelectJobForCandidates={handleSelectJobForCandidates}
          onEditJob={(job) => setEditingJob(job)}
          onDeleteJob={handleDeleteJob}
        />
      )}

      {/* VIEW 3: Global Candidates Database View */}
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

      {/* VIEW 4: Pengaturan Pipeline View */}
      {activeView === 'settings' && (
        <PipelineSettingsView
          onSaveSettings={(msg) => addToast('success', 'Pengaturan Berhasil Disimpan', msg)}
        />
      )}

      {/* Modals & Drawers */}
      <CvUploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        jobs={jobs}
        selectedJobId={selectedJobId}
        onUploadSuccess={handleUploadSuccess}
      />

      <CreateJobModal
        isOpen={isCreateJobModalOpen}
        onClose={() => setIsCreateJobModalOpen(false)}
        onCreateSuccess={handleCreateJobSuccess}
      />

      <EditJobModal
        isOpen={!!editingJob}
        onClose={() => setEditingJob(null)}
        job={editingJob}
        onSaveSuccess={handleEditJobSuccess}
      />

      <AuditLogModal
        isOpen={isAuditLogModalOpen}
        onClose={() => setIsAuditLogModalOpen(false)}
        logs={auditLogs}
      />

      <ExtractionReviewModal
        isOpen={!!editingApplication}
        onClose={() => setEditingApplication(null)}
        application={editingApplication}
        job={activeJob}
        onSaveSuccess={handleSaveEditSuccess}
      />

      <CandidateDetailDrawer
        isOpen={!!selectedCandidate}
        onClose={() => setSelectedCandidate(null)}
        application={selectedCandidate}
        job={activeJob}
        onStatusChange={handleStatusChange}
        onOpenEditModal={(app) => setEditingApplication(app)}
        onReprocessCv={handleReprocessCv}
        onDeleteCandidate={(app) => setDeletingApplication(app)}
      />

      <DeleteCandidateModal
        isOpen={!!deletingApplication}
        onClose={() => setDeletingApplication(null)}
        application={deletingApplication}
        onConfirmDelete={handleConfirmDeleteCandidate}
      />

      {/* Toast Notifications Container */}
      <ToastContainer toasts={toasts} onDismiss={(id) => setToasts((prev) => prev.filter((t) => t.id !== id))} />
      </main>
    </div>
  );
}
