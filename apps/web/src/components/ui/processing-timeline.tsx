'use client';

import React from 'react';
import { ParseStatus } from '@cv-ats/contracts';
import { CheckCircle2, Clock, Loader2, AlertTriangle, XCircle } from 'lucide-react';

interface ProcessingTimelineProps {
  currentStatus: ParseStatus;
  errorMessage?: string;
  warnings?: string[];
}

const STEPS: { key: ParseStatus; label: string; description: string }[] = [
  { key: 'uploaded', label: 'CV Uploaded', description: 'Berkas PDF tersimpan aman di storage privat.' },
  { key: 'queued', label: 'In Worker Queue', description: 'Pekerjaan antrean dipasang ke Redis/BullMQ.' },
  { key: 'processing', label: 'PyMuPDF & LLM Extraction', description: 'Mengekstrak teks, OCR fallback & skema Pydantic.' },
  { key: 'processed', label: 'Normalized & Scored', description: 'Embedding vector & Job-Fit Score selesai.' },
];

export const ProcessingTimeline: React.FC<ProcessingTimelineProps> = ({
  currentStatus,
  errorMessage,
  warnings = [],
}) => {
  const getStepIndex = (status: ParseStatus) => {
    switch (status) {
      case 'uploaded': return 0;
      case 'queued': return 1;
      case 'processing': return 2;
      case 'processed':
      case 'needs_review':
      case 'failed':
        return 3;
      default: return 0;
    }
  };

  const currentIndex = getStepIndex(currentStatus);

  return (
    <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5 text-sky-600" />
          Alur Pemrosesan Dokumen AI
        </h4>
        <span className="text-xs text-slate-500 font-mono">
          Status: <strong className="text-slate-900">{currentStatus}</strong>
        </span>
      </div>

      <div className="relative pl-6 border-l border-slate-200 space-y-4">
        {STEPS.map((step, idx) => {
          const isDone = idx < currentIndex || currentStatus === 'processed' || (idx === 3 && currentStatus === 'needs_review');
          const isCurrent = idx === currentIndex && currentStatus !== 'processed' && currentStatus !== 'failed' && currentStatus !== 'needs_review';
          const isFailed = idx === 3 && currentStatus === 'failed';
          const isWarning = idx === 3 && currentStatus === 'needs_review';

          return (
            <div key={step.key} className="relative flex items-start gap-3">
              {/* Timeline Node Icon */}
              <div className="absolute -left-[31px] top-0.5 bg-white rounded-full p-0.5 border border-slate-200">
                {isDone ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                ) : isCurrent ? (
                  <Loader2 className="w-4 h-4 text-sky-600 animate-spin" />
                ) : isFailed ? (
                  <XCircle className="w-4 h-4 text-rose-600" />
                ) : isWarning ? (
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                ) : (
                  <div className="w-4 h-4 rounded-full border border-slate-300 bg-slate-100" />
                )}
              </div>

              <div>
                <p className={`text-xs font-semibold ${isDone ? 'text-slate-800' : isCurrent ? 'text-sky-700 font-bold' : isFailed ? 'text-rose-700' : isWarning ? 'text-amber-800' : 'text-slate-400'}`}>
                  {step.label}
                </p>
                <p className="text-[11px] text-slate-500 leading-relaxed mt-0.5">
                  {step.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {currentStatus === 'failed' && errorMessage && (
        <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2">
          <XCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
          <div>
            <strong className="block font-semibold">Kegagalan Parsing CV:</strong>
            <p className="text-rose-700 text-[11px]">{errorMessage}</p>
          </div>
        </div>
      )}

      {currentStatus === 'needs_review' && warnings.length > 0 && (
        <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 text-xs space-y-1">
          <div className="flex items-center gap-1.5 font-semibold text-amber-800">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
            Catatan Perhatian AI Parsing ({warnings.length}):
          </div>
          <ul className="list-disc list-inside text-[11px] text-amber-800/90 space-y-0.5 pl-1">
            {warnings.map((w, i) => (
              <li key={i}>{w}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
