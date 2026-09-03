'use client';

import React from 'react';
import { cn } from '@/lib/utils';

const controlBase =
  'w-full rounded bg-surface px-3 py-2 text-xs text-ink placeholder:text-ink-subtle border border-line focus:border-accent transition-colors disabled:opacity-50';

interface FieldProps {
  label?: React.ReactNode;
  htmlFor?: string;
  required?: boolean;
  hint?: React.ReactNode;
  className?: string;
  children: React.ReactNode;
}

export const Field: React.FC<FieldProps> = ({ label, htmlFor, required, hint, className, children }) => (
  <div className={cn('space-y-1', className)}>
    {label && (
      <label htmlFor={htmlFor} className="block text-xs font-bold text-ink-muted">
        {label}
        {required && <span className="text-danger"> *</span>}
      </label>
    )}
    {children}
    {hint && <p className="text-xs text-ink-subtle leading-snug">{hint}</p>}
  </div>
);

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input ref={ref} className={cn(controlBase, className)} {...props} />
  )
);
Input.displayName = 'Input';

export const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...props }, ref) => (
  <textarea ref={ref} className={cn(controlBase, 'leading-relaxed', className)} {...props} />
));
Textarea.displayName = 'Textarea';

export const Select = React.forwardRef<
  HTMLSelectElement,
  React.SelectHTMLAttributes<HTMLSelectElement>
>(({ className, children, ...props }, ref) => (
  <select ref={ref} className={cn(controlBase, 'cursor-pointer font-semibold', className)} {...props}>
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
  <div className="space-y-1.5 bg-canvas rounded p-3">
    <div className="flex justify-between text-xs font-bold">
      <span className="text-ink">{label}</span>
      <span className="font-mono text-accent">{value}%</span>
    </div>
    <input
      type="range"
      min={min}
      max={max}
      value={value}
      onChange={(e) => onChange(Number(e.target.value))}
      className="w-full accent-accent cursor-pointer"
    />
    {hint && <p className="text-xs text-ink-subtle leading-snug">{hint}</p>}
  </div>
);
