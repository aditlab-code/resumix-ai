'use client';

import React, { useState } from 'react';
import { CandidateApplication, JobPosting } from '@/lib/types';
import { ApplicationStatus } from '@cv-ats/contracts';
import { StatusBadge } from '@/components/ui/status-badge';
import { ScoreBreakdownCard } from '@/components/scoring/score-breakdown';
import { CandidateProfile } from '@/components/candidates/candidate-profile';
import { ResumePreview } from '@/components/candidates/resume-preview';
import { ProcessingTimeline } from '@/components/ui/processing-timeline';
import { constructGroqDecisionSummary } from '@/lib/utils';
import { SAMPLE_PDF_BASE64 } from '@/lib/sample-pdf';
import {
  X,
  User,
  Sparkles,
  FileText,
  Clock,
  Edit3,
  RefreshCw,
  ChevronDown,
  Trash2,
  Zap,
} from 'lucide-react';

interface CandidateDetailDrawerProps {
  application: CandidateApplication | null;
  job: JobPosting | null;
  isOpen: boolean;
  onClose: () => void;
  onStatusChange: (appId: string, newStatus: ApplicationStatus) => void;
  onOpenEditModal: (app: CandidateApplication) => void;
  onReprocessCv: (appId: string) => void;
  onDeleteCandidate: (app: CandidateApplication) => void;
}

const STATUS_OPTIONS: { value: ApplicationStatus; label: string }[] = [
  { value: 'applied', label: 'Applied' },
  { value: 'screening', label: 'Screening' },
  { value: 'interview', label: 'Interview' },
  { value: 'hired', label: 'Hired' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'withdrawn', label: 'Withdrawn' },
];

export const CandidateDetailDrawer: React.FC<CandidateDetailDrawerProps> = ({
  application,
  job,
  isOpen,
  onClose,
  onStatusChange,
  onOpenEditModal,
  onReprocessCv,
  onDeleteCandidate,
}) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'scoring' | 'resume' | 'timeline'>(
    'profile'
  );

  if (!isOpen || !application || !job) return null;

  const decisionSummary = constructGroqDecisionSummary(
    application.candidate_name,
    application.job_fit_score,
    application.score_breakdown,
    job.title,
    application.cv_extraction
  );

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div
        className="fixed inset-0 bg-slate-950/60 transition-opacity animate-in fade-in duration-200"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-3xl bg-white border-l border-slate-300 flex flex-col z-10 animate-in slide-in-from-right duration-300">
          {/* Header */}
          <div className="px-6 py-4 border-b border-slate-300 bg-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-sky-700 flex items-center justify-center font-extrabold text-white text-lg">
                {application.candidate_name.charAt(0)}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-bold text-slate-900">{application.candidate_name}</h2>
                  <StatusBadge status={application.status} />
                  <StatusBadge status={application.parse_status} />
                </div>
                <p className="text-xs text-slate-600 mt-0.5">
                  Posisi Target: <strong className="text-sky-800">{job.title}</strong> | Diajukan: {new Date(application.applied_at).toLocaleDateString('id-ID')}
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-200 transition"
              aria-label="Close drawer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* HR Decision Action Toolbar */}
          <div className="px-6 py-3 bg-white border-b border-slate-300 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-700">Status Rekrutmen:</span>
              <div className="relative">
                <select
                  value={application.status}
                  onChange={(e) => onStatusChange(application.id, e.target.value as ApplicationStatus)}
                  className="px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-bold text-slate-900 focus:outline-none focus:border-sky-600 cursor-pointer pr-8 appearance-none"
                >
                  {STATUS_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      Ubah ke ➔ {opt.label}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-slate-500 absolute right-2.5 top-2.5 pointer-events-none" />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => onOpenEditModal(application)}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-lg border border-slate-300 transition flex items-center gap-1.5"
              >
                <Edit3 className="w-3.5 h-3.5 text-sky-700" />
                <span>Koreksi AI Data</span>
              </button>

              <button
                onClick={() => onReprocessCv(application.id)}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-lg border border-slate-300 transition flex items-center gap-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5 text-amber-700" />
                <span>Reprocess</span>
              </button>

              <button
                onClick={() => onDeleteCandidate(application)}
                className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-800 text-xs font-bold rounded-lg border border-rose-300 transition flex items-center gap-1.5"
                title="Hapus Permanen Data Kandidat"
              >
                <Trash2 className="w-3.5 h-3.5 text-rose-700" />
                <span>Hapus</span>
              </button>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="px-6 border-b border-slate-300 bg-slate-50 flex space-x-6">
            <button
              onClick={() => setActiveTab('profile')}
              className={`py-3 text-xs font-bold border-b-2 transition flex items-center gap-1.5 ${
                activeTab === 'profile'
                  ? 'border-sky-700 text-sky-800'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              <User className="w-3.5 h-3.5" /> Profil & Ekstraksi LLM
            </button>

            <button
              onClick={() => setActiveTab('scoring')}
              className={`py-3 text-xs font-bold border-b-2 transition flex items-center gap-1.5 ${
                activeTab === 'scoring'
                  ? 'border-sky-700 text-sky-800'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" /> Job-Fit Score ({application.job_fit_score})
            </button>

            <button
              onClick={() => setActiveTab('resume')}
              className={`py-3 text-xs font-bold border-b-2 transition flex items-center gap-1.5 ${
                activeTab === 'resume'
                  ? 'border-sky-700 text-sky-800'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              <FileText className="w-3.5 h-3.5" /> Berkas CV Mentah
            </button>

            <button
              onClick={() => setActiveTab('timeline')}
              className={`py-3 text-xs font-bold border-b-2 transition flex items-center gap-1.5 ${
                activeTab === 'timeline'
                  ? 'border-sky-700 text-sky-800'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              <Clock className="w-3.5 h-3.5" /> Log Pemrosesan
            </button>
          </div>

          {/* Drawer Scrollable Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-5 bg-white">
            {/* Groq LLM AI Summary Decision Banner */}
            <div className="bg-sky-50 border border-sky-300 p-4 rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-extrabold text-sky-950 uppercase tracking-wider flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-sky-700 fill-sky-700" />
                  Groq AI Summary Decision (Rekomendasi Rekrutmen Llama 3.1)
                </span>
                <span className="text-[10px] font-bold bg-white text-sky-900 px-2 py-0.5 rounded border border-sky-300">
                  Score: {application.job_fit_score}/100
                </span>
              </div>
              <p className="text-xs text-slate-800 font-semibold leading-relaxed">
                {decisionSummary}
              </p>
            </div>

            {activeTab === 'profile' && (
              <CandidateProfile extraction={application.cv_extraction} />
            )}

            {activeTab === 'scoring' && (
              <ScoreBreakdownCard score={application.score_breakdown} />
            )}

            {activeTab === 'resume' && (
              <ResumePreview
                originalFilename={application.original_filename}
                storagePath={application.storage_path}
                fileSizeBytes={application.file_size_bytes}
                pdfUrl={application.pdf_url || SAMPLE_PDF_BASE64}
                candidateName={application.candidate_name}
                extraction={application.cv_extraction}
              />
            )}

            {activeTab === 'timeline' && (
              <ProcessingTimeline
                currentStatus={application.parse_status}
                errorMessage={application.parse_error}
                warnings={application.cv_extraction.extraction_warnings}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

