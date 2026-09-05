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
        'flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-surface-border pb-0 overflow-y-hidden',
        className
      )}
    >
      <div className="flex items-center gap-6 overflow-x-auto overflow-y-hidden no-scrollbar py-0.5">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={cn(
                'py-2 px-1 text-body font-semibold flex items-center gap-2 transition-all duration-base whitespace-nowrap border-b-2 focus-ring',
                isActive
                  ? 'border-brand-accent text-ink-brand font-bold'
                  : 'border-transparent text-ink-subtle hover:text-ink-default'
              )}
            >
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
      {extraRightContent && <div className="flex items-center gap-2 shrink-0 pb-2">{extraRightContent}</div>}
    </div>
  );
}
