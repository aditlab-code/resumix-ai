'use client';

import * as React from 'react';
import { Search, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Input } from './input';

import { Select, SelectProps } from './field';

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

export type FilterSelectProps = SelectProps;

export const FilterSelect = React.forwardRef<HTMLSelectElement, FilterSelectProps>(
  ({ className, containerClassName, sizeVariant = 'sm', children, ...props }, ref) => (
    <Select
      ref={ref}
      sizeVariant={sizeVariant}
      containerClassName={cn('inline-flex w-auto shrink-0', containerClassName)}
      className={cn('bg-background font-semibold', className)}
      {...props}
    >
      {children}
    </Select>
  )
);
FilterSelect.displayName = 'FilterSelect';

