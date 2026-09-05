'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { Label } from './label';
import { Input as ShadcnInput } from './input';
import { Textarea as ShadcnTextarea } from './textarea';
import { ChevronDown } from 'lucide-react';

interface FieldProps {
  label?: React.ReactNode;
  htmlFor?: string;
  required?: boolean;
  hint?: React.ReactNode;
  className?: string;
  children: React.ReactNode;
}

export const Field: React.FC<FieldProps> = ({ label, htmlFor, required, hint, className, children }) => (
  <div className={cn('flex flex-col space-y-1.5', className)}>
    {label && (
      <Label htmlFor={htmlFor} className="flex items-center gap-1 mb-1.5 font-medium text-sm text-foreground">
        {label}
        {required && <span className="text-destructive font-bold ml-0.5">*</span>}
      </Label>
    )}
    {children}
    {hint && <p className="text-xs text-muted-foreground leading-snug mt-1">{hint}</p>}
  </div>
);


export const Input = ShadcnInput;
export const Textarea = ShadcnTextarea;

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  containerClassName?: string;
  sizeVariant?: 'sm' | 'md' | 'lg';
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, containerClassName, sizeVariant = 'md', children, ...props }, ref) => {
    const isAutoOrFit =
      className?.includes('w-auto') || className?.includes('w-fit') || containerClassName?.includes('w-auto') || containerClassName?.includes('w-fit');

    const sizeClasses = {
      sm: 'h-8 text-xs px-2.5 pr-7 font-semibold',
      md: 'h-9 text-xs px-3 pr-8 font-semibold',
      lg: 'h-10 text-sm px-3 pr-9 font-medium',
    }[sizeVariant];

    const iconSize = {
      sm: 'h-3.5 w-3.5 right-2',
      md: 'h-3.5 w-3.5 right-2.5',
      lg: 'h-4 w-4 right-3',
    }[sizeVariant];

    return (
      <div
        className={cn(
          'relative items-center shrink-0',
          isAutoOrFit ? 'inline-flex w-auto' : 'flex w-full',
          containerClassName
        )}
      >
        <select
          ref={ref}
          className={cn(
            'flex rounded-md border border-input bg-background text-foreground ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer appearance-none w-full shadow-xs [&>option]:bg-background [&>option]:text-foreground',
            sizeClasses,
            className
          )}
          {...props}
        >
          {children}
        </select>
        <ChevronDown
          className={cn(
            'absolute top-1/2 -translate-y-1/2 opacity-50 pointer-events-none text-foreground shrink-0',
            iconSize
          )}
        />
      </div>
    );
  }
);
Select.displayName = 'Select';

interface RangeFieldProps {
  label: React.ReactNode;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  hint?: React.ReactNode;
}

export const RangeField: React.FC<RangeFieldProps> = ({
  label,
  value,
  onChange,
  min = 0,
  max = 100,
  hint,
}) => (
  <div className="space-y-2 bg-muted/40 rounded-xl p-3.5 border border-border">
    <div className="flex justify-between text-xs font-bold">
      <span className="text-foreground">{label}</span>
      <span className="font-mono text-primary">{value}%</span>
    </div>
    <input
      type="range"
      min={min}
      max={max}
      value={value}
      onChange={(e) => onChange(Number(e.target.value))}
      className="w-full accent-primary cursor-pointer"
    />
    {hint && <p className="text-xs text-muted-foreground leading-snug">{hint}</p>}
  </div>
);

