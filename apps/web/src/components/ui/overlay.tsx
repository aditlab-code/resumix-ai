'use client';

import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from './button';

type OverlayVariant = 'center' | 'side';
type OverlaySize = 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl';

const centerSize: Record<OverlaySize, string> = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  '2xl': 'max-w-2xl',
  '3xl': 'max-w-3xl',
};

interface OverlayProps {
  isOpen: boolean;
  onClose: () => void;
  title: React.ReactNode;
  variant?: OverlayVariant;
  size?: OverlaySize;
  header?: React.ReactNode;
  footer?: React.ReactNode;
  children: React.ReactNode;
  bodyClassName?: string;
}

export const Overlay: React.FC<OverlayProps> = ({
  isOpen,
  onClose,
  title,
  variant = 'center',
  size = 'xl',
  header,
  footer,
  children,
  bodyClassName,
}) => {
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', onKey);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const isSide = variant === 'side';

  return (
    <div
      className={cn(
        'fixed inset-0 z-50 flex',
        isSide ? 'justify-end' : 'items-center justify-center p-4 overflow-y-auto'
      )}
    >
      <div className="fixed inset-0 bg-ink/40" onClick={onClose} />

      <div
        className={cn(
          'relative z-10 bg-surface flex flex-col',
          isSide
            ? 'h-full w-screen max-w-3xl'
            : cn('w-full my-8 rounded overflow-hidden max-h-[calc(100vh-4rem)]', centerSize[size])
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3 px-5 py-3 border-b border-line shrink-0">
          <div className="min-w-0">
            {typeof title === 'string' ? <h2 className="truncate">{title}</h2> : title}
            {header}
          </div>
          <button
            onClick={onClose}
            aria-label="Tutup"
            className="shrink-0 p-1 rounded text-ink-subtle hover:text-ink hover:bg-canvas transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className={cn('flex-1 overflow-y-auto bg-canvas px-5 py-4', bodyClassName)}>
          {children}
        </div>

        {footer && (
          <div className="flex items-center justify-end gap-2 px-5 py-3 border-t border-line shrink-0">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: React.ReactNode;
  confirmLabel?: string;
  tone?: 'primary' | 'danger';
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = 'Konfirmasi',
  tone = 'primary',
}) => (
  <Overlay
    isOpen={isOpen}
    onClose={onClose}
    title={title}
    size="sm"
    footer={
      <>
        <Button variant="ghost" size="sm" onClick={onClose}>
          Batal
        </Button>
        <Button
          variant={tone === 'danger' ? 'danger' : 'primary'}
          size="sm"
          onClick={() => {
            onConfirm();
            onClose();
          }}
        >
          {confirmLabel}
        </Button>
      </>
    }
  >
    <p className="text-xs text-ink-muted leading-relaxed">{message}</p>
  </Overlay>
);
