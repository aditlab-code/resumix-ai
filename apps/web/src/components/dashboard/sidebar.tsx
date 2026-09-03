'use client';

import React from 'react';
import { ActiveViewType } from './header';
import { LayoutDashboard, Briefcase, Users, Sliders, BookOpen, RotateCcw } from 'lucide-react';
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
  { id: 'docs', label: 'Dokumentasi', icon: BookOpen },
];

export const Sidebar: React.FC<SidebarProps> = ({ activeView, onViewChange, onResetData }) => (
  <aside className="w-56 bg-slate-100/95 border-r border-slate-300 h-screen sticky top-0 flex flex-col justify-between shrink-0 shadow-2xs">
    <div>
      {/* Brand Header */}
      <div className="px-4 h-14 flex items-center gap-2.5 border-b border-slate-300 bg-slate-100/50">
        <div className="w-7 h-7 rounded bg-accent text-accent-fg flex items-center justify-center font-black text-sm shadow-2xs">
          R
        </div>
        <span className="font-black text-sm tracking-tight text-slate-900">Resumix AI</span>
      </div>

      {/* Navigation Links */}
      <nav className="p-2 space-y-1">
        {NAV.map((item) => {
          const Icon = item.icon;
          const isActive = activeView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onViewChange(item.id)}
              className={cn(
                'w-full px-3 py-2 rounded-r-md rounded-l-xs text-xs font-bold flex items-center gap-2.5 transition-all',
                isActive
                  ? 'bg-blue-100/90 text-accent border-l-4 border-accent shadow-2xs'
                  : 'text-slate-700 hover:bg-slate-200/80 hover:text-slate-900 font-semibold'
              )}
            >
              <Icon className={cn('w-4 h-4', isActive ? 'text-accent' : 'text-slate-600')} />
              {item.label}
            </button>
          );
        })}
      </nav>
    </div>

    {/* Reset Data Footer */}
    {onResetData && (
      <div className="p-2 border-t border-slate-300 bg-slate-100/50">
        <Button
          variant="ghost"
          size="sm"
          onClick={onResetData}
          iconLeft={<RotateCcw className="w-3.5 h-3.5 text-slate-600" />}
          className="w-full justify-start text-slate-700 hover:bg-slate-200/80 hover:text-slate-900"
        >
          Reset Demo Data
        </Button>
      </div>
    )}
  </aside>
);
