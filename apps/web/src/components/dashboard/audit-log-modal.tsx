'use client';

import React, { useState, useEffect } from 'react';
import { ShieldAlert, Trash2 } from 'lucide-react';
import { AuditLogItem } from '@/lib/types';
import { Overlay, Button } from '@/components/ui';

interface AuditLogModalProps {
  isOpen: boolean;
  onClose: () => void;
  logs: AuditLogItem[];
  onClearLogs: () => void;
}

export const AuditLogModal: React.FC<AuditLogModalProps> = ({
  isOpen,
  onClose,
  logs,
  onClearLogs,
}) => {
  const [confirming, setConfirming] = useState(false);

  useEffect(() => {
    if (!isOpen) setConfirming(false);
  }, [isOpen]);

  return (
    <Overlay
      isOpen={isOpen}
      onClose={onClose}
      size="2xl"
      title="Audit Log"
      footer={
        confirming ? (
          <>
            <span className="mr-auto text-xs text-ink-muted">Hapus seluruh {logs.length} catatan?</span>
            <Button variant="ghost" size="sm" onClick={() => setConfirming(false)}>
              Batal
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={() => {
                onClearLogs();
                setConfirming(false);
              }}
            >
              Hapus semua
            </Button>
          </>
        ) : (
          <>
            <Button
              variant="danger-soft"
              size="sm"
              className="mr-auto"
              disabled={logs.length === 0}
              onClick={() => setConfirming(true)}
              iconLeft={<Trash2 className="w-3.5 h-3.5" />}
            >
              Bersihkan
            </Button>
            <Button variant="ghost" size="sm" onClick={onClose}>
              Tutup
            </Button>
          </>
        )
      }
    >
      {logs.length === 0 ? (
        <p className="text-xs text-ink-subtle italic text-center py-6">Belum ada catatan audit log.</p>
      ) : (
        <div className="space-y-2">
          {logs.map((log) => (
            <div key={log.id} className="bg-canvas rounded p-3 space-y-1 text-xs">
              <div className="flex justify-between items-center text-[11px]">
                <span className="font-bold text-accent flex items-center gap-1.5">
                  <ShieldAlert className="w-3.5 h-3.5" />
                  {log.action}
                </span>
                <span className="text-ink-subtle font-mono">
                  {new Date(log.timestamp).toLocaleString('id-ID')}
                </span>
              </div>
              <p className="text-ink font-semibold leading-relaxed">{log.details}</p>
              <div className="flex justify-between text-[10px] text-ink-subtle pt-1.5 border-t border-line">
                <span>
                  Aktor: <strong>{log.actor}</strong>
                </span>
                <span>
                  <code className="bg-line/60 px-1 rounded">{log.target_entity}</code> ({log.entity_id})
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </Overlay>
  );
};
