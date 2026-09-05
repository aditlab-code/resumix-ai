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
    ? 'bg-emerald-500/10 text-emerald-700 border-emerald-500/30'
    : s >= 60
      ? 'bg-amber-500/10 text-amber-700 border-amber-500/30'
      : 'bg-destructive/10 text-destructive border-destructive/30';

export const ScoreBreakdownCard: React.FC<ScoreBreakdownCardProps> = ({ score, className = '' }) => {
  const meters = [
    { label: 'Relevansi semantik teks', percent: score.semantic_similarity * 100, weight: 45, tone: 'accent' as const },
    { label: 'Kesesuaian skill wajib', percent: score.mandatory_skill_score * 100, weight: 30, tone: 'ok' as const },
    { label: 'Lama pengalaman kerja', percent: score.experience_score * 100, weight: 20, tone: 'accent' as const },
    { label: 'Skill tambahan (preferred)', percent: score.preferred_skill_score * 100, weight: 5, tone: 'ink' as const },
  ];

  return (
    <Card className={cn('p-6 space-y-5 shadow-sm border-border bg-card', className)}>
      <div className="flex items-center justify-between border-b border-border pb-4">
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-extrabold text-foreground tracking-tight tabular-nums">
            {score.final_score}
          </span>
          <span className="text-sm font-semibold text-muted-foreground">/ 100</span>
        </div>
        <span
          className={cn(
            'inline-flex items-center px-3 py-1 text-xs font-bold rounded-full border',
            matchTone(score.final_score)
          )}
        >
          {matchLabel(score.final_score)}
        </span>
      </div>

      <div className="space-y-3.5">
        {meters.map((m) => (
          <Meter key={m.label} label={m.label} percent={m.percent} weight={m.weight} tone={m.tone} />
        ))}
      </div>

      <div className="pt-4 border-t border-border space-y-4">
        <div>
          <SectionLabel className="mb-2.5 flex items-center gap-1.5 normal-case tracking-normal text-foreground font-extrabold text-xs">
            <Check className="w-4 h-4 text-emerald-600" />
            Skill cocok ({score.matched_skills.length})
          </SectionLabel>
          <div className="flex flex-wrap gap-1.5">
            {score.matched_skills.length > 0 ? (
              score.matched_skills.map((skill) => (
                <span
                  key={skill}
                  className="px-3 py-1 bg-emerald-500/15 text-emerald-900 border border-emerald-500/35 text-xs font-bold rounded-full shadow-2xs flex items-center gap-1"
                >
                  <Check className="w-3 h-3 text-emerald-600" /> {skill}
                </span>
              ))
            ) : (
              <span className="text-muted-foreground text-xs italic">Tidak ada skill yang cocok</span>
            )}
          </div>
        </div>

        {score.missing_mandatory_skills.length > 0 && (
          <div>
            <SectionLabel className="mb-2.5 flex items-center gap-1.5 normal-case tracking-normal text-destructive font-extrabold text-xs">
              <AlertCircle className="w-4 h-4 text-destructive" />
              Skill wajib belum ditemukan ({score.missing_mandatory_skills.length})
            </SectionLabel>
            <div className="flex flex-wrap gap-1.5">
              {score.missing_mandatory_skills.map((skill) => (
                <span
                  key={skill}
                  className="px-3 py-1 bg-rose-500/15 text-rose-900 border border-rose-500/35 text-xs font-bold rounded-full shadow-2xs font-mono"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="p-3.5 bg-muted/40 border border-border rounded-lg text-xs text-muted-foreground flex items-start gap-2.5">
        <Info className="w-4 h-4 text-primary shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          Skor AI adalah <strong className="text-foreground font-semibold">alat bantu keputusan HR</strong>, tidak menolak kandidat secara
          otomatis. HR berwenang meninjau ulang CV secara manual.
        </p>
      </div>
    </Card>
  );
};
