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
  { status: 'applied', title: 'Applied', topBorder: 'border-t-brand-accent' },
  { status: 'screening', title: 'Screening', topBorder: 'border-t-purple-600' },
  { status: 'interview', title: 'Interview', topBorder: 'border-t-semantic-warning' },
  { status: 'hired', title: 'Hired', topBorder: 'border-t-semantic-success' },
  { status: 'rejected', title: 'Rejected', topBorder: 'border-t-semantic-danger' },
];

export const KanbanBoard: React.FC<KanbanBoardProps> = ({
  applications,
  onSelectCandidate,
  onUpdateStatus,
  onDeleteCandidate,
}) => {
  const getScoreBadgeClass = (score: number) => {
    if (score >= 80) return 'bg-semantic-success_soft text-semantic-success border-semantic-success/20';
    if (score >= 60) return 'bg-semantic-warning_soft text-semantic-warning border-semantic-warning/20';
    return 'bg-semantic-danger_soft text-semantic-danger border-semantic-danger/20';
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 w-full overflow-x-auto pb-4">
      {COLUMNS.map((col) => {
        const columnApps = applications.filter((app) => app.status === col.status);

        return (
          <div
            key={col.status}
            className={`flex flex-col bg-surface-sunken rounded-md border border-surface-border border-t-4 ${col.topBorder} p-3.5 min-h-[540px] shadow-e1`}
          >
            {/* Column Header */}
            <div className="flex items-center justify-between mb-3.5 px-1">
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-caption uppercase tracking-wider text-ink-default">{col.title}</h3>
                <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-pill bg-surface-base text-ink-subtle border border-surface-border">
                  {columnApps.length}
                </span>
              </div>
            </div>

            {/* Candidate Cards Column */}
            <div className="flex flex-col gap-3 flex-1 overflow-y-auto pr-0.5">
              {columnApps.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-36 rounded-md border border-dashed border-surface-border text-ink-subtle text-caption bg-surface-base/50">
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
                      className="group relative bg-surface-raised border border-surface-border hover:border-brand-accent rounded-md p-3.5 shadow-e1 cursor-pointer"
                      onClick={() => onSelectCandidate(app)}
                    >
                      {/* Header: Name & Score */}
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="min-w-0 flex-1">
                          <h4 className="font-bold text-body text-ink-default truncate group-hover:text-brand-accent transition-colors">
                            {app.candidate_name}
                          </h4>
                          <p className="text-caption text-ink-subtle truncate">{app.email}</p>
                        </div>

                        <div
                          className={`px-2 py-0.5 rounded-pill border text-caption font-bold tabular-nums shrink-0 ${getScoreBadgeClass(
                            app.job_fit_score
                          )}`}
                          title="Job-Fit Score"
                        >
                          {app.job_fit_score.toFixed(1)}%
                        </div>
                      </div>

                      {/* Stats Summary */}
                      <div className="flex items-center gap-3 text-caption text-ink-subtle mb-2.5 font-mono">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-ink-subtle" />
                          {Math.round((expMonths / 12) * 10) / 10} thn
                        </span>
                        <span className="flex items-center gap-1">
                          <GraduationCap className="w-3.5 h-3.5 text-ink-subtle" />
                          {degree}
                        </span>
                      </div>

                      {/* Skills Pills */}
                      <div className="flex flex-wrap gap-1 mb-3">
                        {candidateSkills.slice(0, 3).map((skill: string, idx: number) => (
                          <span
                            key={idx}
                            className="text-[11px] px-2 py-0.5 rounded-sm bg-surface-sunken text-ink-subtle border border-surface-border font-medium"
                          >
                            {skill}
                          </span>
                        ))}
                        {candidateSkills.length > 3 && (
                          <span className="text-[11px] px-1.5 py-0.5 rounded-sm bg-surface-sunken text-ink-subtle font-medium">
                            +{candidateSkills.length - 3}
                          </span>
                        )}
                      </div>

                      {/* Status Selector & Delete */}
                      <div
                        className="flex items-center justify-between pt-2.5 border-t border-surface-border text-caption"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <select
                          value={app.status}
                          onChange={(e) => onUpdateStatus(app.id, e.target.value as ApplicationStatus)}
                          className="bg-surface-sunken text-ink-default font-medium text-caption rounded-md border border-surface-border px-2.5 py-1 focus-ring"
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
                            className="text-ink-subtle hover:text-semantic-danger transition-colors p-1.5 rounded-md hover:bg-semantic-danger_soft focus-ring"
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
