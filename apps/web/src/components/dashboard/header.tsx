'use client';

import React from 'react';
import { Plus, Shield, FileText, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui';

export type ActiveViewType = 'dashboard' | 'jobs' | 'candidates' | 'settings' | 'docs';

interface HeaderProps {
  activeView: ActiveViewType;
  onOpenUploadModal: () => void;
  onOpenCreateJobModal: () => void;
  onOpenAuditLogs: () => void;
  onOpenSkillTaxonomyModal?: () => void;
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
  onOpenSkillTaxonomyModal,
}) => (
  <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-surface border border-slate-300 p-4 rounded-lg shadow-2xs">
    <div className="flex items-center gap-3">
      <div className="w-1.5 h-6 bg-accent rounded-full hidden sm:block"></div>
      <div>
        <h1 className="text-base font-black tracking-tight text-slate-900">{TITLES[activeView]}</h1>
        <p className="text-[11px] font-medium text-slate-600">Resumix AI Enterprise Candidate Intelligence</p>
      </div>
    </div>

    <div className="flex flex-wrap items-center gap-2">
      {onOpenSkillTaxonomyModal && (
        <Button
          variant="secondary"
          size="sm"
          onClick={onOpenSkillTaxonomyModal}
          iconLeft={<BookOpen className="w-3.5 h-3.5 text-slate-700" />}
        >
          Taksonomi Skill
        </Button>
      )}
      <Button
        variant="secondary"
        size="sm"
        onClick={onOpenAuditLogs}
        iconLeft={<Shield className="w-3.5 h-3.5 text-slate-700" />}
      >
        Audit Log
      </Button>
      <Button
        variant="secondary"
        size="sm"
        onClick={onOpenCreateJobModal}
        iconLeft={<Plus className="w-3.5 h-3.5 text-slate-700" />}
      >
        Lowongan
      </Button>
      <Button
        variant="primary"
        size="sm"
        onClick={onOpenUploadModal}
        iconLeft={<FileText className="w-3.5 h-3.5" />}
      >
        Unggah CV
      </Button>
    </div>
  </header>
);
