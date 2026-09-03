'use client';

import React, { useState } from 'react';
import { Modal } from '@/components/ui/modal';
import { CandidateApplication } from '@/lib/types';
import { Trash2, AlertTriangle, ShieldAlert } from 'lucide-react';

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
  if (!application) return null;

  const [confirmName, setConfirmName] = useState('');
  const isConfirmed = confirmName.trim().toLowerCase() === application.candidate_name.trim().toLowerCase();

  const handleDelete = () => {
    onConfirmDelete(application.id);
    setConfirmName('');
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        setConfirmName('');
        onClose();
      }}
      title="Hapus Permanen Data Kandidat (Hard Delete)"
      subtitle="Tindakan ini tidak dapat dibatalkan. Berkas PDF privat, data ekstraksi PII, dan Job-Fit Score akan dihapus total."
      maxWidth="md"
    >
      <div className="space-y-4 text-xs text-slate-800">
        {/* Warning Banner */}
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-900 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div>
            <h4 className="font-bold text-rose-800 text-xs">Peringatan Keamanan & Retensi PII</h4>
            <p className="text-[11px] text-rose-700 mt-0.5 leading-relaxed">
              Anda akan menghapus total kandidat <strong>{application.candidate_name}</strong> ({application.email}). Berkas PDF di storage privat (<code>{application.storage_path}</code>) dan riwayat penilaian AI akan dimusnahkan.
            </p>
          </div>
        </div>

        {/* Confirmation Name Input */}
        <div className="space-y-1.5">
          <label className="block font-bold text-slate-700">
            Ketik nama kandidat <code className="bg-slate-100 px-1.5 py-0.5 rounded border border-slate-300 font-mono text-slate-900">{application.candidate_name}</code> untuk konfirmasi:
          </label>
          <input
            type="text"
            value={confirmName}
            onChange={(e) => setConfirmName(e.target.value)}
            placeholder={`Ketik "${application.candidate_name}"`}
            className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-rose-500 font-medium"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
          <button
            onClick={() => {
              setConfirmName('');
              onClose();
            }}
            className="px-4 py-2 font-semibold text-slate-500 hover:text-slate-800 transition"
          >
            Batal
          </button>
          <button
            onClick={handleDelete}
            disabled={!isConfirmed}
            className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-lg border border-rose-600 transition flex items-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Trash2 className="w-4 h-4" /> Hapus Permanen Sekarang
          </button>
        </div>
      </div>
    </Modal>
  );
};
