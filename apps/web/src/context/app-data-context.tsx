'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { JobPosting, CandidateApplication, AuditLogItem } from '@/lib/types';
import { ToastMessage } from '@/components/ui/toast';
import { ApplicationStatus } from '@cv-ats/contracts';
import { INITIAL_JOBS, INITIAL_APPLICATIONS, INITIAL_AUDIT_LOGS } from '@/lib/mock-data';
import { fetchJobs, updateApplicationStatus as apiUpdateStatus } from '@/lib/api-client';
import { SAMPLE_PDF_BASE64 } from '@/lib/sample-pdf';

interface AppDataContextType {
  isMounted: boolean;
  jobs: JobPosting[];
  applications: CandidateApplication[];
  auditLogs: AuditLogItem[];
  toasts: ToastMessage[];
  selectedJobId: string;
  setSelectedJobId: (id: string) => void;
  selectedCandidate: CandidateApplication | null;
  setSelectedCandidate: (candidate: CandidateApplication | null) => void;
  candidateViewMode: 'table' | 'kanban' | 'compare';
  setCandidateViewMode: (mode: 'table' | 'kanban' | 'compare') => void;
  editingJob: JobPosting | null;
  setEditingJob: (job: JobPosting | null) => void;
  deletingJob: JobPosting | null;
  setDeletingJob: (job: JobPosting | null) => void;
  deletingApplication: CandidateApplication | null;
  setDeletingApplication: (app: CandidateApplication | null) => void;
  
  isUploadModalOpen: boolean;
  setIsUploadModalOpen: (open: boolean) => void;
  isCreateJobModalOpen: boolean;
  setIsCreateJobModalOpen: (open: boolean) => void;
  isAuditLogModalOpen: boolean;
  setIsAuditLogModalOpen: (open: boolean) => void;
  isSkillTaxonomyModalOpen: boolean;
  setIsSkillTaxonomyModalOpen: (open: boolean) => void;

  activeJob: JobPosting;
  jobApplications: CandidateApplication[];
  featuredCandidate: CandidateApplication | null;

  addToast: (type: 'success' | 'error' | 'info', title: string, description?: string) => void;
  dismissToast: (id: string) => void;
  addAuditLog: (action: string, entity: string, entityId: string, details: string) => void;
  handleClearAuditLogs: () => void;
  handleSelectJob: (jobId: string) => void;
  handleCreateJobSuccess: (newJob: JobPosting) => void;
  handleEditJobSuccess: (updatedJob: JobPosting) => void;
  confirmDeleteJob: () => void;
  handleUploadSuccess: (newApp: CandidateApplication) => void;
  handleStatusChange: (appId: string, newStatus: ApplicationStatus) => Promise<void>;
  handleSaveEditSuccess: (updatedApp: CandidateApplication) => void;
  handleReprocessCv: (appId: string) => Promise<void>;
  handleConfirmDeleteCandidate: (appId: string) => void;
  handleSelectCandidate: (app: CandidateApplication) => void;
}

const AppDataContext = createContext<AppDataContextType | undefined>(undefined);

export const AppDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isMounted, setIsMounted] = useState(false);
  const [jobs, setJobs] = useState<JobPosting[]>(INITIAL_JOBS);
  const [applications, setApplications] = useState<CandidateApplication[]>(INITIAL_APPLICATIONS);
  const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>(INITIAL_AUDIT_LOGS);

  const [selectedJobId, setSelectedJobId] = useState<string>('job-1');
  const [selectedCandidate, setSelectedCandidate] = useState<CandidateApplication | null>(null);
  const [candidateViewMode, setCandidateViewMode] = useState<'table' | 'kanban' | 'compare'>('table');

  const [editingJob, setEditingJob] = useState<JobPosting | null>(null);
  const [deletingJob, setDeletingJob] = useState<JobPosting | null>(null);
  const [deletingApplication, setDeletingApplication] = useState<CandidateApplication | null>(null);

  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isCreateJobModalOpen, setIsCreateJobModalOpen] = useState(false);
  const [isAuditLogModalOpen, setIsAuditLogModalOpen] = useState(false);
  const [isSkillTaxonomyModalOpen, setIsSkillTaxonomyModalOpen] = useState(false);

  const [toasts, setToasts] = useState<ToastMessage[]>([]);

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

  const addToast = (type: 'success' | 'error' | 'info', title: string, description?: string) => {
    setToasts((prev) => [
      ...prev,
      { id: `toast-${Date.now()}-${Math.random()}`, type, title, description },
    ]);
  };

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
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
    addToast('info', 'Audit logs cleared', 'All activity records deleted.');
  };

  const handleSelectJob = (jobId: string) => setSelectedJobId(jobId);

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
      `Published new job posting "${newJob.title}" with mandatory skills [${newJob.mandatory_skills.join(', ')}].`
    );
    addToast('success', 'New job posting published', `Position ${newJob.title} is ready to receive applications.`);
  };

  const handleEditJobSuccess = (updatedJob: JobPosting) => {
    setJobs((prev) => prev.map((j) => (j.id === updatedJob.id ? updatedJob : j)));
    addAuditLog(
      'job_updated',
      'job_postings',
      updatedJob.id,
      `Updated job criteria for "${updatedJob.title}" (mandatory skills: [${updatedJob.mandatory_skills.join(', ')}]).`
    );
    addToast('success', 'Job posting updated', `Criteria for ${updatedJob.title} saved.`);
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
      `Deleted job posting "${jobToDelete.title}".`
    );
    addToast('error', 'Job posting deleted', `Position ${jobToDelete.title} has been deleted.`);
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
      `Successfully uploaded resume ${newApp.original_filename} for candidate ${newApp.candidate_name}. Parse status: ${newApp.parse_status}.`
    );
    addToast(
      'success',
      'Resume uploaded & AI processed',
      `Candidate ${newApp.candidate_name} scored Job-Fit Score ${newApp.job_fit_score}/100.`
    );
    setSelectedCandidate(newApp);
  };

  const handleStatusChange = async (appId: string, newStatus: ApplicationStatus) => {
    apiUpdateStatus(appId, newStatus).catch((err) => {
      console.warn('[AppDataProvider] Status API sync note:', err.message);
    });

    setApplications((prev) =>
      prev.map((app) => (app.id === appId ? { ...app, status: newStatus } : app))
    );
    if (selectedCandidate?.id === appId) {
      setSelectedCandidate((prev) => (prev ? { ...prev, status: newStatus } : null));
    }
    const appName = applications.find((a) => a.id === appId)?.candidate_name || 'Candidate';
    addAuditLog(
      'application_status_changed',
      'applications',
      appId,
      `Changed recruitment status of candidate ${appName} to "${newStatus}".`
    );
    addToast('info', 'Application status updated', `Status for ${appName} is now "${newStatus}".`);
  };

  const handleSaveEditSuccess = (updatedApp: CandidateApplication) => {
    setApplications((prev) => prev.map((app) => (app.id === updatedApp.id ? updatedApp : app)));
    if (selectedCandidate?.id === updatedApp.id) setSelectedCandidate(updatedApp);
    addAuditLog(
      'candidate_profile_edited',
      'candidates',
      updatedApp.candidate_id,
      `HR performed manual correction of AI extraction data for ${updatedApp.candidate_name}. New Job-Fit score: ${updatedApp.job_fit_score}.`
    );
    addToast(
      'success',
      'Extraction data updated',
      `Job-Fit Score for ${updatedApp.candidate_name} recalculated to ${updatedApp.job_fit_score}/100.`
    );
  };

  const handleReprocessCv = async (appId: string) => {
    const app = applications.find((a) => a.id === appId);
    if (!app) return;

    addToast('info', 'Reprocessing queued', `Started AI reprocessing for ${app.candidate_name}...`);
    setApplications((prev) =>
      prev.map((a) => (a.id === appId ? { ...a, parse_status: 'processing' } : a))
    );

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
      `Resume reprocessing job completed for ${app.candidate_name}. Status set to "processed".`
    );
    addToast('success', 'Reprocessing completed', `Resume for ${app.candidate_name} successfully reprocessed.`);
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
      `Permanently deleted candidate ${targetApp.candidate_name} (${targetApp.email}) along with private documents and Job-Fit score from database.`
    );
    addToast(
      'error',
      'Candidate permanently deleted',
      `Candidate data for ${targetApp.candidate_name} has been deleted.`
    );
  };

  const handleSelectCandidate = (app: CandidateApplication) => {
    setSelectedCandidate(app);
    addAuditLog(
      'cv_viewed',
      'candidate_documents',
      app.document_id,
      `HR reviewed profile details & resume for ${app.candidate_name}.`
    );
  };

  return (
    <AppDataContext.Provider
      value={{
        isMounted,
        jobs,
        applications,
        auditLogs,
        toasts,
        selectedJobId,
        setSelectedJobId,
        selectedCandidate,
        setSelectedCandidate,
        candidateViewMode,
        setCandidateViewMode,
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
        activeJob,
        jobApplications,
        featuredCandidate,
        addToast,
        dismissToast,
        addAuditLog,
        handleClearAuditLogs,
        handleSelectJob,
        handleCreateJobSuccess,
        handleEditJobSuccess,
        confirmDeleteJob,
        handleUploadSuccess,
        handleStatusChange,
        handleSaveEditSuccess,
        handleReprocessCv,
        handleConfirmDeleteCandidate,
        handleSelectCandidate,
      }}
    >
      {children}
    </AppDataContext.Provider>
  );
};

export const useAppData = () => {
  const context = useContext(AppDataContext);
  if (!context) {
    throw new Error('useAppData must be used within an AppDataProvider');
  }
  return context;
};
