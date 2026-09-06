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
    <div className="flex flex-col gap-6 bg-card text-card-foreground border border-border rounded-xl p-6 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border pb-4">
        <h2 className="text-base font-bold text-foreground">
          Candidate Comparison Matrix
        </h2>
        <Button variant="outline" size="sm" onClick={onClose}>
          Close
        </Button>
      </div>

      {/* Candidate Selector Toolbar */}
      <div className="flex flex-wrap items-center gap-2 bg-muted/40 p-3 rounded-lg border border-border text-xs">
        <span className="font-semibold text-muted-foreground mr-1">Select Candidates (Max 3):</span>
        {applications.map((app) => {
          const isSelected = selectedIds.includes(app.id);
          return (
            <button
              key={app.id}
              onClick={() => toggleSelect(app.id)}
              className={`px-3 py-1.5 rounded-md border transition-all text-xs font-semibold ${
                isSelected
                  ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                  : 'bg-background border-border text-muted-foreground hover:text-foreground hover:bg-muted'
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
        className={`grid gap-5 ${
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
              className={`p-5 flex flex-col gap-4 relative overflow-hidden transition-all bg-card border ${
                isTopOverall
                  ? 'border-primary shadow-md ring-1 ring-primary/20'
                  : 'border-border'
              }`}
            >
              {isTopOverall && (
                <div className="absolute top-0 right-0 bg-primary text-primary-foreground font-extrabold text-[10px] uppercase tracking-wider px-2.5 py-1 rounded-bl-md font-mono flex items-center gap-1">
                  <Trophy className="w-3 h-3 text-primary-foreground" /> Highest Fit
                </div>
              )}

              {/* Candidate Info Header */}
              <div>
                <h3 className="text-sm font-bold text-foreground">{app.candidate_name}</h3>
                <p className="text-xs text-muted-foreground">{app.email}</p>
                <div className="flex items-center gap-2 mt-2">
                  <StatusBadge status={app.status} />
                  <span className="text-xs text-muted-foreground flex items-center gap-1 font-mono">
                    <Calendar className="w-3 h-3" />
                    {app.applied_at?.slice(0, 10) || 'New'}
                  </span>
                </div>
              </div>

              {/* Overall Score Meter */}
              <div className="bg-muted/30 p-3 rounded-lg border border-border flex flex-col gap-2">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-muted-foreground font-medium">Overall Job-Fit Score</span>
                  <span className="text-sm font-extrabold text-primary">{app.job_fit_score.toFixed(1)} / 100</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2 overflow-hidden relative">
                  <div
                    className="bg-primary h-full rounded-full transition-all duration-500 w-[var(--width)]"
                    style={{ '--width': `${Math.min(100, Math.max(0, app.job_fit_score))}%` } as React.CSSProperties}
                  />
                </div>
              </div>

              {/* Sub-Score Breakdown Matrix */}
              <div className="flex flex-col gap-2 text-xs font-mono border-t border-border pt-3">
                <h4 className="font-bold text-foreground font-sans">Score Breakdown:</h4>

                <div className="flex items-center justify-between bg-muted/20 p-2 rounded border border-border">
                  <span className="text-muted-foreground">Semantic Fit (45%)</span>
                  <span className="text-primary font-bold">
                    {((breakdown.semantic_similarity || 0) * 100).toFixed(0)}%
                  </span>
                </div>

                <div className="flex items-center justify-between bg-muted/20 p-2 rounded border border-border">
                  <span className="text-muted-foreground">Mandatory Skills (30%)</span>
                  <span className="text-emerald-600 font-bold">
                    {((breakdown.mandatory_skill_score || 0) * 100).toFixed(0)}%
                  </span>
                </div>

                <div className="flex items-center justify-between bg-muted/20 p-2 rounded border border-border">
                  <span className="text-muted-foreground">Experience Score (20%)</span>
                  <span className="text-amber-600 font-bold">
                    {((breakdown.experience_score || 0) * 100).toFixed(0)}%
                  </span>
                </div>

                <div className="flex items-center justify-between bg-muted/20 p-2 rounded border border-border">
                  <span className="text-muted-foreground">Preferred Skills (5%)</span>
                  <span className="text-foreground font-bold">
                    {((breakdown.preferred_skill_score || 0) * 100).toFixed(0)}%
                  </span>
                </div>
              </div>

              {/* Matched vs Missing Skills */}
              <div className="flex flex-col gap-2 text-xs border-t border-border pt-3">
                <h4 className="font-bold text-foreground">Matched Skills ({breakdown.matched_skills?.length || 0}):</h4>
                <div className="flex flex-wrap gap-1">
                  {(breakdown.matched_skills || candidateSkills).map((skill: string, idx: number) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 rounded-md text-[11px] bg-emerald-500/15 text-emerald-900 border border-emerald-500/35 flex items-center gap-1 font-bold shadow-2xs"
                    >
                      <Check className="w-3 h-3 text-emerald-600" /> {skill}
                    </span>
                  ))}
                </div>

                {(breakdown.missing_mandatory_skills || []).length > 0 && (
                  <>
                    <h4 className="font-bold text-destructive mt-1.5">Missing Mandatory Skills:</h4>
                    <div className="flex flex-wrap gap-1">
                      {breakdown.missing_mandatory_skills.map((skill: string, idx: number) => (
                        <span
                          key={idx}
                          className="px-2.5 py-1 rounded-md text-[11px] bg-rose-500/15 text-rose-900 border border-rose-500/35 flex items-center gap-1 font-mono font-bold shadow-2xs"
                        >
                          <X className="w-3 h-3 text-rose-600" /> {skill}
                        </span>
                      ))}
                    </div>
                  </>
                )}
              </div>

              {/* Work Experience & Education */}
              <div className="flex flex-col gap-1.5 text-xs border-t border-border pt-3 mt-auto">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Total Experience:</span>
                  <span className="font-mono text-foreground font-bold">
                    {Math.round((expMonths / 12) * 10) / 10} Years
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Education:</span>
                  <span className="text-foreground font-medium truncate max-w-[180px]" title={education?.institution || ''}>
                    {education?.degree || 'Bachelor'} - {education?.major || 'Engineering'}
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
