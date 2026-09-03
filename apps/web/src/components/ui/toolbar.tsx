'use client';

import React from 'react';
import { Search } from 'lucide-react';
import { cn } from '@/lib/utils';

export const Toolbar: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className,
  children,
  ...props
}) => (
  <div
    className={cn(
      'flex flex-col sm:flex-row sm:items-center gap-2 bg-surface rounded p-2',
      className
    )}
    {...props}
  >
    {children}
  </div>
);

interface SearchInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  wrapperClassName?: string;
}

export const SearchInput: React.FC<SearchInputProps> = ({
  className,
  wrapperClassName,
  ...props
}) => (
  <div className={cn('relative w-full sm:w-64', wrapperClassName)}>
    <Search className="w-4 h-4 text-ink-subtle absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
    <input
      type="text"
      className={cn(
        'w-full rounded bg-canvas pl-8 pr-3 py-2 text-xs text-ink placeholder:text-ink-subtle border border-line focus:border-accent transition-colors',
        className
      )}
      {...props}
    />
  </div>
);

export const FilterSelect: React.FC<React.SelectHTMLAttributes<HTMLSelectElement>> = ({
  className,
  children,
  ...props
}) => (
  <select
    className={cn(
      'rounded bg-canvas px-2.5 py-2 text-xs font-semibold text-ink-muted border border-line focus:border-accent cursor-pointer transition-colors',
      className
    )}
    {...props}
  >
    {children}
  </select>
);
