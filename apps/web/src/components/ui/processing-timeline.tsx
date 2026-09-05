'use client';

import React from 'react';
import { ParseStatus } from '@cv-ats/contracts';
import { CheckCircle2, Loader2, AlertTriangle, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ProcessingTimelineProps {
  currentStatus: ParseStatus;
  errorMessage?: string;
  warnings?: string[];
}

const STEPS: { key: ParseStatus; label: string; description: string }[] = [
  { key: 'uploaded', label: 'CV Uploaded', description: 'PDF file stored in private storage.' },
  { key: 'queued', label: 'Worker Queue', description: 'Job queued for background worker.' },
  { key: 'processing', label: 'PDF & LLM Extraction', description: 'Extract PDF text & structured schema.' },
  { key: 'processed', label: 'Normalized & Scored', description: 'Embedding & Job-Fit Scoring completed.' },
];

const stepIndex = (status: ParseStatus) =>
  ({ uploaded: 0, queued: 1, processing: 2, processed: 3, needs_review: 3, failed: 3 })[status] ?? 0;

export const ProcessingTimeline: React.FC<ProcessingTimelineProps> = ({
  currentStatus,
  errorMessage,
  warnings = [],
}) => {
  const currentIndex = stepIndex(currentStatus);

  return (
    <div className="bg-canvas rounded p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="uppercase tracking-wider text-ink-subtle">Document Processing Pipeline</h4>
        <span className="text-xs font-mono text-ink-muted">
          Status: <strong className="text-ink">{currentStatus}</strong>
        </span>
      </div>

      <div className="relative pl-6 border-l border-line space-y-4">
        {STEPS.map((step, idx) => {
          const isDone =
            idx < currentIndex ||
            currentStatus === 'processed' ||
            (idx === 3 && currentStatus === 'needs_review');
          const isCurrent =
            idx === currentIndex &&
            !['processed', 'failed', 'needs_review'].includes(currentStatus);
          const isFailed = idx === 3 && currentStatus === 'failed';
          const isWarning = idx === 3 && currentStatus === 'needs_review';

          return (
            <div key={step.key} className="relative flex items-start gap-3">
              <div className="absolute -left-[31px] top-0.5 bg-surface rounded-full p-0.5">
                {isDone ? (
                  <CheckCircle2 className="w-4 h-4 text-ok" />
                ) : isCurrent ? (
                  <Loader2 className="w-4 h-4 text-brand-accent animate-spin" />
                ) : isFailed ? (
                  <XCircle className="w-4 h-4 text-danger" />
                ) : isWarning ? (
                  <AlertTriangle className="w-4 h-4 text-warn" />
                ) : (
                  <div className="w-4 h-4 rounded-full bg-line" />
                )}
              </div>

              <div>
                <p
                  className={cn(
                    'text-xs font-semibold',
                    isDone
                      ? 'text-ink'
                      : isCurrent
                        ? 'text-brand-accent font-bold'
                        : isFailed
                          ? 'text-danger'
                          : isWarning
                            ? 'text-warn'
                            : 'text-ink-subtle'
                  )}
                >
                  {step.label}
                </p>
                <p className="text-[11px] text-ink-subtle leading-snug mt-0.5">{step.description}</p>
              </div>
            </div>
          );
        })}
      </div>

      {currentStatus === 'failed' && errorMessage && (
        <div className="p-3 rounded bg-danger-soft text-danger text-xs flex items-start gap-2">
          <XCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <div>
            <strong className="block font-semibold">Resume Parsing Failed</strong>
            <p className="text-[11px]">{errorMessage}</p>
          </div>
        </div>
      )}

      {currentStatus === 'needs_review' && warnings.length > 0 && (
        <div className="p-3 rounded bg-warn-soft text-warn text-xs space-y-1">
          <div className="flex items-center gap-1.5 font-semibold">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            AI Parsing Notes ({warnings.length})
          </div>
          <ul className="list-disc list-inside text-[11px] space-y-0.5 pl-1">
            {warnings.map((w, i) => (
              <li key={i}>{w}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
