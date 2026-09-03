'use client';

import React, { useState } from 'react';
import { AlertTriangle } from 'lucide-react';
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

  if (!application) return null;

  const isConfirmed =
    confirmName.trim().toLowerCase() === application.candidate_name.trim().toLowerCase();

  const close = () => {
    setConfirmName('');
    onClose();
  };

  const handleDelete = () => {
    onConfirmDelete(application.id);
    setConfirmName('');
    onClose();
  };

  return (
    <Overlay
      isOpen={isOpen}
      onClose={close}
      size="md"
      title="Hapus permanen kandidat"
      footer={
        <>
          <Button variant="ghost" size="sm" onClick={close}>
            Batal
          </Button>
          <Button variant="danger" size="sm" onClick={handleDelete} disabled={!isConfirmed}>
            Hapus permanen
          </Button>
        </>
      }
    >
      <div className="space-y-3 text-xs">
        <div className="p-3 bg-danger-soft text-danger rounded flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            Berkas PDF privat, data ekstraksi PII, dan Job-Fit Score{' '}
            <strong>{application.candidate_name}</strong> ({application.email}) akan dihapus total dan
            tidak dapat dipulihkan.
          </p>
        </div>

        <div className="space-y-1">
          <label className="block font-bold text-ink-muted">
            Ketik <code className="bg-canvas px-1 rounded font-mono text-ink">{application.candidate_name}</code>{' '}
            untuk konfirmasi
          </label>
          <Input
            value={confirmName}
            onChange={(e) => setConfirmName(e.target.value)}
            placeholder={application.candidate_name}
          />
        </div>
      </div>
    </Overlay>
  );
};
