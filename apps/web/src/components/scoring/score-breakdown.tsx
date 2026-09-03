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
  s >= 80 ? 'bg-ok-soft text-ok' : s >= 60 ? 'bg-accent-soft text-accent' : 'bg-warn-soft text-warn';

export const ScoreBreakdownCard: React.FC<ScoreBreakdownCardProps> = ({ score, className = '' }) => {
  const meters = [
    { label: 'Relevansi semantik teks', percent: score.semantic_similarity * 100, weight: 45, tone: 'accent' as const },
    { label: 'Kesesuaian skill wajib', percent: score.mandatory_skill_score * 100, weight: 30, tone: 'ok' as const },
    { label: 'Lama pengalaman kerja', percent: score.experience_score * 100, weight: 20, tone: 'accent' as const },
    { label: 'Skill tambahan (preferred)', percent: score.preferred_skill_score * 100, weight: 5, tone: 'ink' as const },
  ];

  return (
    <Card className={cn('space-y-4', className)}>
      <div className="flex items-center justify-between border-b border-line pb-3">
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-extrabold text-accent tracking-tight">
            {score.final_score}
          </span>
          <span className="text-xs font-semibold text-ink-subtle">/ 100</span>
        </div>
        <span
          className={cn(
            'inline-flex items-center px-2.5 py-1 text-xs font-bold rounded',
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

      <div className="pt-3 border-t border-line space-y-3">
        <div>
          <SectionLabel className="mb-2 flex items-center gap-1.5 normal-case tracking-normal text-ink">
            <Check className="w-3.5 h-3.5 text-ok" />
            Skill cocok ({score.matched_skills.length})
          </SectionLabel>
          <div className="flex flex-wrap gap-1.5">
            {score.matched_skills.length > 0 ? (
              score.matched_skills.map((skill) => (
                <span
                  key={skill}
                  className="px-2 py-0.5 bg-ok-soft text-ok text-[11px] font-semibold rounded"
                >
                  {skill}
                </span>
              ))
            ) : (
              <span className="text-ink-subtle text-xs italic">Tidak ada skill yang cocok</span>
            )}
          </div>
        </div>

        {score.missing_mandatory_skills.length > 0 && (
          <div>
            <SectionLabel className="mb-2 flex items-center gap-1.5 normal-case tracking-normal text-danger">
              <AlertCircle className="w-3.5 h-3.5" />
              Skill wajib belum ditemukan ({score.missing_mandatory_skills.length})
            </SectionLabel>
            <div className="flex flex-wrap gap-1.5">
              {score.missing_mandatory_skills.map((skill) => (
                <span
                  key={skill}
                  className="px-2 py-0.5 bg-danger-soft text-danger text-[11px] font-semibold rounded"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="p-3 bg-canvas rounded text-[11px] text-ink-muted flex items-start gap-2">
        <Info className="w-4 h-4 text-accent shrink-0 mt-0.5" />
        <p>
          Skor AI adalah <strong>alat bantu keputusan HR</strong>, tidak menolak kandidat secara
          otomatis. HR berwenang meninjau ulang CV secara manual.
        </p>
      </div>
    </Card>
  );
};
