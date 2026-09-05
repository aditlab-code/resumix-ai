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
        'flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-1',
        className
      )}
    >
      <div className="inline-flex h-11 items-center justify-center rounded-xl bg-muted/60 p-1 text-muted-foreground self-start sm:self-auto overflow-x-auto no-scrollbar shadow-sm border border-border">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onTabChange(tab.id)}
              className={cn(
                'inline-flex items-center justify-center whitespace-nowrap rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-all focus-visible:outline-none outline-none select-none gap-2',
                isActive
                  ? 'bg-primary text-primary-foreground shadow-sm font-bold'
                  : 'text-muted-foreground hover:text-foreground hover:bg-background/60'
              )}
            >
              {Icon && <Icon className="w-3.5 h-3.5 shrink-0" />}
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>
      {extraRightContent && <div className="flex items-center gap-2 shrink-0">{extraRightContent}</div>}
    </div>
  );
}
