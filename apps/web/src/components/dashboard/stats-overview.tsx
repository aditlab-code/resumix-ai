'use client';

import React from 'react';
import { CandidateApplication, JobPosting } from '@/lib/types';
import { Briefcase, Users, Loader2, AlertTriangle, ShieldCheck, CheckCircle2 } from 'lucide-react';

interface StatsOverviewProps {
  jobs: JobPosting[];
  applications: CandidateApplication[];
  onOpenAuditLogs: () => void;
}

export const StatsOverview: React.FC<StatsOverviewProps> = ({
  jobs,
  applications,
  onOpenAuditLogs,
}) => {
  const activeJobsCount = jobs.filter((j) => j.status === 'open').length;
  const totalCandidates = applications.length;
  const processingCount = applications.filter(
    (a) => a.parse_status === 'processing' || a.parse_status === 'queued'
  ).length;
  const warningsCount = applications.filter(
    (a) => a.parse_status === 'needs_review' || a.parse_status === 'failed'
  ).length;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Active Job Postings */}
      <div className="bg-white border border-slate-300 p-4 rounded-xl flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">
            Lowongan Aktif
          </span>
          <div className="w-8 h-8 rounded-lg bg-sky-100 border border-sky-300 text-sky-800 flex items-center justify-center font-bold">
            <Briefcase className="w-4 h-4" />
          </div>
        </div>
        <div className="flex items-baseline justify-between mt-3">
          <span className="text-3xl font-extrabold text-slate-900">{activeJobsCount}</span>
          <span className="text-xs text-sky-800 font-bold">Posisi Terbuka</span>
        </div>
      </div>

      {/* Total Candidates */}
      <div className="bg-white border border-slate-300 p-4 rounded-xl flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">
            Total Kandidat
          </span>
          <div className="w-8 h-8 rounded-lg bg-indigo-100 border border-indigo-300 text-indigo-800 flex items-center justify-center font-bold">
            <Users className="w-4 h-4" />
          </div>
        </div>
        <div className="flex items-baseline justify-between mt-3">
          <span className="text-3xl font-extrabold text-slate-900">{totalCandidates}</span>
          <span className="text-xs text-indigo-800 font-bold">Aplikasi Aktif</span>
        </div>
      </div>

      {/* Processing CVs (AI) */}
      <div className="bg-white border border-slate-300 p-4 rounded-xl flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">
            Processing CVs (AI)
          </span>
          <div
            className={`w-8 h-8 rounded-lg border flex items-center justify-center font-bold ${
              processingCount > 0
                ? 'bg-sky-100 border-sky-300 text-sky-800'
                : 'bg-emerald-100 border-emerald-300 text-emerald-800'
            }`}
          >
            {processingCount > 0 ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <CheckCircle2 className="w-4 h-4" />
            )}
          </div>
        </div>
        <div className="flex items-baseline justify-between mt-3">
          <span
            className={`text-3xl font-extrabold ${
              processingCount > 0 ? 'text-sky-800' : 'text-slate-900'
            }`}
          >
            {processingCount}
          </span>
          <span
            className={`text-xs font-bold ${
              processingCount > 0 ? 'text-sky-800' : 'text-emerald-800'
            }`}
          >
            {processingCount > 0 ? 'Sedang Diproses...' : 'Antrean Selesai ✓'}
          </span>
        </div>
      </div>

      {/* Needs Review / Warnings */}
      <div
        onClick={onOpenAuditLogs}
        className="bg-white border border-slate-300 p-4 rounded-xl flex flex-col justify-between cursor-pointer hover:bg-amber-50 transition"
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">
            Perlu Review Manual
          </span>
          <div className="w-8 h-8 rounded-lg bg-amber-100 border border-amber-300 text-amber-800 flex items-center justify-center font-bold">
            <AlertTriangle className="w-4 h-4" />
          </div>
        </div>
        <div className="flex items-baseline justify-between mt-3">
          <span className="text-3xl font-extrabold text-amber-800">{warningsCount}</span>
          <span className="text-xs text-amber-900 font-bold flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5" /> Audit Log
          </span>
        </div>
      </div>
    </div>
  );
};

