'use client';

import React from 'react';
import { CandidateApplication } from '@/lib/types';
import { ApplicationStatus } from '@cv-ats/contracts';
import { Clock, GraduationCap, Trash2, Sparkles } from 'lucide-react';
import { Select } from '@/components/ui';

interface KanbanBoardProps {
  applications: CandidateApplication[];
  onSelectCandidate: (candidate: CandidateApplication) => void;
  onUpdateStatus: (applicationId: string, newStatus: ApplicationStatus) => void;
  onDeleteCandidate?: (candidate: CandidateApplication) => void;
}

const COLUMNS: {
  status: ApplicationStatus;
  title: string;
  bgPalette: string;
  headerText: string;
  headerBadge: string;
}[] = [
  {
    status: 'applied',
    title: 'Applied',
    bgPalette: 'bg-blue-100/80 border-blue-300',
    headerText: 'text-blue-950 font-extrabold',
    headerBadge: 'bg-blue-600 text-white border-blue-700',
  },
  {
    status: 'screening',
    title: 'Screening',
    bgPalette: 'bg-purple-100/80 border-purple-300',
    headerText: 'text-purple-950 font-extrabold',
    headerBadge: 'bg-purple-600 text-white border-purple-700',
  },
  {
    status: 'interview',
    title: 'Interview',
    bgPalette: 'bg-amber-100/80 border-amber-300',
    headerText: 'text-amber-950 font-extrabold',
    headerBadge: 'bg-amber-600 text-white border-purple-700',
  },
  {
    status: 'hired',
    title: 'Hired',
    bgPalette: 'bg-emerald-100/80 border-emerald-300',
    headerText: 'text-emerald-950 font-extrabold',
    headerBadge: 'bg-emerald-600 text-white border-emerald-700',
  },
  {
    status: 'rejected',
    title: 'Rejected',
    bgPalette: 'bg-rose-100/80 border-rose-300',
    headerText: 'text-rose-950 font-extrabold',
    headerBadge: 'bg-rose-600 text-white border-rose-700',
  },
];

export const KanbanBoard: React.FC<KanbanBoardProps> = ({
  applications,
  onSelectCandidate,
  onUpdateStatus,
  onDeleteCandidate,
}) => {
  const getScoreBadgeClass = (score: number) => {
    if (score >= 80) return 'bg-emerald-500/10 text-emerald-700 border-emerald-500/30';
    if (score >= 60) return 'bg-amber-500/10 text-amber-700 border-amber-500/30';
    return 'bg-destructive/10 text-destructive border-destructive/30';
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 w-full overflow-x-auto pb-4">
      {COLUMNS.map((col) => {
        const columnApps = applications.filter((app) => app.status === col.status);

        return (
          <div
            key={col.status}
            className={`flex flex-col rounded-xl border ${col.bgPalette} p-3.5 min-h-[540px] shadow-sm transition-all`}
          >
            {/* Column Header */}
            <div className="flex items-center justify-between mb-3.5 px-1">
              <div className="flex items-center gap-2">
                <h3 className={`text-xs uppercase tracking-wider ${col.headerText}`}>{col.title}</h3>
                <span className={`text-[11px] font-mono font-bold px-2 py-0.5 rounded-full border ${col.headerBadge}`}>
                  {columnApps.length}
                </span>
              </div>
            </div>

            {/* Candidate Cards Column */}
            <div className="flex flex-col gap-3 flex-1 overflow-y-auto pr-0.5">
              {columnApps.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-36 rounded-lg border border-dashed border-border text-muted-foreground text-xs bg-background/50">
                  No candidates
                </div>
              ) : (
                columnApps.map((app) => {
                  const candidateSkills = app.cv_extraction?.skills?.map((s: { name?: string; normalized_name?: string }) => s.name || s.normalized_name || '') || [];
                  const expMonths = app.cv_extraction?.total_experience_months || 0;
                  const rawDegree = app.cv_extraction?.education?.[0]?.degree || 'Bachelor';
                  // Format degree compactly to prevent line wrapping & text overlap
                  const degree = rawDegree.includes('/') ? rawDegree.split('/')[0].trim() : rawDegree;

                  return (
                    <div
                      key={app.id}
                      className="group relative bg-card border border-border hover:border-primary/50 rounded-lg p-3.5 shadow-sm transition-all cursor-pointer"
                      role="button"
                      tabIndex={0}
                      onClick={() => onSelectCandidate(app)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          onSelectCandidate(app);
                        }
                      }}
                    >
                      {/* Header: Name & Score */}
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="min-w-0 flex-1">
                          <h4 className="font-bold text-sm text-foreground truncate group-hover:text-primary transition-colors">
                            {app.candidate_name}
                          </h4>
                          <p className="text-xs text-muted-foreground truncate">{app.email}</p>
                        </div>

                        <div
                          className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md border text-[11px] font-mono font-extrabold tabular-nums shrink-0 ${getScoreBadgeClass(
                            app.job_fit_score
                          )}`}
                          title={`AI Job-Fit Score: ${app.job_fit_score.toFixed(1)}%`}
                        >
                          <Sparkles className="w-3 h-3 shrink-0" />
                          <span>{app.job_fit_score.toFixed(0)}%</span>
                        </div>
                      </div>

                      {/* Stats Summary */}
                      <div className="flex items-center gap-3 text-xs text-muted-foreground mb-2.5 font-mono">
                        <span className="flex items-center gap-1 shrink-0">
                          <Clock className="w-3.5 h-3.5 text-muted-foreground/70" />
                          {Math.round((expMonths / 12) * 10) / 10} yrs
                        </span>
                        <span className="flex items-center gap-1 truncate" title={rawDegree}>
                          <GraduationCap className="w-3.5 h-3.5 text-muted-foreground/70 shrink-0" />
                          <span className="truncate">{degree}</span>
                        </span>
                      </div>

                      {/* Skills Pills */}
                      <div className="flex flex-wrap gap-1 mb-3">
                        {candidateSkills.slice(0, 3).map((skill: string, idx: number) => (
                          <span
                            key={idx}
                            className="text-[11px] px-2 py-0.5 rounded-md bg-blue-500/15 text-blue-900 border border-blue-500/35 font-bold shadow-2xs"
                          >
                            {skill}
                          </span>
                        ))}
                        {candidateSkills.length > 3 && (
                          <span className="text-[11px] px-2 py-0.5 rounded-md bg-indigo-500/15 text-indigo-900 border border-indigo-500/35 font-extrabold shadow-2xs">
                            +{candidateSkills.length - 3}
                          </span>
                        )}
                      </div>

                      {/* Status Selector & Delete */}
                      <div
                        className="flex items-center justify-between pt-2.5 border-t border-border text-xs"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Select
                          value={app.status}
                          onChange={(e) => onUpdateStatus(app.id, e.target.value as ApplicationStatus)}
                          sizeVariant="sm"
                          containerClassName="w-auto"
                          className="font-semibold uppercase tracking-wider text-[11px]"
                        >
                          <option value="applied">APPLIED</option>
                          <option value="screening">SCREENING</option>
                          <option value="interview">INTERVIEW</option>
                          <option value="hired">HIRED</option>
                          <option value="rejected">REJECTED</option>
                        </Select>

                        {onDeleteCandidate && (
                          <button
                            onClick={() => onDeleteCandidate(app)}
                            className="text-muted-foreground hover:text-destructive transition-colors p-1.5 rounded-md hover:bg-destructive/10 focus-ring"
                            aria-label="Delete candidate"
                            title="Delete Candidate"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
