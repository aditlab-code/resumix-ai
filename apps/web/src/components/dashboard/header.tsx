'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { Plus, Shield, FileText, Save, Menu } from 'lucide-react';
import { Button } from '@/components/ui';
import { useAppData } from '@/context/app-data-context';

export type ActiveViewType = 'dashboard' | 'jobs' | 'candidates' | 'settings' | 'docs';

interface HeaderProps {
  onToggleMobileMenu?: () => void;
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
  onToggleMobileMenu,
  onSaveSettings,
}) => {
  const pathname = usePathname();
  const {
    setIsUploadModalOpen,
    setIsCreateJobModalOpen,
    setIsAuditLogModalOpen,
  } = useAppData();

  let activeView: ActiveViewType = 'dashboard';
  if (pathname.startsWith('/jobs')) activeView = 'jobs';
  else if (pathname.startsWith('/candidates')) activeView = 'candidates';
  else if (pathname.startsWith('/settings')) activeView = 'settings';
  else if (pathname.startsWith('/docs')) activeView = 'docs';

  return (
    <header className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-surface-raised border border-surface-border p-3.5 sm:p-5 rounded-md shadow-e1 sticky top-0 z-20">
      <div className="flex items-center justify-between md:justify-start gap-3 w-full md:w-auto">
        <div className="flex items-center gap-2.5 min-w-0">
          {onToggleMobileMenu && (
            <button
              type="button"
              onClick={onToggleMobileMenu}
              className="md:hidden p-2 rounded-md border border-surface-border text-ink-default hover:bg-surface-hover focus-ring shrink-0"
              aria-label="Buka Menu Sidebar"
            >
              <Menu className="w-5 h-5" />
            </button>
          )}

          {/* Mobile Brand Badge */}
          <div className="flex md:hidden items-center gap-2 shrink-0">
            <div className="w-7 h-7 rounded bg-blue-600 text-white flex items-center justify-center font-bold text-sm shadow-e1">
              R
            </div>
          </div>

          <div className="min-w-0">
            <h1 className="text-body font-bold md:text-h1 text-ink-default tracking-tight truncate">
              {TITLES[activeView]}
            </h1>
            <p className="hidden md:block text-caption font-medium text-ink-subtle mt-0.5">
              {SUBTITLES[activeView]}
            </p>
          </div>
        </div>

        {/* Mobile Action Button */}
        <div className="flex items-center gap-2 md:hidden shrink-0">
          {activeView === 'settings' && (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setIsAuditLogModalOpen(true)}
              iconLeft={<Shield className="w-4 h-4 text-ink-subtle" />}
            >
              Audit
            </Button>
          )}

          {activeView === 'jobs' && (
            <Button
              variant="primary"
              size="sm"
              onClick={() => setIsCreateJobModalOpen(true)}
              iconLeft={<Plus className="w-4 h-4 text-white" />}
            >
              Buat
            </Button>
          )}

          {(activeView === 'dashboard' || activeView === 'candidates') && (
            <Button
              variant="primary"
              size="sm"
              onClick={() => setIsUploadModalOpen(true)}
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
              Simpan
            </Button>
          )}
        </div>
      </div>

      {/* Desktop Action Buttons */}
      <div className="hidden md:flex flex-wrap items-center gap-2.5">
        {activeView === 'settings' && (
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setIsAuditLogModalOpen(true)}
            iconLeft={<Shield className="w-4 h-4 text-ink-subtle" />}
          >
            Audit Log
          </Button>
        )}

        {activeView === 'jobs' && (
          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsCreateJobModalOpen(true)}
            iconLeft={<Plus className="w-4 h-4 text-white" />}
          >
            Buat Lowongan
          </Button>
        )}

        {(activeView === 'dashboard' || activeView === 'candidates') && (
          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsUploadModalOpen(true)}
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
      </div>
    </header>
  );
};
