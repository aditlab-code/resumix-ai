'use client';

import React from 'react';
import { ActiveViewType } from './header';
import { LayoutDashboard, Briefcase, Users, Sliders, RotateCcw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui';

interface SidebarProps {
  activeView: ActiveViewType;
  onViewChange: (view: ActiveViewType) => void;
  onResetData?: () => void;
}

const NAV: { id: ActiveViewType; label: string; icon: typeof LayoutDashboard }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'jobs', label: 'Lowongan', icon: Briefcase },
  { id: 'candidates', label: 'Kandidat', icon: Users },
  { id: 'settings', label: 'Pengaturan', icon: Sliders },
];

export const Sidebar: React.FC<SidebarProps> = ({ activeView, onViewChange, onResetData }) => (
  <aside className="w-56 bg-surface border-r border-line h-screen sticky top-0 flex flex-col justify-between shrink-0">
    <div>
      <div className="px-4 h-14 flex items-center gap-2.5 border-b border-line">
        <div className="w-7 h-7 rounded bg-accent text-accent-fg flex items-center justify-center font-black text-sm">
          A
        </div>
        <span className="font-extrabold text-sm tracking-tight text-ink">CV ATS</span>
      </div>

      <nav className="p-2 space-y-0.5">
        {NAV.map((item) => {
          const Icon = item.icon;
          const isActive = activeView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onViewChange(item.id)}
              className={cn(
                'w-full px-3 py-2 rounded text-xs font-bold flex items-center gap-2.5 transition-colors',
                isActive
                  ? 'bg-accent-soft text-accent'
                  : 'text-ink-muted hover:bg-canvas hover:text-ink'
              )}
            >
              <Icon className="w-4 h-4" />
              {item.label}
            </button>
          );
        })}
      </nav>
    </div>

    {onResetData && (
      <div className="p-2 border-t border-line">
        <Button
          variant="ghost"
          size="sm"
          onClick={onResetData}
          iconLeft={<RotateCcw className="w-3.5 h-3.5" />}
          className="w-full justify-start"
        >
          Reset Demo Data
        </Button>
      </div>
    )}
  </aside>
);
