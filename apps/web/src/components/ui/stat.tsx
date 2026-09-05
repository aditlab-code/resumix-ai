'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from './card';

interface StatProps {
  label: string;
  value: React.ReactNode;
  hint?: React.ReactNode;
  onClick?: () => void;
  variant?: 'blue' | 'indigo' | 'amber' | 'red' | 'default';
  tone?: 'ink' | 'accent' | 'warn' | 'ok';
}

export const Stat: React.FC<StatProps> = ({ label, value, hint, onClick }) => {
  return (
    <Card
      onClick={onClick}
      className={cn(
        'transition-all duration-200 shadow-sm hover:shadow-md border-border bg-card text-card-foreground',
        onClick && 'cursor-pointer hover:border-primary/50'
      )}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-6">
        <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {label}
        </CardTitle>
        {hint && (
          <span className="text-xs font-medium text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
            {hint}
          </span>
        )}
      </CardHeader>
      <CardContent className="p-6 pt-0">
        <div className="text-3xl font-bold tracking-tight text-foreground tabular-nums">
          {value}
        </div>
      </CardContent>
    </Card>
  );
};

