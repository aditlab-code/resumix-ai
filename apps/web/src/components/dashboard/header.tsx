'use client';

import React from 'react';
import { Plus, Shield, FileText } from 'lucide-react';
import { Button } from '@/components/ui';

export type ActiveViewType = 'dashboard' | 'jobs' | 'candidates' | 'settings' | 'docs';

interface HeaderProps {
  activeView: ActiveViewType;
  onOpenUploadModal: () => void;
  onOpenCreateJobModal: () => void;
  onOpenAuditLogs: () => void;
}

const TITLES: Record<ActiveViewType, string> = {
  dashboard: 'Dashboard',
  jobs: 'Lowongan',
  candidates: 'Kandidat',
  settings: 'Pengaturan',
  docs: 'Dokumentasi Sistem',
};

export const Header: React.FC<HeaderProps> = ({
  activeView,
  onOpenUploadModal,
  onOpenCreateJobModal,
  onOpenAuditLogs,
}) => (
  <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-surface-raised border border-surface-border p-5 rounded-md shadow-e1">
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-1 hidden sm:flex shrink-0">
        <span className="w-2.5 h-2.5 rounded-full bg-brand-accent"></span>
        <span className="w-2.5 h-2.5 rounded-full bg-brand-accent/60"></span>
        <span className="w-2.5 h-2.5 rounded-full bg-brand-accent/30"></span>
      </div>
      <div>
        <h1 className="text-h1 font-bold text-ink-default tracking-tight">{TITLES[activeView]}</h1>
        <p className="text-caption font-medium text-ink-subtle mt-0.5">Resumix AI Enterprise Candidate Intelligence & Dual-Vector ATS</p>
      </div>
    </div>

    <div className="flex flex-wrap items-center gap-2.5">
      <Button
        variant="secondary"
        size="sm"
        onClick={onOpenAuditLogs}
        iconLeft={<Shield className="w-4 h-4 text-slate-700" />}
      >
        Audit Log
      </Button>
      <Button
        variant="secondary"
        size="sm"
        onClick={onOpenCreateJobModal}
        iconLeft={<Plus className="w-4 h-4 text-slate-700" />}
      >
        Lowongan
      </Button>
      <Button
        variant="primary"
        size="sm"
        onClick={onOpenUploadModal}
        iconLeft={<FileText className="w-4 h-4 text-white" />}
      >
        Unggah CV
      </Button>
    </div>
  </header>
);
