'use client';

import React from 'react';
import { ActiveViewType } from './header';
import { LayoutDashboard, Briefcase, Users, Sliders, BookOpen } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SidebarProps {
  activeView: ActiveViewType;
  onViewChange: (view: ActiveViewType) => void;
}

const NAV: { id: ActiveViewType; label: string; icon: typeof LayoutDashboard }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'jobs', label: 'Lowongan', icon: Briefcase },
  { id: 'candidates', label: 'Kandidat', icon: Users },
  { id: 'settings', label: 'Pengaturan', icon: Sliders },
  { id: 'docs', label: 'Dokumentasi', icon: BookOpen },
];

export const Sidebar: React.FC<SidebarProps> = ({ activeView, onViewChange }) => (
  <aside className="w-[264px] bg-ink-default border-r border-slate-800 h-screen sticky top-0 flex flex-col justify-between shrink-0 shadow-e2 text-white">
    <div>
      {/* Brand Header */}
      <div className="px-5 h-16 flex items-center gap-3 border-b border-slate-800 bg-ink-default/90">
        <div className="w-8 h-8 rounded-md bg-blue-600 text-white flex items-center justify-center font-bold text-base shadow-e1">
          R
        </div>
        <div className="flex flex-col">
          <span className="font-bold text-body tracking-tight text-white">Resumix AI</span>
          <span className="text-[10px] font-medium text-slate-400 uppercase tracking-widest">Enterprise ATS</span>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="p-3 space-y-1.5">
        {NAV.map((item) => {
          const Icon = item.icon;
          const isActive = activeView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onViewChange(item.id)}
              className={cn(
                'w-full px-3.5 py-2.5 rounded-md text-body font-semibold flex items-center gap-3 focus-ring',
                isActive
                  ? 'bg-blue-600 text-white shadow-e1 font-bold'
                  : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
              )}
            >
              <Icon className={cn('w-4 h-4', isActive ? 'text-white' : 'text-slate-400')} />
              {item.label}
            </button>
          );
        })}
      </nav>
    </div>

    {/* Footer Credentials & Copyright */}
    <div className="p-4 border-t border-slate-800 text-xs text-slate-400 space-y-1">
      <div>© 2026 Resumix AI</div>
      <div>
        Created by{' '}
        <a
          href="https://pradityawicaksono.com"
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-400 hover:text-blue-300 font-medium transition-colors hover:underline"
        >
          Adit
        </a>
      </div>
    </div>
  </aside>
);
