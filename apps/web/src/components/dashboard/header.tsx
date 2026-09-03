'use client';

import React from 'react';
import { Plus, Shield, FileText } from 'lucide-react';

export type ActiveViewType = 'dashboard' | 'jobs' | 'candidates' | 'settings';

interface HeaderProps {
  activeView: ActiveViewType;
  onOpenUploadModal: () => void;
  onOpenCreateJobModal: () => void;
  onOpenAuditLogs: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeView,
  onOpenUploadModal,
  onOpenCreateJobModal,
  onOpenAuditLogs,
}) => {
  const viewTitles: Record<ActiveViewType, { title: string; subtitle: string }> = {
    dashboard: {
      title: 'Dashboard HR & Candidate Screening',
      subtitle: 'Overview ranking kandidat, job-fit scoring AI, dan status rekrutmen',
    },
    jobs: {
      title: 'Manajemen Lowongan Kerja',
      subtitle: 'Kelola kriteria posisi, mandatory skills, dan bobot penilaian',
    },
    candidates: {
      title: 'Database Kandidat Terpusat',
      subtitle: 'Direktori seluruh profil pelamar, dokumen CV, dan riwayat ekstraksi',
    },
    settings: {
      title: 'Pengaturan Pipeline ATS',
      subtitle: 'Konfigurasi model LLM, pgvector threshold, dan sinonim skill',
    },
  };

  const currentInfo = viewTitles[activeView] || viewTitles.dashboard;

  return (
    <header className="bg-white border border-slate-300 rounded-xl px-5 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      {/* Module Context Title / Breadcrumb */}
      <div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono uppercase font-bold text-sky-800 bg-sky-50 px-2 py-0.5 rounded border border-sky-300">
            ERP Modul / {activeView}
          </span>
        </div>
        <h1 className="text-base font-extrabold text-slate-900 mt-0.5 tracking-tight">
          {currentInfo.title}
        </h1>
        <p className="text-xs text-slate-500 font-medium">
          {currentInfo.subtitle}
        </p>
      </div>

      {/* Global Actions Bar */}
      <div className="flex flex-wrap items-center gap-2 shrink-0">
        <button
          onClick={onOpenAuditLogs}
          className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-lg border border-slate-300 transition flex items-center gap-1.5"
        >
          <Shield className="w-3.5 h-3.5 text-sky-700" />
          <span>Audit Logs</span>
        </button>

        <button
          onClick={onOpenCreateJobModal}
          className="px-3 py-2 bg-slate-800 hover:bg-slate-900 text-white font-semibold text-xs rounded-lg border border-slate-800 transition flex items-center gap-1.5"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>+ Lowongan Baru</span>
        </button>

        <button
          onClick={onOpenUploadModal}
          className="px-3.5 py-2 bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs rounded-lg border border-sky-600 transition flex items-center gap-1.5"
        >
          <FileText className="w-3.5 h-3.5" />
          <span>+ Unggah CV (PDF)</span>
        </button>
      </div>
    </header>
  );
};


