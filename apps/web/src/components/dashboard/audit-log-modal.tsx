'use client';

import React from 'react';
import { Modal } from '@/components/ui/modal';
import { AuditLogItem } from '@/lib/types';
import { ShieldAlert } from 'lucide-react';

interface AuditLogModalProps {
  isOpen: boolean;
  onClose: () => void;
  logs: AuditLogItem[];
}

export const AuditLogModal: React.FC<AuditLogModalProps> = ({ isOpen, onClose, logs }) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Sistem Audit Log & Trait Activity History"
      subtitle="Jejak audit keamanan data PII kandidat, aktivitas pemrosesan AI, dan riwayat status rekrutmen HR."
      maxWidth="2xl"
    >
      <div className="space-y-4 text-slate-800">
        {logs.length === 0 ? (
          <p className="text-xs text-slate-400 italic text-center py-6">Belum ada catatan audit log.</p>
        ) : (
          <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
            {logs.map((log) => (
              <div
                key={log.id}
                className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-1 text-xs"
              >
                <div className="flex justify-between items-center text-[11px]">
                  <span className="font-bold text-sky-700 flex items-center gap-1.5">
                    <ShieldAlert className="w-3.5 h-3.5 text-sky-600" />
                    {log.action}
                  </span>
                  <span className="text-slate-500 font-mono">
                    {new Date(log.timestamp).toLocaleString('id-ID')}
                  </span>
                </div>
                <p className="text-slate-800 font-semibold leading-relaxed">{log.details}</p>
                <div className="flex justify-between text-[10px] text-slate-500 pt-1.5 border-t border-slate-200">
                  <span>Aktor: <strong>{log.actor}</strong></span>
                  <span>Entity: <code className="text-slate-600 bg-slate-200/60 px-1 py-0.2 rounded">{log.target_entity}</code> ({log.entity_id})</span>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="flex justify-end pt-2 border-t border-slate-200">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition border border-slate-300"
          >
            Tutup Log
          </button>
        </div>
      </div>
    </Modal>
  );
};
