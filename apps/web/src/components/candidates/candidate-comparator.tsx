'use client';

import React, { useState } from 'react';
import { CandidateApplication } from '@/lib/types';
import { Button, Card, StatusBadge } from '@/components/ui';
import { Scale, Trophy, Calendar, Check, X } from 'lucide-react';

interface CandidateComparatorProps {
  applications: CandidateApplication[];
  onClose: () => void;
}

export const CandidateComparator: React.FC<CandidateComparatorProps> = ({
  applications,
  onClose,
}) => {
  const [selectedIds, setSelectedIds] = useState<string[]>(
    applications.slice(0, 2).map((a) => a.id)
  );

  const toggleSelect = (id: string) => {
    if (selectedIds.includes(id)) {
      if (selectedIds.length > 1) {
        setSelectedIds(selectedIds.filter((item) => item !== id));
      }
    } else {
      if (selectedIds.length < 3) {
        setSelectedIds([...selectedIds, id]);
      }
    }
  };

  const selectedApps = applications.filter((a) => selectedIds.includes(a.id));

  // Determine top score across selected candidates
  const highestScore = Math.max(...selectedApps.map((a) => a.job_fit_score || 0));

  return (
    <div className="flex flex-col gap-5 bg-surface border border-line rounded-xl p-5 shadow-lg">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-line pb-3.5">
        <div>
          <h2 className="text-base font-bold text-ink flex items-center gap-2">
            <Scale className="w-4 h-4 text-accent" />
            Matriks Perbandingan Kandidat
          </h2>
          <p className="text-xs text-ink-muted mt-0.5">
            Pilih hingga 3 kandidat untuk membandingkan kecocokan skill, pengalaman, dan breakdown skor AI side-by-side.
          </p>
        </div>
        <Button variant="secondary" size="sm" onClick={onClose}>
          Tutup
        </Button>
      </div>

      {/* Candidate Selector Toolbar */}
      <div className="flex flex-wrap items-center gap-2 bg-canvas p-3 rounded-lg border border-line text-xs">
        <span className="font-semibold text-ink-muted">Pilih Kandidat (Maks 3):</span>
        {applications.map((app) => {
          const isSelected = selectedIds.includes(app.id);
          return (
            <button
              key={app.id}
              onClick={() => toggleSelect(app.id)}
              className={`px-3 py-1 rounded-md border transition-all text-xs ${
                isSelected
                  ? 'bg-accent-soft border-accent/40 text-accent font-bold'
                  : 'bg-surface border-line text-ink-muted hover:text-ink'
              }`}
            >
              {isSelected ? '✓ ' : '+ '}
              {app.candidate_name} ({app.job_fit_score.toFixed(0)}%)
            </button>
          );
        })}
      </div>

      {/* Side-by-Side Comparison Grid */}
      <div
        className={`grid gap-4 ${
          selectedApps.length === 1
            ? 'grid-cols-1'
            : selectedApps.length === 2
            ? 'grid-cols-1 md:grid-cols-2'
            : 'grid-cols-1 md:grid-cols-3'
        }`}
      >
        {selectedApps.map((app) => {
          const breakdown = app.score_breakdown || {};
          const isTopOverall = app.job_fit_score === highestScore && selectedApps.length > 1;
          const candidateSkills = app.cv_extraction?.skills?.map((s) => s.name || s.normalized_name || '') || [];
          const expMonths = app.cv_extraction?.total_experience_months || 0;
          const education = app.cv_extraction?.education?.[0];

          return (
            <Card
              key={app.id}
              className={`flex flex-col gap-4 relative overflow-hidden transition-all bg-surface border ${
                isTopOverall
                  ? 'border-accent shadow-md ring-1 ring-accent/20'
                  : 'border-line'
              }`}
            >
              {isTopOverall && (
                <div className="absolute top-0 right-0 bg-accent text-accent-fg font-extrabold text-[10px] uppercase tracking-wider px-2.5 py-1 rounded-bl-md font-mono flex items-center gap-1">
                  <Trophy className="w-3 h-3 text-accent-fg" /> Highest Fit
                </div>
              )}

              {/* Candidate Info Header */}
              <div>
                <h3 className="text-sm font-bold text-ink">{app.candidate_name}</h3>
                <p className="text-xs text-ink-muted">{app.email}</p>
                <div className="flex items-center gap-2 mt-2">
                  <StatusBadge status={app.status} />
                  <span className="text-xs text-ink-subtle flex items-center gap-1 font-mono">
                    <Calendar className="w-3 h-3" />
                    {app.applied_at?.slice(0, 10) || 'Baru'}
                  </span>
                </div>
              </div>

              {/* Overall Score Meter */}
              <div className="bg-canvas p-3 rounded-lg border border-line flex flex-col gap-1.5">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-ink-muted">Overall Job-Fit Score</span>
                  <span className="text-sm font-extrabold text-accent">{app.job_fit_score.toFixed(1)} / 100</span>
                </div>
                <div className="w-full bg-line rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-accent h-full rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, Math.max(0, app.job_fit_score))}%` }}
                  />
                </div>
              </div>

              {/* Sub-Score Breakdown Matrix */}
              <div className="flex flex-col gap-1.5 text-xs font-mono border-t border-line pt-3">
                <h4 className="font-bold text-ink font-sans">Breakdown Skor:</h4>

                <div className="flex items-center justify-between bg-canvas/60 p-2 rounded border border-line">
                  <span className="text-ink-muted">Semantic Fit (45%)</span>
                  <span className="text-accent font-bold">
                    {((breakdown.semantic_similarity || 0) * 100).toFixed(0)}%
                  </span>
                </div>

                <div className="flex items-center justify-between bg-canvas/60 p-2 rounded border border-line">
                  <span className="text-ink-muted">Mandatory Skills (30%)</span>
                  <span className="text-ok font-bold">
                    {((breakdown.mandatory_skill_score || 0) * 100).toFixed(0)}%
                  </span>
                </div>

                <div className="flex items-center justify-between bg-canvas/60 p-2 rounded border border-line">
                  <span className="text-ink-muted">Experience Score (20%)</span>
                  <span className="text-warn font-bold">
                    {((breakdown.experience_score || 0) * 100).toFixed(0)}%
                  </span>
                </div>

                <div className="flex items-center justify-between bg-canvas/60 p-2 rounded border border-line">
                  <span className="text-ink-muted">Preferred Skills (5%)</span>
                  <span className="text-ink font-bold">
                    {((breakdown.preferred_skill_score || 0) * 100).toFixed(0)}%
                  </span>
                </div>
              </div>

              {/* Matched vs Missing Skills */}
              <div className="flex flex-col gap-2 text-xs border-t border-line pt-3">
                <h4 className="font-bold text-ink">Matched Skills ({breakdown.matched_skills?.length || 0}):</h4>
                <div className="flex flex-wrap gap-1">
                  {(breakdown.matched_skills || candidateSkills).map((skill: string, idx: number) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 rounded text-[11px] bg-ok-soft text-ok border border-ok/20 flex items-center gap-1 font-medium"
                    >
                      <Check className="w-3 h-3" /> {skill}
                    </span>
                  ))}
                </div>

                {(breakdown.missing_mandatory_skills || []).length > 0 && (
                  <>
                    <h4 className="font-bold text-danger mt-1.5">Missing Mandatory Skills:</h4>
                    <div className="flex flex-wrap gap-1">
                      {breakdown.missing_mandatory_skills.map((skill: string, idx: number) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 rounded text-[11px] bg-danger-soft text-danger border border-danger/20 flex items-center gap-1 font-mono font-medium"
                        >
                          <X className="w-3 h-3" /> {skill}
                        </span>
                      ))}
                    </div>
                  </>
                )}
              </div>

              {/* Work Experience & Education */}
              <div className="flex flex-col gap-1.5 text-xs border-t border-line pt-3 mt-auto">
                <div className="flex items-center justify-between">
                  <span className="text-ink-muted">Total Pengalaman:</span>
                  <span className="font-mono text-ink font-bold">
                    {Math.round((expMonths / 12) * 10) / 10} Tahun
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-ink-muted">Pendidikan:</span>
                  <span className="text-ink font-medium truncate max-w-[180px]" title={education?.institution || ''}>
                    {education?.degree || 'S1'} - {education?.major || 'Teknik'}
                  </span>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
