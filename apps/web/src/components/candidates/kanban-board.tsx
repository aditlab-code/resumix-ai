'use client';

import React from 'react';
import { CandidateApplication } from '@/lib/types';
import { ApplicationStatus } from '@cv-ats/contracts';
import { Clock, GraduationCap, Trash2 } from 'lucide-react';

interface KanbanBoardProps {
  applications: CandidateApplication[];
  onSelectCandidate: (candidate: CandidateApplication) => void;
  onUpdateStatus: (applicationId: string, newStatus: ApplicationStatus) => void;
  onDeleteCandidate?: (candidate: CandidateApplication) => void;
}

const COLUMNS: { status: ApplicationStatus; title: string; topBorder: string }[] = [
  { status: 'applied', title: 'Applied', topBorder: 'border-t-primary' },
  { status: 'screening', title: 'Screening', topBorder: 'border-t-purple-500' },
  { status: 'interview', title: 'Interview', topBorder: 'border-t-amber-500' },
  { status: 'hired', title: 'Hired', topBorder: 'border-t-emerald-500' },
  { status: 'rejected', title: 'Rejected', topBorder: 'border-t-destructive' },
];

export const KanbanBoard: React.FC<KanbanBoardProps> = ({
  applications,
  onSelectCandidate,
  onUpdateStatus,
  onDeleteCandidate,
}) => {
  const getScoreBadgeClass = (score: number) => {
    if (score >= 80) return 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30';
    if (score >= 60) return 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/30';
    return 'bg-destructive/10 text-destructive border-destructive/30';
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 w-full overflow-x-auto pb-4">
      {COLUMNS.map((col) => {
        const columnApps = applications.filter((app) => app.status === col.status);

        return (
          <div
            key={col.status}
            className={`flex flex-col bg-muted/40 rounded-xl border border-border border-t-4 ${col.topBorder} p-3.5 min-h-[540px] shadow-sm`}
          >
            {/* Column Header */}
            <div className="flex items-center justify-between mb-3.5 px-1">
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-xs uppercase tracking-wider text-foreground">{col.title}</h3>
                <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-full bg-background text-muted-foreground border border-border">
                  {columnApps.length}
                </span>
              </div>
            </div>

            {/* Candidate Cards Column */}
            <div className="flex flex-col gap-3 flex-1 overflow-y-auto pr-0.5">
              {columnApps.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-36 rounded-lg border border-dashed border-border text-muted-foreground text-xs bg-background/50">
                  Tidak ada kandidat
                </div>
              ) : (
                columnApps.map((app) => {
                  const candidateSkills = app.cv_extraction?.skills?.map((s) => s.name || s.normalized_name || '') || [];
                  const expMonths = app.cv_extraction?.total_experience_months || 0;
                  const rawDegree = app.cv_extraction?.education?.[0]?.degree || 'S1';
                  // Format degree compactly to prevent line wrapping & text overlap
                  const degree = rawDegree.includes('/') ? rawDegree.split('/')[0].trim() : rawDegree;

                  return (
                    <div
                      key={app.id}
                      className="group relative bg-card border border-border hover:border-primary/50 rounded-lg p-3.5 shadow-sm transition-all cursor-pointer"
                      onClick={() => onSelectCandidate(app)}
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
                          className={`px-2 py-0.5 rounded-full border text-xs font-bold tabular-nums shrink-0 ${getScoreBadgeClass(
                            app.job_fit_score
                          )}`}
                          title="Job-Fit Score"
                        >
                          {app.job_fit_score.toFixed(1)}%
                        </div>
                      </div>

                      {/* Stats Summary */}
                      <div className="flex items-center gap-3 text-xs text-muted-foreground mb-2.5 font-mono">
                        <span className="flex items-center gap-1 shrink-0">
                          <Clock className="w-3.5 h-3.5 text-muted-foreground/70" />
                          {Math.round((expMonths / 12) * 10) / 10} thn
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
                            className="text-[11px] px-2 py-0.5 rounded bg-muted text-muted-foreground border border-border font-medium"
                          >
                            {skill}
                          </span>
                        ))}
                        {candidateSkills.length > 3 && (
                          <span className="text-[11px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground font-medium">
                            +{candidateSkills.length - 3}
                          </span>
                        )}
                      </div>

                      {/* Status Selector & Delete */}
                      <div
                        className="flex items-center justify-between pt-2.5 border-t border-border text-xs"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <select
                          value={app.status}
                          onChange={(e) => onUpdateStatus(app.id, e.target.value as ApplicationStatus)}
                          className="bg-background text-foreground font-medium text-xs rounded-md border border-input px-2.5 py-1 focus:ring-1 focus:ring-ring cursor-pointer appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2216%22%20height%3D%2216%22%20viewBox%3D%220%200%2024%2024%20fill%3D%22none%22%20stroke%3D%22currentColor%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E')] bg-[length:0.875rem_0.875rem] bg-[right_0.5rem_center] bg-no-repeat pr-6"
                        >
                          <option value="applied">Applied</option>
                          <option value="screening">Screening</option>
                          <option value="interview">Interview</option>
                          <option value="hired">Hired</option>
                          <option value="rejected">Rejected</option>
                        </select>

                        {onDeleteCandidate && (
                          <button
                            onClick={() => onDeleteCandidate(app)}
                            className="text-muted-foreground hover:text-destructive transition-colors p-1.5 rounded-md hover:bg-destructive/10 focus-ring"
                            title="Hapus Kandidat"
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
