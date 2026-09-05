'use client';

import React, { useState } from 'react';
import { CandidateApplication } from '@/lib/types';
import { Overlay, Button, Input } from '@/components/ui';

interface DeleteCandidateModalProps {
  isOpen: boolean;
  onClose: () => void;
  application: CandidateApplication | null;
  onConfirmDelete: (appId: string) => void;
}

export const DeleteCandidateModal: React.FC<DeleteCandidateModalProps> = ({
  isOpen,
  onClose,
  application,
  onConfirmDelete,
}) => {
  const [confirmName, setConfirmName] = useState('');
  const [copied, setCopied] = useState(false);

  if (!application) return null;

  const isConfirmed =
    confirmName.trim().toLowerCase() === application.candidate_name.trim().toLowerCase() ||
    confirmName.trim().toLowerCase() === 'hapus';

  const close = () => {
    setConfirmName('');
    setCopied(false);
    onClose();
  };

  const handleDelete = () => {
    onConfirmDelete(application.id);
    setConfirmName('');
    setCopied(false);
    onClose();
  };

  const handleCopyName = () => {
    if (typeof window !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(application.candidate_name);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <Overlay
      isOpen={isOpen}
      onClose={close}
      size="md"
      title={
        <div>
          <h3 className="text-base font-bold text-foreground">Hapus Permanen Kandidat</h3>
          <p className="text-xs font-normal text-muted-foreground mt-0.5">Tindakan ini tidak dapat dibatalkan</p>
        </div>
      }
      footer={
        <div className="flex items-center justify-end gap-4 sm:gap-4 w-full">
          <Button variant="ghost" size="md" onClick={close} className="px-6">
            Batal
          </Button>
          <Button variant="danger" size="md" onClick={handleDelete} disabled={!isConfirmed} className="px-6">
            Hapus permanen
          </Button>
        </div>
      }
    >
      <div className="space-y-4 text-xs">
        {/* Danger Warning Alert Box */}
        <div className="p-3.5 bg-destructive/10 border border-destructive/20 text-destructive rounded-xl space-y-1">
          <p className="font-semibold text-xs leading-snug">Peringatan Penghapusan Data</p>
          <p className="leading-relaxed text-muted-foreground text-xs">
            Berkas PDF privat, data ekstraksi PII, dan Job-Fit Score untuk kandidat{' '}
            <span className="inline-flex items-center px-2 py-0.5 rounded font-mono font-bold text-xs bg-destructive/15 text-destructive border border-destructive/30 mx-1">
              {application.candidate_name}
            </span>{' '}
            ({application.email}) akan dihapus total dari database dan tidak dapat dipulihkan.
          </p>
        </div>

        {/* Confirmation Tag & Input Section */}
        <div className="space-y-3 pt-1">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-semibold text-foreground">
              Konfirmasi Nama Kandidat
            </label>
            <span className="text-[11px] text-muted-foreground italic">Sensitif huruf besar/kecil</span>
          </div>
          
          {/* Enhanced Target Name Badge Box */}
          <div className="flex items-center justify-between gap-2 p-2.5 bg-muted/60 border border-border rounded-xl shadow-xs">
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-[11px] font-medium text-muted-foreground shrink-0">Nama target:</span>
              <code className="inline-flex items-center px-2.5 py-1 rounded-lg font-mono text-xs font-bold bg-primary/10 text-primary border border-primary/20 shadow-xs truncate select-all">
                {application.candidate_name}
              </code>
            </div>
            <button
              type="button"
              onClick={handleCopyName}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-semibold text-primary hover:text-primary/80 bg-background border border-border rounded-lg hover:bg-accent transition-colors shrink-0 shadow-xs"
              title="Salin nama kandidat"
            >
              {copied ? <span className="text-emerald-600 font-bold">Tersalin</span> : <span>Salin</span>}
            </button>
          </div>

          <div className="space-y-1.5">
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              Ketik nama di atas atau kata <code className="px-1.5 py-0.5 rounded bg-muted font-mono font-bold text-foreground border border-border">hapus</code> untuk mengonfirmasi:
            </p>
            <Input
              value={confirmName}
              onChange={(e) => setConfirmName(e.target.value)}
              placeholder={`Ketik "${application.candidate_name}" atau "hapus"`}
              className="font-mono text-xs focus:ring-destructive/30"
            />
          </div>
        </div>
      </div>
    </Overlay>
  );
};
