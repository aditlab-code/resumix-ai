'use client';

import React from 'react';
import { Button } from './button';

interface EmptyStateProps {
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  actionLabel,
  onAction,
}) => (
  <div className="flex flex-col items-center justify-center gap-3 bg-surface border border-line rounded py-12 px-4 text-center">
    <h3>{title}</h3>
    {description && <p className="text-xs text-ink-muted max-w-sm">{description}</p>}
    {actionLabel && onAction && (
      <Button size="sm" onClick={onAction}>
        {actionLabel}
      </Button>
    )}
  </div>
);
