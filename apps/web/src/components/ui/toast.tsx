'use client';

import * as React from 'react';
import { toast as sonnerToast } from 'sonner';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export type ToastType = 'success' | 'error' | 'info';

export interface ToastMessage {
  id: string;
  type: ToastType;
  title: string;
  description?: string;
}

export const toast = {
  success: (title: string, description?: string) =>
    sonnerToast.success(title, { description }),
  error: (title: string, description?: string) =>
    sonnerToast.error(title, { description }),
  info: (title: string, description?: string) =>
    sonnerToast.info(title, { description }),
  custom: sonnerToast,
};

interface ToastContainerProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

const ICONS: Record<ToastType, React.ReactNode> = {
  success: <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />,
  error: <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />,
  info: <Info className="w-4 h-4 text-blue-600 shrink-0" />,
};

export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onDismiss }) => (
  <div className="fixed bottom-4 right-4 z-[60] flex flex-col gap-2 max-w-sm pointer-events-none">
    {toasts.map((t) => (
      <ToastItem key={t.id} toast={t} onDismiss={onDismiss} />
    ))}
  </div>
);

const ToastItem: React.FC<{ toast: ToastMessage; onDismiss: (id: string) => void }> = ({
  toast,
  onDismiss,
}) => {
  React.useEffect(() => {
    const timer = setTimeout(() => onDismiss(toast.id), 5000);
    return () => clearTimeout(timer);
  }, [toast.id, onDismiss]);

  return (
    <div
      className={cn(
        'pointer-events-auto flex items-start gap-2.5 p-3 rounded-lg bg-surface-raised border border-surface-border shadow-e2'
      )}
    >
      {ICONS[toast.type]}
      <div className="flex-1 min-w-0">
        <h5 className="text-xs font-bold text-ink-default">{toast.title}</h5>
        {toast.description && (
          <p className="text-[11px] text-ink-subtle mt-0.5 leading-snug">{toast.description}</p>
        )}
      </div>
      <button
        onClick={() => onDismiss(toast.id)}
        className="text-ink-subtle hover:text-ink-default transition-colors shrink-0"
        aria-label="Close"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};

