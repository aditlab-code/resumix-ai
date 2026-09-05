'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { Label } from './label';
import { Input as ShadcnInput } from './input';
import { Textarea as ShadcnTextarea } from './textarea';

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
  <select
    ref={ref}
    className={cn(
      'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer font-medium appearance-none bg-[url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2216%22%20height%3D%2216%22%20viewBox%3D%220%200%2024%2024%20fill%3D%22none%22%20stroke%3D%22currentColor%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E")] bg-[length:0.875rem_0.875rem] bg-[right_0.75rem_center] bg-no-repeat pr-8',
      className
    )}
    {...props}
  >
    {children}
  </select>
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

