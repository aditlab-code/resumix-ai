'use client';

import React from 'react';
import { Plus, Shield, FileText, Copy, Check, Save } from 'lucide-react';
import { Button } from '@/components/ui';

export type ActiveViewType = 'dashboard' | 'jobs' | 'candidates' | 'settings' | 'docs';

interface HeaderProps {
  activeView: ActiveViewType;
  onOpenUploadModal: () => void;
  onOpenCreateJobModal: () => void;
  onOpenAuditLogs: () => void;
  onCopyApiSpec?: () => void;
  onSaveSettings?: () => void;
}

const TITLES: Record<ActiveViewType, string> = {
  dashboard: 'Dashboard Overview',
  jobs: 'Kelola Lowongan Pekerjaan',
  candidates: 'Daftar & Evaluasi Kandidat',
  settings: 'Pengaturan Pipeline ATS',
  docs: 'Dokumentasi Sistem & API',
};

const SUBTITLES: Record<ActiveViewType, string> = {
  dashboard: 'Ringkasan metrik kandidat, status pemrosesan ATS, dan statistik lamaran.',
  jobs: 'Daftar posisi pekerjaan aktif, kriteria skill wajib, dan bobot seleksi.',
  candidates: 'Analisis kecocokan CV, komparasi matriks, dan papan kanban kandidat.',
  settings: 'Konfigurasi threshold PyMuPDF, Groq LLM model, dan pgvector distance.',
  docs: 'Spesifikasi REST API, formula scoring 4-vektor, dan aturan zero-text rejection.',
};

export const Header: React.FC<HeaderProps> = ({
  activeView,
  onOpenUploadModal,
  onOpenCreateJobModal,
  onOpenAuditLogs,
  onCopyApiSpec,
  onSaveSettings,
}) => {
  const [copied, setCopied] = React.useState(false);

  const handleCopySpec = () => {
    if (onCopyApiSpec) {
      onCopyApiSpec();
    } else {
      navigator.clipboard.writeText(window.location.origin + '/api/docs');
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-surface-raised border border-surface-border p-5 rounded-md shadow-e1 sticky top-0 z-20">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1 hidden sm:flex shrink-0">
          <span className="w-2.5 h-2.5 rounded-full bg-brand-accent"></span>
          <span className="w-2.5 h-2.5 rounded-full bg-brand-accent/60"></span>
          <span className="w-2.5 h-2.5 rounded-full bg-brand-accent/30"></span>
        </div>
        <div>
          <h1 className="text-h1 font-bold text-ink-default tracking-tight">{TITLES[activeView]}</h1>
          <p className="text-caption font-medium text-ink-subtle mt-0.5">{SUBTITLES[activeView]}</p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2.5">
        <Button
          variant="secondary"
          size="sm"
          onClick={onOpenAuditLogs}
          iconLeft={<Shield className="w-4 h-4 text-ink-subtle" />}
        >
          Audit Log
        </Button>

        {activeView === 'jobs' && (
          <Button
            variant="primary"
            size="sm"
            onClick={onOpenCreateJobModal}
            iconLeft={<Plus className="w-4 h-4 text-white" />}
          >
            Buat Lowongan
          </Button>
        )}

        {(activeView === 'dashboard' || activeView === 'candidates') && (
          <Button
            variant="primary"
            size="sm"
            onClick={onOpenUploadModal}
            iconLeft={<FileText className="w-4 h-4 text-white" />}
          >
            Unggah CV
          </Button>
        )}

        {activeView === 'settings' && onSaveSettings && (
          <Button
            variant="primary"
            size="sm"
            onClick={onSaveSettings}
            iconLeft={<Save className="w-4 h-4 text-white" />}
          >
            Simpan Pengaturan
          </Button>
        )}

        {activeView === 'docs' && (
          <Button
            variant="secondary"
            size="sm"
            onClick={handleCopySpec}
            iconLeft={copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4 text-ink-subtle" />}
          >
            {copied ? 'Tercopy!' : 'Salin Spec API'}
          </Button>
        )}
      </div>
    </header>
  );
};

