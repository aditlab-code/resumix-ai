'use client';

import React from 'react';
import { ScoreBreakdown } from '@cv-ats/contracts';
import { Check, AlertCircle, Info } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card, Meter, SectionLabel } from '@/components/ui';

export interface ScoreBreakdownCardProps {
  score: ScoreBreakdown;
  className?: string;
}

const matchLabel = (s: number) =>
  s >= 80 ? 'Strong Match' : s >= 60 ? 'Potential Match' : 'Needs Review';
const matchTone = (s: number) =>
  s >= 80
    ? 'bg-semantic-success_soft text-semantic-success border-semantic-success/20'
    : s >= 60
      ? 'bg-semantic-warning_soft text-semantic-warning border-semantic-warning/20'
      : 'bg-semantic-danger_soft text-semantic-danger border-semantic-danger/20';

export const ScoreBreakdownCard: React.FC<ScoreBreakdownCardProps> = ({ score, className = '' }) => {
  const meters = [
    { label: 'Relevansi semantik teks', percent: score.semantic_similarity * 100, weight: 45, tone: 'accent' as const },
    { label: 'Kesesuaian skill wajib', percent: score.mandatory_skill_score * 100, weight: 30, tone: 'ok' as const },
    { label: 'Lama pengalaman kerja', percent: score.experience_score * 100, weight: 20, tone: 'accent' as const },
    { label: 'Skill tambahan (preferred)', percent: score.preferred_skill_score * 100, weight: 5, tone: 'ink' as const },
  ];

  return (
    <Card className={cn('space-y-4 shadow-e1', className)}>
      <div className="flex items-center justify-between border-b border-surface-border pb-3.5">
        <div className="flex items-baseline gap-2">
          <span className="text-metric font-bold text-ink-default tracking-tight tabular-nums">
            {score.final_score}
          </span>
          <span className="text-caption font-semibold text-ink-subtle">/ 100</span>
        </div>
        <span
          className={cn(
            'inline-flex items-center px-3 py-1 text-caption font-bold rounded-pill border',
            matchTone(score.final_score)
          )}
        >
          {matchLabel(score.final_score)}
        </span>
      </div>

      <div className="space-y-3">
        {meters.map((m) => (
          <Meter key={m.label} label={m.label} percent={m.percent} weight={m.weight} tone={m.tone} />
        ))}
      </div>

      <div className="pt-3.5 border-t border-surface-border space-y-3.5">
        <div>
          <SectionLabel className="mb-2 flex items-center gap-1.5 normal-case tracking-normal text-ink-default font-semibold">
            <Check className="w-4 h-4 text-semantic-success" />
            Skill cocok ({score.matched_skills.length})
          </SectionLabel>
          <div className="flex flex-wrap gap-1.5">
            {score.matched_skills.length > 0 ? (
              score.matched_skills.map((skill) => (
                <span
                  key={skill}
                  className="px-2.5 py-0.5 bg-semantic-success_soft text-semantic-success border border-semantic-success/20 text-caption font-semibold rounded-pill"
                >
                  {skill}
                </span>
              ))
            ) : (
              <span className="text-ink-subtle text-caption italic">Tidak ada skill yang cocok</span>
            )}
          </div>
        </div>

        {score.missing_mandatory_skills.length > 0 && (
          <div>
            <SectionLabel className="mb-2 flex items-center gap-1.5 normal-case tracking-normal text-semantic-danger font-semibold">
              <AlertCircle className="w-4 h-4 text-semantic-danger" />
              Skill wajib belum ditemukan ({score.missing_mandatory_skills.length})
            </SectionLabel>
            <div className="flex flex-wrap gap-1.5">
              {score.missing_mandatory_skills.map((skill) => (
                <span
                  key={skill}
                  className="px-2.5 py-0.5 bg-semantic-danger_soft text-semantic-danger border border-semantic-danger/20 text-caption font-semibold rounded-pill"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="p-3.5 bg-surface-sunken border border-surface-border rounded-md text-caption text-ink-subtle flex items-start gap-2.5">
        <Info className="w-4 h-4 text-brand-accent shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          Skor AI adalah <strong className="text-ink-default font-semibold">alat bantu keputusan HR</strong>, tidak menolak kandidat secara
          otomatis. HR berwenang meninjau ulang CV secara manual.
        </p>
      </div>
    </Card>
  );
};
