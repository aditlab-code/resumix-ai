'use client';

import React from 'react';
import { ActiveViewType } from './header';
import { LayoutDashboard, Briefcase, Users, Sliders, BookOpen, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SidebarProps {
  activeView: ActiveViewType;
  onViewChange: (view: ActiveViewType) => void;
  isOpen?: boolean;
  onClose?: () => void;
}

const NAV: { id: ActiveViewType; label: string; icon: typeof LayoutDashboard }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'jobs', label: 'Lowongan', icon: Briefcase },
  { id: 'candidates', label: 'Kandidat', icon: Users },
  { id: 'settings', label: 'Pengaturan', icon: Sliders },
  { id: 'docs', label: 'Dokumentasi', icon: BookOpen },
];

export const Sidebar: React.FC<SidebarProps> = ({
  activeView,
  onViewChange,
  isOpen = false,
  onClose,
}) => {
  const handleNavClick = (view: ActiveViewType) => {
    onViewChange(view);
    if (onClose) onClose();
  };

  const SidebarContent = (
    <div className="flex flex-col h-full justify-between">
      <div>
        {/* Brand Header */}
        <div className="px-5 h-16 flex items-center justify-between border-b border-slate-800 bg-ink-default/90">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-md bg-blue-600 text-white flex items-center justify-center font-bold text-base shadow-e1">
              R
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-body tracking-tight text-white">Resumix AI</span>
              <span className="text-[10px] font-medium text-slate-400 uppercase tracking-widest">Enterprise ATS</span>
            </div>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="md:hidden p-1.5 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              aria-label="Tutup Menu"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Navigation Links */}
        <nav className="p-3 space-y-1.5">
          {NAV.map((item) => {
            const Icon = item.icon;
            const isActive = activeView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
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
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar (Permanent) */}
      <aside className="hidden md:flex w-[264px] bg-ink-default border-r border-slate-800 h-screen sticky top-0 flex-col shrink-0 shadow-e2 text-white z-30">
        {SidebarContent}
      </aside>

      {/* Mobile Drawer (Slide-over) */}
      {isOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
            onClick={onClose}
          />
          {/* Drawer Panel */}
          <aside className="fixed inset-y-0 left-0 w-[264px] bg-ink-default text-white shadow-2xl z-50 flex flex-col border-r border-slate-800 animate-in slide-in-from-left duration-200">
            {SidebarContent}
          </aside>
        </div>
      )}
    </>
  );
};
