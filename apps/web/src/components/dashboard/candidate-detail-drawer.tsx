import React, { useState, useEffect } from 'react';
import { CandidateApplication, JobPosting } from '@/lib/types';
import { ApplicationStatus } from '@cv-ats/contracts';
import { Edit3, RefreshCw, Trash2, Sparkles, Mail, Phone, MapPin, Calendar, CheckCircle2, AlertTriangle, XCircle } from 'lucide-react';
import { constructGroqDecisionSummary } from '@/lib/utils';
import { SAMPLE_PDF_BASE64 } from '@/lib/sample-pdf';
import { Overlay, Tabs, Button, Select, StatusBadge, Card } from '@/components/ui';
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
  { key: 'profile', label: 'Profil & Pengalaman' },
  { key: 'scoring', label: 'Matrix Job-Fit AI' },
  { key: 'resume', label: 'Preview CV (PDF)' },
  { key: 'timeline', label: 'Log & Timeline' },
];

const getRecommendationText = (score: number) => {
  if (score >= 80) return 'SANGAT DIREKOMENDASIKAN';
  if (score >= 60) return 'REKOMENDASI REVIEW KHUSUS';
  return 'TIDAK DIREKOMENDASIKAN';
};

const getRecommendationBadgeClass = (score: number) => {
  if (score >= 80) return 'bg-emerald-500/15 text-emerald-800 dark:text-emerald-200 border border-emerald-500/30 font-bold shadow-2xs';
  if (score >= 60) return 'bg-amber-500/15 text-amber-800 dark:text-amber-200 border border-amber-500/30 font-bold shadow-2xs';
  return 'bg-rose-500/15 text-rose-800 dark:text-rose-200 border border-rose-500/30 font-bold shadow-2xs';
};

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
      bodyClassName="p-6 bg-muted/20"
      title={
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/10 text-primary border border-primary/20 flex items-center justify-center font-extrabold text-base shrink-0">
            {application.candidate_name.charAt(0)}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-base font-bold text-foreground truncate">{application.candidate_name}</h2>
              <StatusBadge status={application.status} />
            </div>
            <p className="text-xs text-muted-foreground truncate mt-0.5">
              {job.title} · Melamar {new Date(application.applied_at).toLocaleDateString('id-ID')}
            </p>
          </div>
        </div>
      }
      header={
        !isEditing && (
          <div className="mt-3 pt-3 border-t border-border flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-muted-foreground">Ubah Status:</span>
              <Select
                value={application.status}
                onChange={(e) => onStatusChange(application.id, e.target.value as ApplicationStatus)}
                className="w-auto py-1.5 text-xs font-bold uppercase tracking-wider cursor-pointer"
              >
                {STATUS_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt.toUpperCase()}
                  </option>
                ))}
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  setActiveTab('profile');
                  setIsEditing(true);
                }}
                iconLeft={<Edit3 className="w-3.5 h-3.5" />}
              >
                Edit Data
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
          </div>
        )
      }
      subheader={
        !isEditing && (
          <Tabs items={TABS} active={activeTab} onChange={setActiveTab} className="px-6" />
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
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Sidebar Column (Sticky Summary & Contact) */}
          <div className="lg:col-span-4 space-y-4 sticky top-0">
            {/* Glassmorphism AI Decision Card */}
            <Card className="p-5 space-y-4 bg-gradient-to-br from-primary/10 via-primary/5 to-card border border-primary/20 rounded-xl backdrop-blur-md shadow-sm relative overflow-hidden">
              <div className="flex items-center justify-between gap-2 border-b border-primary/15 pb-3">
                <span className="text-xs font-extrabold text-primary uppercase tracking-wider flex items-center gap-1.5 font-mono">
                  <Sparkles className="w-4 h-4 text-primary animate-pulse" />
                  AI Decision Card
                </span>
                <span className="text-xs font-extrabold font-mono px-2.5 py-0.5 rounded-full bg-primary/20 text-primary border border-primary/30">
                  {application.job_fit_score.toFixed(1)}/100
                </span>
              </div>

              {/* Recommendation Badge */}
              <div>
                <span
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-[11px] font-extrabold font-mono tracking-wide ${getRecommendationBadgeClass(
                    application.job_fit_score
                  )}`}
                >
                  {application.job_fit_score >= 80 ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  ) : application.job_fit_score >= 60 ? (
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  ) : (
                    <XCircle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                  )}
                  {getRecommendationText(application.job_fit_score)}
                </span>
              </div>

              <p className="text-xs text-foreground font-medium leading-relaxed">
                {decisionSummary}
              </p>
            </Card>

            {/* Contact Summary Card */}
            <Card className="p-4 space-y-3 bg-card border border-border rounded-xl">
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-muted-foreground border-b border-border pb-2">
                Kontak & Informasi
              </h4>
              <div className="space-y-2.5 text-xs text-muted-foreground font-medium">
                <div className="flex items-center gap-2.5 min-w-0">
                  <Mail className="w-4 h-4 text-primary shrink-0" />
                  <span className="truncate text-foreground font-semibold">{application.email}</span>
                </div>
                {application.phone_number && (
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Phone className="w-4 h-4 text-primary shrink-0" />
                    <span className="text-foreground">{application.phone_number}</span>
                  </div>
                )}
                {application.cv_extraction?.contact?.location && (
                  <div className="flex items-center gap-2.5 min-w-0">
                    <MapPin className="w-4 h-4 text-primary shrink-0" />
                    <span className="text-foreground">{application.cv_extraction.contact.location}</span>
                  </div>
                )}
                <div className="flex items-center gap-2.5 min-w-0">
                  <Calendar className="w-4 h-4 text-primary shrink-0" />
                  <span className="text-muted-foreground">
                    Melamar {new Date(application.applied_at).toLocaleDateString('id-ID')}
                  </span>
                </div>
              </div>
            </Card>
          </div>

          {/* Right Main Column (Tab Views) */}
          <div className="lg:col-span-8 min-w-0">
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
          </div>
        </div>
      )}
    </Overlay>
  );
};
