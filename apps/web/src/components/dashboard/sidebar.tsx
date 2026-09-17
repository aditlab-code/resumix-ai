'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Briefcase, Users, Sliders, BookOpen, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

const NAV = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/jobs', label: 'Available Jobs', icon: Briefcase },
  { href: '/candidates', label: 'Candidates List', icon: Users },
  { href: '/settings', label: 'Settings', icon: Sliders },
  { href: '/docs', label: 'Documentation', icon: BookOpen },
];

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen = false,
  onClose,
}) => {
  const pathname = usePathname();

  const isLinkActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  const SidebarContent = (
    <div className="flex flex-col h-full justify-between">
      <div>
        {/* Brand Header */}
        <div className="px-5 h-16 flex items-center justify-between border-b border-slate-800 bg-ink-default/90">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-md bg-blue-600 text-white flex items-center justify-center font-bold text-base shadow-e1">
              R
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-body tracking-tight text-white">Resumix AI</span>
              <span className="text-[10px] font-medium text-slate-400 uppercase tracking-widest">Enterprise ATS</span>
            </div>
          </Link>
          {onClose && (
            <button
              onClick={onClose}
              className="md:hidden p-1.5 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              aria-label="Close Menu"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Navigation Links */}
        <nav className="p-3 space-y-1.5">
          {NAV.map((item) => {
            const Icon = item.icon;
            const isActive = isLinkActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={cn(
                  'w-full px-3.5 py-2.5 rounded-md text-body font-semibold flex items-center gap-3 focus-ring transition-colors duration-120',
                  isActive
                    ? 'bg-blue-600 text-white shadow-e1 font-bold'
                    : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                )}
              >
                <Icon className={cn('w-4 h-4', isActive ? 'text-white' : 'text-slate-400')} />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer Credentials & Copyright */}
      <div className="p-4 border-t border-slate-800 text-xs text-slate-400 space-y-1">
        <div>© {new Date().getFullYear()} Resumix AI</div>
        <div>
          Created by{' '}
          <a
            href={process.env.NEXT_PUBLIC_PORTFOLIO_URL || '#'}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-400 hover:text-blue-300 font-medium transition-colors duration-120 hover:underline"
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
            className="fixed inset-0 bg-black/50 transition-opacity"
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
