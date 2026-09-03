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
  { status: 'applied', title: 'Applied', topBorder: 'border-t-accent' },
  { status: 'screening', title: 'Screening', topBorder: 'border-t-purple-600' },
  { status: 'interview', title: 'Interview', topBorder: 'border-t-warn' },
  { status: 'hired', title: 'Hired', topBorder: 'border-t-ok' },
  { status: 'rejected', title: 'Rejected', topBorder: 'border-t-danger' },
];

export const KanbanBoard: React.FC<KanbanBoardProps> = ({
  applications,
  onSelectCandidate,
  onUpdateStatus,
  onDeleteCandidate,
}) => {
  const getScoreBadgeClass = (score: number) => {
    if (score >= 80) return 'bg-ok-soft text-ok border-ok/20';
    if (score >= 60) return 'bg-accent-soft text-accent border-accent/20';
    return 'bg-warn-soft text-warn border-warn/20';
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-3.5 w-full overflow-x-auto pb-4">
      {COLUMNS.map((col) => {
        const columnApps = applications.filter((app) => app.status === col.status);

        return (
          <div
            key={col.status}
            className={`flex flex-col bg-surface rounded-xl border border-line border-t-4 ${col.topBorder} p-3 min-h-[520px] shadow-sm`}
          >
            {/* Column Header */}
            <div className="flex items-center justify-between mb-3 px-1">
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-xs text-ink">{col.title}</h3>
                <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-full bg-canvas text-ink-muted border border-line">
                  {columnApps.length}
                </span>
              </div>
            </div>

            {/* Candidate Cards Column */}
            <div className="flex flex-col gap-2.5 flex-1 overflow-y-auto pr-0.5">
              {columnApps.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-32 rounded-lg border border-dashed border-line text-ink-subtle text-xs bg-canvas/40">
                  Tidak ada kandidat
                </div>
              ) : (
                columnApps.map((app) => {
                  const candidateSkills = app.cv_extraction?.skills?.map((s) => s.name || s.normalized_name || '') || [];
                  const expMonths = app.cv_extraction?.total_experience_months || 0;
                  const degree = app.cv_extraction?.education?.[0]?.degree || 'S1';

                  return (
                    <div
                      key={app.id}
                      className="group relative bg-surface border border-line hover:border-accent/40 rounded-lg p-3 transition-all duration-200 hover:shadow-md cursor-pointer"
                      onClick={() => onSelectCandidate(app)}
                    >
                      {/* Header: Name & Score */}
                      <div className="flex items-start justify-between gap-2 mb-1.5">
                        <div className="min-w-0 flex-1">
                          <h4 className="font-bold text-xs text-ink truncate group-hover:text-accent transition-colors">
                            {app.candidate_name}
                          </h4>
                          <p className="text-[11px] text-ink-muted truncate">{app.email}</p>
                        </div>

                        <div
                          className={`px-2 py-0.5 rounded border text-xs font-extrabold font-mono shrink-0 ${getScoreBadgeClass(
                            app.job_fit_score
                          )}`}
                          title="Job-Fit Score"
                        >
                          {app.job_fit_score.toFixed(1)}%
                        </div>
                      </div>

                      {/* Stats Summary */}
                      <div className="flex items-center gap-3 text-[11px] text-ink-muted mb-2 font-mono">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-ink-subtle" />
                          {Math.round((expMonths / 12) * 10) / 10} thn
                        </span>
                        <span className="flex items-center gap-1">
                          <GraduationCap className="w-3 h-3 text-ink-subtle" />
                          {degree}
                        </span>
                      </div>

                      {/* Skills Pills */}
                      <div className="flex flex-wrap gap-1 mb-3">
                        {candidateSkills.slice(0, 3).map((skill: string, idx: number) => (
                          <span
                            key={idx}
                            className="text-[10px] px-1.5 py-0.5 rounded bg-canvas text-ink-muted border border-line"
                          >
                            {skill}
                          </span>
                        ))}
                        {candidateSkills.length > 3 && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-canvas text-ink-subtle">
                            +{candidateSkills.length - 3}
                          </span>
                        )}
                      </div>

                      {/* Status Selector & Delete */}
                      <div
                        className="flex items-center justify-between pt-2 border-t border-line text-xs"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <select
                          value={app.status}
                          onChange={(e) => onUpdateStatus(app.id, e.target.value as ApplicationStatus)}
                          className="bg-canvas text-ink font-medium text-[11px] rounded border border-line px-2 py-1 focus:border-accent"
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
                            className="text-ink-subtle hover:text-danger transition-colors p-1"
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
