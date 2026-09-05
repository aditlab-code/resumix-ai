'use client';

import * as React from 'react';
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
  <div className="flex flex-col items-center justify-center gap-3 bg-card border border-border rounded-xl py-12 px-6 text-center shadow-sm">
    {icon && <div className="p-3.5 bg-primary/10 rounded-full text-primary">{icon}</div>}
    <h3 className="text-sm font-bold text-foreground">{title}</h3>
    {description && <p className="text-xs text-muted-foreground max-w-md leading-relaxed">{description}</p>}
    {actionLabel && onAction && (
      <Button size="sm" onClick={onAction} className="mt-1">
        {actionLabel}
      </Button>
    )}
  </div>
);

