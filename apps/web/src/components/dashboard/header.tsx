'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { Menu } from 'lucide-react';
import { Button } from '@/components/ui';
import { useAppData } from '@/context/app-data-context';

export type ActiveViewType = 'dashboard' | 'jobs' | 'candidates' | 'settings' | 'docs';

interface HeaderProps {
  onToggleMobileMenu?: () => void;
  onSaveSettings?: () => void;
}

const TITLES: Record<ActiveViewType, string> = {
  dashboard: 'Dashboard Overview',
  jobs: 'Manage Job Available Positions',
  candidates: 'Candidate List & Evaluation',
  settings: 'Settings & Configuration',
  docs: 'Documentation & Guides',
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
    <header className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-surface-raised border border-surface-border p-3.5 sm:p-4 rounded-md shadow-e1 sticky top-0 z-20">
      <div className="flex items-center justify-between md:justify-start gap-3 w-full md:w-auto">
        <div className="flex items-center gap-2.5 min-w-0">
          {onToggleMobileMenu && (
            <button
              type="button"
              onClick={onToggleMobileMenu}
              className="md:hidden p-2 rounded-md border border-surface-border text-ink-default hover:bg-surface-hover focus-ring shrink-0"
              aria-label="Open Sidebar Menu"
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
            <h1 className="text-h2 font-extrabold md:text-h1 text-ink-default tracking-tight truncate">
              {TITLES[activeView]}
            </h1>
          </div>
        </div>

        {/* Mobile Action Buttons */}
        <div className="flex items-center gap-2 md:hidden shrink-0">
          {activeView === 'settings' && (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setIsAuditLogModalOpen(true)}
            >
              Audit
            </Button>
          )}

          {activeView === 'jobs' && (
            <Button
              variant="primary"
              size="sm"
              onClick={() => setIsCreateJobModalOpen(true)}
            >
              Post
            </Button>
          )}

          {(activeView === 'dashboard' || activeView === 'candidates') && (
            <Button
              variant="primary"
              size="sm"
              onClick={() => setIsUploadModalOpen(true)}
            >
              Upload CV
            </Button>
          )}

          {activeView === 'settings' && onSaveSettings && (
            <Button
              variant="primary"
              size="sm"
              onClick={onSaveSettings}
            >
              Save
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
          >
            Audit Log
          </Button>
        )}

        {activeView === 'jobs' && (
          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsCreateJobModalOpen(true)}
          >
            Post Job
          </Button>
        )}

        {(activeView === 'dashboard' || activeView === 'candidates') && (
          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsUploadModalOpen(true)}
          >
            Upload CV
          </Button>
        )}

        {activeView === 'settings' && onSaveSettings && (
          <Button
            variant="primary"
            size="sm"
            onClick={onSaveSettings}
          >
            Save Settings
          </Button>
        )}
      </div>
    </header>
  );
};
