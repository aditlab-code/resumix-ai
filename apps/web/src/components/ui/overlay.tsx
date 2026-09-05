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
  if (variant === 'side') {
    return (
      <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <SheetContent side="right" className="flex flex-col p-0 gap-0 w-full sm:max-w-3xl lg:max-w-5xl xl:max-w-6xl shadow-2xl border-l border-border bg-background">
          <SheetHeader className="px-8 pt-7 pb-5 border-b border-border bg-background shrink-0 text-left pr-16">
            {typeof title === 'string' ? (
              <SheetTitle className="text-lg font-bold text-foreground truncate">{title}</SheetTitle>
            ) : (
              title
            )}
            {header}
          </SheetHeader>
          {subheader && <div className="shrink-0 border-b border-border bg-muted/40 px-8 py-3 text-xs text-muted-foreground">{subheader}</div>}
          <div className={cn('flex-1 overflow-y-auto px-8 py-6 text-sm text-foreground', bodyClassName)}>
            {children}
          </div>
          {footer && (
            <div className="flex items-center justify-end gap-4 px-8 py-5 border-t border-border bg-muted/30 shrink-0">
              {footer}
            </div>
          )}
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className={cn('p-0 gap-0 overflow-hidden border border-border bg-background shadow-2xl sm:rounded-2xl', centerSizeClass[size])}>
        <DialogHeader className="px-8 pt-7 pb-5 border-b border-border bg-background shrink-0 text-left pr-16">
          {typeof title === 'string' ? (
            <DialogTitle className="text-lg font-bold text-foreground truncate">{title}</DialogTitle>
          ) : (
            title
          )}
          {header}
        </DialogHeader>
        {subheader && <div className="shrink-0 border-b border-border bg-muted/40 px-8 py-3 text-xs text-muted-foreground">{subheader}</div>}
        <div className={cn('flex-1 max-h-[75vh] overflow-y-auto px-8 py-6 text-sm text-foreground', bodyClassName)}>
          {children}
        </div>
        {footer && (
          <div className="flex items-center justify-end gap-4 px-8 py-5 border-t border-border bg-muted/30 shrink-0">
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
