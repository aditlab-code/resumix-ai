'use client';

import * as React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './dialog';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from './sheet';
import { Button } from './button';
import { cn } from '@/lib/utils';

type OverlayVariant = 'center' | 'side';
type OverlaySize = 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl';

const centerSizeClass: Record<OverlaySize, string> = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  '2xl': 'max-w-2xl',
  '3xl': 'max-w-3xl',
};

const FOCUSABLE_SELECTOR =
  'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"]):not([disabled])';

interface OverlayProps {
  isOpen: boolean;
  onClose: () => void;
  title: React.ReactNode;
  variant?: OverlayVariant;
  size?: OverlaySize;
  header?: React.ReactNode;
  subheader?: React.ReactNode;
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
  subheader,
  footer,
  children,
  bodyClassName,
}) => {
  const contentRef = React.useRef<HTMLDivElement>(null);

  const getFocusableElements = React.useCallback(() => {
    if (!contentRef.current) return [];
    return Array.from(contentRef.current.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR));
  }, []);

  React.useEffect(() => {
    if (!isOpen) return;

    const timer = setTimeout(() => {
      const focusableEls = getFocusableElements();
      if (focusableEls.length > 0) {
        focusableEls[0].focus();
      }
    }, 50);

    return () => clearTimeout(timer);
  }, [isOpen, getFocusableElements]);

  React.useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
        return;
      }

      if (e.key !== 'Tab') return;

      const focusableEls = getFocusableElements();
      if (focusableEls.length === 0) return;

      const firstEl = focusableEls[0];
      const lastEl = focusableEls[focusableEls.length - 1];

      if (e.shiftKey) {
        if (document.activeElement === firstEl) {
          e.preventDefault();
          lastEl.focus();
        }
      } else {
        if (document.activeElement === lastEl) {
          e.preventDefault();
          firstEl.focus();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, getFocusableElements]);

  if (variant === 'side') {
    return (
      <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <SheetContent side="right" className="flex flex-col p-0 gap-0 w-full sm:max-w-3xl lg:max-w-5xl xl:max-w-6xl shadow-2xl border-l border-border bg-background">
          <SheetHeader className="px-4 sm:px-8 pt-5 sm:pt-7 pb-4 sm:pb-5 border-b border-border bg-background shrink-0 text-left pr-14 sm:pr-16">
            {typeof title === 'string' ? (
              <SheetTitle className="text-lg font-bold text-foreground truncate">{title}</SheetTitle>
            ) : (
              title
            )}
            {header}
          </SheetHeader>
          {subheader && <div className="shrink-0 border-b border-border bg-muted/40 px-3 sm:px-8 py-2.5 text-xs text-muted-foreground overflow-x-auto no-scrollbar">{subheader}</div>}
          <div
            ref={contentRef}
            className={cn('flex-1 overflow-y-auto px-4 sm:px-8 py-4 sm:py-6 text-sm text-foreground', bodyClassName)}
          >
            {children}
          </div>
          {footer && (
            <div className="flex items-center justify-end gap-3 sm:gap-4 px-4 sm:px-8 py-4 sm:py-5 border-t border-border bg-muted/30 shrink-0">
              {footer}
            </div>
          )}
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className={cn('p-0 gap-0 border border-surface-border bg-background shadow-e4_modal rounded-none sm:rounded-2xl sm:max-h-[85vh]', centerSizeClass[size])}>
        <DialogHeader className="px-4 sm:px-8 pt-5 sm:pt-7 pb-4 sm:pb-5 border-b border-border bg-background text-left pr-14 sm:pr-16 shrink-0">
          {typeof title === 'string' ? (
            <DialogTitle className="text-lg font-bold text-foreground truncate">{title}</DialogTitle>
          ) : (
            title
          )}
          {header}
        </DialogHeader>
        {subheader && <div className="shrink-0 border-b border-border bg-muted/40 px-4 sm:px-8 py-3 text-xs text-muted-foreground">{subheader}</div>}
        <div
          ref={contentRef}
          className={cn('flex-1 px-4 sm:px-8 py-4 sm:py-6 text-sm text-foreground sm:overflow-y-auto sm:max-h-[65vh]', bodyClassName)}
        >
          {children}
        </div>
        {footer && (
          <div className="flex items-center justify-end gap-3 sm:gap-4 px-4 sm:px-8 py-4 sm:py-5 border-t border-border bg-muted/30 shrink-0 mt-auto sm:mt-0">
            {footer}
          </div>
        )}
      </DialogContent>
    </Dialog>
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
      <div className="flex items-center justify-end gap-4 sm:gap-4 w-full">
        <Button variant="ghost" size="md" onClick={onClose} className="px-5">
          Batal
        </Button>
        <Button
          variant={tone === 'danger' ? 'destructive' : 'default'}
          size="md"
          className="px-6"
          onClick={() => {
            onConfirm();
            onClose();
          }}
        >
          {confirmLabel}
        </Button>
      </div>
    }
  >
    <p className="text-xs text-muted-foreground leading-relaxed">{message}</p>
  </Overlay>
);
