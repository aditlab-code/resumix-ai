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

export const Select = React.forwardRef<
  HTMLSelectElement,
  React.SelectHTMLAttributes<HTMLSelectElement>
>(({ className, children, ...props }, ref) => (
  <div className="relative flex items-center w-full">
    <select
      ref={ref}
      className={cn(
        'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm font-medium text-foreground ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer appearance-none pr-9',
        className
      )}
      {...props}
    >
      {children}
    </select>
    <ChevronDown className="h-4 w-4 absolute right-3 opacity-50 pointer-events-none text-foreground shrink-0" />
  </div>
));
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

