'use client';

import React, { useState, useEffect } from 'react';
import { CandidateApplication, JobPosting } from '@/lib/types';
import { ApplicationStatus } from '@cv-ats/contracts';
import { Edit3, RefreshCw, Trash2, Zap } from 'lucide-react';
import { constructGroqDecisionSummary } from '@/lib/utils';
import { SAMPLE_PDF_BASE64 } from '@/lib/sample-pdf';
import { Overlay, Tabs, Button, Select, StatusBadge } from '@/components/ui';
import { ScoreBreakdownCard } from '@/components/scoring/score-breakdown';
import { CandidateProfile } from '@/components/candidates/candidate-profile';
import { ExtractionForm } from '@/components/candidates/extraction-form';
import { ResumePreview } from '@/components/candidates/resume-preview';
import { ProcessingTimeline } from '@/components/ui/processing-timeline';

interface CandidateDetailDrawerProps {
  application: CandidateApplication | null;
  job: JobPosting | null;
  isOpen: boolean;
  onClose: () => void;
  onStatusChange: (appId: string, newStatus: ApplicationStatus) => void;
  onSaveExtraction: (updatedApp: CandidateApplication) => void;
  onReprocessCv: (appId: string) => void;
  onDeleteCandidate: (app: CandidateApplication) => void;
}

const STATUS_OPTIONS: ApplicationStatus[] = [
  'applied',
  'screening',
  'interview',
  'hired',
  'rejected',
  'withdrawn',
];

const TABS = [
  { key: 'profile', label: 'Profil' },
  { key: 'scoring', label: 'Job-Fit' },
  { key: 'resume', label: 'Berkas CV' },
  { key: 'timeline', label: 'Log' },
];

export const CandidateDetailDrawer: React.FC<CandidateDetailDrawerProps> = ({
  application,
  job,
  isOpen,
  onClose,
  onStatusChange,
  onSaveExtraction,
  onReprocessCv,
  onDeleteCandidate,
}) => {
  const [activeTab, setActiveTab] = useState<string>('profile');
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setIsEditing(false);
      setActiveTab('profile');
    }
  }, [isOpen]);

  if (!isOpen || !application || !job) return null;

  const handleClose = () => {
    setIsEditing(false);
    onClose();
  };

  const decisionSummary = constructGroqDecisionSummary(
    application.candidate_name,
    application.job_fit_score,
    application.score_breakdown,
    job.title,
    application.cv_extraction
  );

  return (
    <Overlay
      isOpen={isOpen}
      onClose={handleClose}
      variant="side"
      bodyClassName="px-5 py-3 space-y-3"
      title={
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded bg-accent text-accent-fg flex items-center justify-center font-extrabold">
            {application.candidate_name.charAt(0)}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="truncate">{application.candidate_name}</h2>
              <StatusBadge status={application.status} />
            </div>
            <p className="text-xs text-ink-muted truncate">
              {job.title} · {new Date(application.applied_at).toLocaleDateString('id-ID')}
            </p>
          </div>
        </div>
      }
      header={
        !isEditing && (
          <div className="mt-2.5 flex flex-wrap items-center gap-2">
            <Select
              value={application.status}
              onChange={(e) => onStatusChange(application.id, e.target.value as ApplicationStatus)}
              className="w-auto py-1.5"
            >
              {STATUS_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </Select>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                setActiveTab('profile');
                setIsEditing(true);
              }}
              iconLeft={<Edit3 className="w-3.5 h-3.5" />}
            >
              Edit data
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => onReprocessCv(application.id)}
              iconLeft={<RefreshCw className="w-3.5 h-3.5" />}
            >
              Reprocess
            </Button>
            <Button
              variant="danger-soft"
              size="sm"
              onClick={() => onDeleteCandidate(application)}
              iconLeft={<Trash2 className="w-3.5 h-3.5" />}
            >
              Hapus
            </Button>
          </div>
        )
      }
      subheader={
        !isEditing && (
          <Tabs items={TABS} active={activeTab} onChange={setActiveTab} className="px-5" />
        )
      }
    >
      {isEditing ? (
        <ExtractionForm
          application={application}
          job={job}
          onSave={(updated) => {
            onSaveExtraction(updated);
            setIsEditing(false);
          }}
          onCancel={() => setIsEditing(false)}
        />
      ) : (
        <>
          <div className="bg-accent-soft rounded p-3 space-y-1.5">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[11px] font-extrabold text-accent uppercase tracking-wider flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5" />
                AI Summary Decision
              </span>
              <span className="text-[10px] font-bold bg-surface text-accent px-2 py-0.5 rounded">
                {application.job_fit_score}/100
              </span>
            </div>
            <p className="text-xs text-ink font-medium leading-relaxed">{decisionSummary}</p>
          </div>

          {activeTab === 'profile' && <CandidateProfile extraction={application.cv_extraction} />}
          {activeTab === 'scoring' && <ScoreBreakdownCard score={application.score_breakdown} />}
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
        </>
      )}
    </Overlay>
  );
};
