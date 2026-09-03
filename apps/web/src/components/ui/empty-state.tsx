'use client';

import React from 'react';
import { Button } from './button';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  actionLabel,
  onAction,
}) => (
  <div className="flex flex-col items-center justify-center gap-3 bg-surface border border-line rounded-xl py-12 px-6 text-center shadow-2xs">
    {icon && <div className="p-3 bg-accent-soft rounded-full text-accent">{icon}</div>}
    <h3 className="text-sm font-bold text-ink">{title}</h3>
    {description && <p className="text-xs text-ink-muted max-w-md leading-relaxed">{description}</p>}
    {actionLabel && onAction && (
      <Button size="sm" onClick={onAction} className="mt-1">
        {actionLabel}
      </Button>
    )}
  </div>
);
