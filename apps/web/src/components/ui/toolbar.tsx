'use client';

import * as React from 'react';
import { Search, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Input } from './input';

export const Toolbar: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className,
  children,
  ...props
}) => (
  <div
    className={cn('flex flex-col sm:flex-row sm:items-center gap-3', className)}
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
    <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none z-10" />
    <Input
      type="text"
      className={cn('pl-9 h-9 text-xs', className)}
      {...props}
    />
  </div>
);

export const FilterSelect = React.forwardRef<
  HTMLSelectElement,
  React.SelectHTMLAttributes<HTMLSelectElement>
>(({ className, children, ...props }, ref) => (
  <div className="relative inline-flex items-center shrink-0">
    <select
      ref={ref}
      className={cn(
        'flex h-9 w-full rounded-md border border-input bg-background pl-3 pr-8 py-1 text-xs font-semibold text-foreground ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer appearance-none',
        className
      )}
      {...props}
    >
      {children}
    </select>
    <ChevronDown className="h-3.5 w-3.5 absolute right-2.5 opacity-50 pointer-events-none text-foreground shrink-0" />
  </div>
));
FilterSelect.displayName = 'FilterSelect';

