'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

export interface TabItem<T extends string = string> {
  id: T;
  label: string;
  count?: number;
  icon?: LucideIcon;
}

interface SubNavTabProps<T extends string = string> {
  tabs: TabItem<T>[];
  activeTab: T;
  onTabChange: (tabId: T) => void;
  className?: string;
  extraRightContent?: React.ReactNode;
}

export function SubNavTab<T extends string = string>({
  tabs,
  activeTab,
  onTabChange,
  className,
  extraRightContent,
}: SubNavTabProps<T>) {
  return (
    <div
      className={cn(
        'flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-surface-sunken p-1.5 rounded-md border border-surface-border',
        className
      )}
    >
      <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={cn(
                'px-4 py-2 rounded-md text-caption font-semibold flex items-center gap-2 transition-all duration-base whitespace-nowrap focus-ring',
                isActive
                  ? 'bg-surface-raised text-ink-brand shadow-e1 font-bold border border-surface-border_strong'
                  : 'text-ink-subtle hover:text-ink-default hover:bg-surface-hover'
              )}
            >
              {Icon && <Icon className={cn('w-4 h-4', isActive ? 'text-brand-accent' : 'text-ink-faint')} />}
              <span>{tab.label}</span>
              {typeof tab.count === 'number' && (
                <span
                  className={cn(
                    'px-2 py-0.5 rounded-pill text-[11px] font-bold',
                    isActive ? 'bg-brand-accent_soft text-brand-accent' : 'bg-surface-border text-ink-subtle'
                  )}
                >
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>
      {extraRightContent && <div className="flex items-center gap-2 shrink-0 px-1">{extraRightContent}</div>}
    </div>
  );
}
