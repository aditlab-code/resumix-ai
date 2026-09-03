'use client';

import React, { useEffect } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export type ToastType = 'success' | 'error' | 'info';

export interface ToastMessage {
  id: string;
  type: ToastType;
  title: string;
  description?: string;
}

interface ToastContainerProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

const ICONS: Record<ToastType, React.ReactNode> = {
  success: <CheckCircle2 className="w-4 h-4 text-ok shrink-0" />,
  error: <AlertCircle className="w-4 h-4 text-danger shrink-0" />,
  info: <Info className="w-4 h-4 text-accent shrink-0" />,
};

export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onDismiss }) => (
  <div className="fixed bottom-4 right-4 z-[60] flex flex-col gap-2 max-w-sm pointer-events-none">
    {toasts.map((toast) => (
      <ToastItem key={toast.id} toast={toast} onDismiss={onDismiss} />
    ))}
  </div>
);

const ToastItem: React.FC<{ toast: ToastMessage; onDismiss: (id: string) => void }> = ({
  toast,
  onDismiss,
}) => {
  useEffect(() => {
    const timer = setTimeout(() => onDismiss(toast.id), 5000);
    return () => clearTimeout(timer);
  }, [toast.id, onDismiss]);

  return (
    <div
      className={cn(
        'pointer-events-auto flex items-start gap-2.5 p-3 rounded bg-surface border border-line'
      )}
    >
      {ICONS[toast.type]}
      <div className="flex-1 min-w-0">
        <h5 className="text-xs font-bold text-ink">{toast.title}</h5>
        {toast.description && (
          <p className="text-[11px] text-ink-muted mt-0.5 leading-snug">{toast.description}</p>
        )}
      </div>
      <button
        onClick={() => onDismiss(toast.id)}
        className="text-ink-subtle hover:text-ink transition-colors shrink-0"
        aria-label="Tutup"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};
