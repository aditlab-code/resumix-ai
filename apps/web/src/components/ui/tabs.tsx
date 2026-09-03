'use client';

import React from 'react';
import { cn } from '@/lib/utils';

export interface TabItem {
  key: string;
  label: React.ReactNode;
}

interface TabsProps {
  items: TabItem[];
  active: string;
  onChange: (key: string) => void;
  className?: string;
}

export const Tabs: React.FC<TabsProps> = ({ items, active, onChange, className }) => (
  <div className={cn('flex gap-4 border-b border-line', className)}>
    {items.map((item) => (
      <button
        key={item.key}
        onClick={() => onChange(item.key)}
        className={cn(
          'py-2.5 text-xs font-bold border-b-2 -mb-px transition-colors',
          active === item.key
            ? 'border-accent text-accent'
            : 'border-transparent text-ink-muted hover:text-ink'
        )}
      >
        {item.label}
      </button>
    ))}
  </div>
);
