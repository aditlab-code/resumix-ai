'use client';

import React from 'react';
import { Plus, Shield, FileText } from 'lucide-react';
import { Button } from '@/components/ui';

export type ActiveViewType = 'dashboard' | 'jobs' | 'candidates' | 'settings';

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
};

export const Header: React.FC<HeaderProps> = ({
  activeView,
  onOpenUploadModal,
  onOpenCreateJobModal,
  onOpenAuditLogs,
}) => (
  <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
    <h1>{TITLES[activeView]}</h1>

    <div className="flex flex-wrap items-center gap-2">
      <Button
        variant="secondary"
        size="sm"
        onClick={onOpenAuditLogs}
        iconLeft={<Shield className="w-3.5 h-3.5" />}
      >
        Audit Log
      </Button>
      <Button
        variant="secondary"
        size="sm"
        onClick={onOpenCreateJobModal}
        iconLeft={<Plus className="w-3.5 h-3.5" />}
      >
        Lowongan
      </Button>
      <Button
        size="sm"
        onClick={onOpenUploadModal}
        iconLeft={<FileText className="w-3.5 h-3.5" />}
      >
        Unggah CV
      </Button>
    </div>
  </header>
);
