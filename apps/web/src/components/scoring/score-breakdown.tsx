'use client';

import React from 'react';
import { ScoreBreakdown } from '@cv-ats/contracts';
import { Sparkles, Check, AlertCircle, Info } from 'lucide-react';

export interface ScoreBreakdownCardProps {
  score: ScoreBreakdown;
  className?: string;
}

export const ScoreBreakdownCard: React.FC<ScoreBreakdownCardProps> = ({
  score,
  className = '',
}) => {
  const getBadgeColor = (finalScore: number) => {
    if (finalScore >= 80) return 'bg-emerald-50 text-emerald-800 border-emerald-300';
    if (finalScore >= 60) return 'bg-sky-50 text-sky-800 border-sky-300';
    return 'bg-amber-50 text-amber-800 border-amber-300';
  };

  const getMatchLabel = (finalScore: number) => {
    if (finalScore >= 80) return 'Strong Match';
    if (finalScore >= 60) return 'Potential Match';
    return 'Needs Review';
  };

  return (
    <div className={`bg-white border border-slate-300 rounded-xl p-5 text-slate-900 space-y-5 ${className}`}>
      {/* Top Banner Header */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-4">
        <div>
          <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-sky-700" />
            Job Fit Score (AI Decision Support)
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-3xl font-extrabold text-sky-700 tracking-tight">
              {score.final_score}
            </span>
            <span className="text-sm font-semibold text-slate-500">/ 100</span>
          </div>
        </div>
        <div>
          <span
            className={`inline-flex items-center px-3 py-1 border text-xs font-bold rounded-lg ${getBadgeColor(
              score.final_score
            )}`}
          >
            {getMatchLabel(score.final_score)}
          </span>
        </div>
      </div>

      {/* Formula Breakdown Metrics */}
      <div className="space-y-3">
        <h4 className="text-xs font-semibold text-slate-600 flex items-center justify-between">
          <span>Komponen Skor Formula ({score.score_version})</span>
          <span className="text-[10px] text-slate-500 font-mono">Bobot Penilaian</span>
        </h4>

        {/* Semantic Relevance (45%) */}
        <div>
          <div className="flex justify-between text-xs mb-1">
            <span className="text-slate-700 font-medium">Relevansi Semantik Text</span>
            <span className="font-mono text-slate-900 font-bold">
              {Math.round(score.semantic_similarity * 100)}% <span className="text-slate-500 text-[10px]">(45%)</span>
            </span>
          </div>
          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden border border-slate-300">
            <div
              className="bg-sky-600 h-full transition-all duration-500"
              style={{ width: `${Math.min(100, Math.max(0, score.semantic_similarity * 100))}%` }}
            />
          </div>
        </div>

        {/* Mandatory Skills (30%) */}
        <div>
          <div className="flex justify-between text-xs mb-1">
            <span className="text-slate-700 font-medium">Kesesuaian Skill Wajib</span>
            <span className="font-mono text-slate-900 font-bold">
              {Math.round(score.mandatory_skill_score * 100)}% <span className="text-slate-500 text-[10px]">(30%)</span>
            </span>
          </div>
          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden border border-slate-300">
            <div
              className="bg-emerald-600 h-full transition-all duration-500"
              style={{ width: `${Math.min(100, Math.max(0, score.mandatory_skill_score * 100))}%` }}
            />
          </div>
        </div>

        {/* Experience Match (20%) */}
        <div>
          <div className="flex justify-between text-xs mb-1">
            <span className="text-slate-700 font-medium">Lama Pengalaman Kerja</span>
            <span className="font-mono text-slate-900 font-bold">
              {Math.round(score.experience_score * 100)}% <span className="text-slate-500 text-[10px]">(20%)</span>
            </span>
          </div>
          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden border border-slate-300">
            <div
              className="bg-indigo-600 h-full transition-all duration-500"
              style={{ width: `${Math.min(100, Math.max(0, score.experience_score * 100))}%` }}
            />
          </div>
        </div>

        {/* Preferred Skills (5%) */}
        <div>
          <div className="flex justify-between text-xs mb-1">
            <span className="text-slate-700 font-medium">Skill Tambahan (Preferred)</span>
            <span className="font-mono text-slate-900 font-bold">
              {Math.round(score.preferred_skill_score * 100)}% <span className="text-slate-500 text-[10px]">(5%)</span>
            </span>
          </div>
          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden border border-slate-300">
            <div
              className="bg-slate-700 h-full transition-all duration-500"
              style={{ width: `${Math.min(100, Math.max(0, score.preferred_skill_score * 100))}%` }}
            />
          </div>
        </div>
      </div>

      {/* Matched vs Missing Skills Badges */}
      <div className="pt-4 border-t border-slate-200 space-y-3">
        {/* Matched Skills */}
        <div>
          <h4 className="text-xs font-bold text-slate-800 mb-2 flex items-center gap-1.5">
            <Check className="w-3.5 h-3.5 text-emerald-600" />
            Skill Cocok Terdeteksi ({score.matched_skills.length})
          </h4>
          <div className="flex flex-wrap gap-1.5">
            {score.matched_skills.length > 0 ? (
              score.matched_skills.map((skill) => (
                <span
                  key={skill}
                  className="px-2.5 py-1 bg-emerald-50 text-emerald-900 border border-emerald-300 text-[11px] font-semibold rounded-lg"
                >
                  ✓ {skill}
                </span>
              ))
            ) : (
              <span className="text-slate-500 text-xs italic">Tidak ada skill yang cocok</span>
            )}
          </div>
        </div>

        {/* Missing Mandatory Skills */}
        {score.missing_mandatory_skills.length > 0 && (
          <div>
            <h4 className="text-xs font-bold text-rose-800 mb-2 flex items-center gap-1.5">
              <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
              Skill Wajib Belum Ditemukan ({score.missing_mandatory_skills.length})
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {score.missing_mandatory_skills.map((skill) => (
                <span
                  key={skill}
                  className="px-2.5 py-1 bg-rose-50 text-rose-900 border border-rose-300 text-[11px] font-semibold rounded-lg"
                >
                  ! {skill}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Audit Transparency Disclaimer */}
      <div className="p-3.5 bg-slate-100 rounded-lg border border-slate-300 text-[11px] text-slate-700 flex items-start gap-2">
        <Info className="w-4 h-4 text-sky-700 shrink-0 mt-0.5" />
        <p>
          Skor AI merupakan <strong>alat bantu penunjang keputusan HR</strong>. Skor tidak secara otomatis menolak kandidat. HR berwenang meninjau ulang CV secara manual.
        </p>
      </div>
    </div>
  );
};

