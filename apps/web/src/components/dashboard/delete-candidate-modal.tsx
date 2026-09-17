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
    confirmName.trim().toLowerCase() === 'delete' ||
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
          <h3 className="text-base font-bold text-foreground">Permanently Delete Candidate</h3>
          <p className="text-xs font-normal text-muted-foreground mt-0.5">This action cannot be undone</p>
        </div>
      }
      footer={
        <div className="flex items-center justify-end gap-4 sm:gap-4 w-full">
          <Button variant="ghost" size="md" onClick={close} className="px-6">
            Cancel
          </Button>
          <Button variant="danger" size="md" onClick={handleDelete} disabled={!isConfirmed} className="px-6">
            Permanently Delete
          </Button>
        </div>
      }
    >
      <div className="space-y-4 text-xs">
        {/* Single Unified Warning Card */}
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-950 rounded-xl space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-extrabold text-xs uppercase tracking-wider text-rose-900">Permanent Data Deletion</span>
            <span className="text-[11px] font-mono text-rose-700">Irreversible</span>
          </div>
          <p className="leading-relaxed text-slate-700 text-xs">
            Resume PDF, extracted PII, and Job-Fit scores for candidate{' '}
            <strong className="text-slate-900 font-bold">{application.candidate_name}</strong> ({application.email}) will be permanently removed.
          </p>
        </div>

        {/* Confirmation Input Section */}
        <div className="space-y-2">
          <label className="block text-xs font-bold text-foreground">
            Type candidate name or <code className="px-1.5 py-0.5 rounded bg-slate-100 font-mono text-slate-800 border border-slate-300">delete</code> to confirm:
          </label>
          <Input
            value={confirmName}
            onChange={(e) => setConfirmName(e.target.value)}
            placeholder={`Type "${application.candidate_name}" or "delete"`}
            className="font-mono text-xs"
          />
        </div>
      </div>
    </Overlay>
  );
};
