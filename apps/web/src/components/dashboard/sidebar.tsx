'use client';

import React from 'react';
import { ActiveViewType } from './header';
import {
  LayoutDashboard,
  Briefcase,
  Users,
  Sliders,
  RotateCcw,
  Sparkles,
} from 'lucide-react';

interface SidebarProps {
  activeView: ActiveViewType;
  onViewChange: (view: ActiveViewType) => void;
  onResetData?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeView,
  onViewChange,
  onResetData,
}) => {
  const navItems = [
    {
      id: 'dashboard' as ActiveViewType,
      label: 'Dashboard HR',
      icon: LayoutDashboard,
    },
    {
      id: 'jobs' as ActiveViewType,
      label: 'Lowongan Kerja',
      icon: Briefcase,
    },
    {
      id: 'candidates' as ActiveViewType,
      label: 'Database Kandidat',
      icon: Users,
    },
    {
      id: 'settings' as ActiveViewType,
      label: 'Pengaturan Pipeline',
      icon: Sliders,
    },
  ];

  return (
    <aside className="w-64 bg-slate-900 text-slate-100 h-screen sticky top-0 flex flex-col justify-between border-r border-slate-800 shrink-0">
      <div>
        {/* Brand Header */}
        <div className="p-5 border-b border-slate-800 flex items-center gap-3">
          <div
            onClick={() => onViewChange('dashboard')}
            className="w-9 h-9 rounded-lg bg-sky-600 text-white flex items-center justify-center font-black text-lg cursor-pointer"
          >
            A
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-base tracking-tight text-white">
                CV ATS <span className="text-sky-400 font-semibold">Pipeline</span>
              </span>
            </div>
            <span className="text-[9px] uppercase font-mono font-bold text-slate-400 bg-slate-800 px-1.5 py-0.5 rounded border border-slate-700 block w-max mt-0.5">
              Enterprise ERP
            </span>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="p-3 space-y-1">
          <div className="px-3 py-2 text-[10px] uppercase font-mono font-bold text-slate-400 tracking-wider">
            Modul Utama
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onViewChange(item.id)}
                className={`w-full px-3 py-2.5 rounded-lg text-xs font-bold transition flex items-center gap-3 ${
                  isActive
                    ? 'bg-sky-600 text-white'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer Utilities */}
      <div className="p-4 border-t border-slate-800 space-y-3">
        <div className="bg-slate-800/60 p-3 rounded-lg border border-slate-800 text-[11px] text-slate-300 space-y-1">
          <div className="font-bold text-slate-200 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-sky-400" /> AI Engine Status
          </div>
          <p className="text-[10px] text-slate-400 leading-tight">
            PyMuPDF + Groq Llama-3.1 8B Instant Ready
          </p>
        </div>

        {onResetData && (
          <button
            onClick={onResetData}
            className="w-full px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs rounded-lg border border-slate-700 transition flex items-center justify-center gap-2"
            title="Reset Database ke Sample Data Awal"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
            <span>Reset Demo Data</span>
          </button>
        )}

        <div className="text-[10px] text-center text-slate-400 font-mono">
          v1.2.0 • Decision Support Tool
        </div>
      </div>
    </aside>
  );
};
