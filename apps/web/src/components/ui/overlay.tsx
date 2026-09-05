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
        <SheetContent side="right" className="flex flex-col p-0 gap-0 w-full sm:max-w-3xl lg:max-w-5xl xl:max-w-6xl">
          <SheetHeader className="px-6 py-4 border-b border-border">
            {typeof title === 'string' ? (
              <SheetTitle className="text-lg font-bold text-foreground truncate">{title}</SheetTitle>
            ) : (
              title
            )}
            {header}
          </SheetHeader>
          {subheader && <div className="shrink-0 border-b border-border bg-muted/50">{subheader}</div>}
          <div className={cn('flex-1 overflow-y-auto px-6 py-5 text-sm text-muted-foreground', bodyClassName)}>
            {children}
          </div>
          {footer && (
            <div className="flex items-center justify-end gap-2.5 px-6 py-4 border-t border-border bg-muted/30 shrink-0">
              {footer}
            </div>
          )}
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className={cn('p-0 gap-0 overflow-hidden', centerSizeClass[size])}>
        <DialogHeader className="px-6 py-4 border-b border-border">
          {typeof title === 'string' ? (
            <DialogTitle className="text-lg font-bold text-foreground truncate">{title}</DialogTitle>
          ) : (
            title
          )}
          {header}
        </DialogHeader>
        {subheader && <div className="shrink-0 border-b border-border bg-muted/50">{subheader}</div>}
        <div className={cn('flex-1 max-h-[70vh] overflow-y-auto px-6 py-5 text-sm text-muted-foreground', bodyClassName)}>
          {children}
        </div>
        {footer && (
          <div className="flex items-center justify-end gap-2.5 px-6 py-4 border-t border-border bg-muted/30 shrink-0">
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
      <>
        <Button variant="ghost" size="sm" onClick={onClose}>
          Batal
        </Button>
        <Button
          variant={tone === 'danger' ? 'destructive' : 'default'}
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
    <p className="text-xs text-muted-foreground leading-relaxed">{message}</p>
  </Overlay>
);


