'use client';

import React, { useState, useEffect } from 'react';
import { AuditLogItem } from '@/lib/types';
import { Overlay, Button, Tabs } from '@/components/ui';

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
  const [activeTab, setActiveTab] = useState<'all' | 'candidate' | 'jobs' | 'taxonomy'>('all');

  useEffect(() => {
    if (!isOpen) {
      setConfirming(false);
      setActiveTab('all');
    }
  }, [isOpen]);

  const filteredLogs = logs.filter((log) => {
    const act = log.action.toLowerCase();
    const details = log.details.toLowerCase();
    if (activeTab === 'candidate') {
      return act.includes('candidate') || act.includes('application') || act.includes('status') || details.includes('kandidat');
    }
    if (activeTab === 'jobs') {
      return act.includes('job') || details.includes('lowongan') || details.includes('posisi');
    }
    if (activeTab === 'taxonomy') {
      return act.includes('tax') || act.includes('skill') || act.includes('clear') || details.includes('taksonomi') || details.includes('log');
    }
    return true;
  });

  return (
    <Overlay
      isOpen={isOpen}
      onClose={onClose}
      size="2xl"
      title={
        <div>
          <h3 className="text-base font-bold text-foreground">Audit Trail & Security Logs</h3>
          <p className="text-xs font-normal text-muted-foreground mt-0.5">
            Operational activity history & system log records ({filteredLogs.length} of {logs.length} records)
          </p>
        </div>
      }
      subheader={
        <Tabs
          items={[
            { key: 'all', label: `All (${logs.length})` },
            { key: 'candidate', label: 'Candidates' },
            { key: 'jobs', label: 'Jobs' },
            { key: 'taxonomy', label: 'Taxonomy' },
          ]}
          active={activeTab}
          onChange={(k) => setActiveTab(k as any)}
          className="w-full justify-start overflow-x-auto"
        />
      }
      footer={
        confirming ? (
          <div className="flex items-center justify-between w-full">
            <span className="text-xs text-muted-foreground font-medium">Clear all {logs.length} audit log records?</span>
            <div className="flex items-center gap-4 sm:gap-4">
              <Button variant="ghost" size="md" onClick={() => setConfirming(false)} className="px-6">
                Cancel
              </Button>
              <Button
                variant="danger"
                size="md"
                className="px-6"
                onClick={() => {
                  onClearLogs();
                  setConfirming(false);
                }}
              >
                Clear All
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between w-full">
            <Button
              variant="danger-soft"
              size="md"
              className="px-5"
              disabled={logs.length === 0}
              onClick={() => setConfirming(true)}
            >
              Clear Log
            </Button>
            <Button variant="ghost" size="md" onClick={onClose} className="px-6">
              Close
            </Button>
          </div>
        )
      }
    >
      {filteredLogs.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground space-y-2">
          <p className="text-xs font-semibold text-foreground">No Log Records Found</p>
          <p className="text-[11px] text-muted-foreground max-w-xs">
            {activeTab === 'all'
              ? 'System activities, status changes, and taxonomy edits will be automatically recorded here.'
              : `No activity history found under the "${activeTab}" filter.`}
          </p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {filteredLogs.map((log) => (
            <div key={log.id} className="bg-muted/40 border border-border rounded-xl p-3.5 space-y-2 text-xs shadow-xs transition-colors hover:border-border/80">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-[11px]">
                <span className="font-bold text-primary font-mono">
                  {log.action}
                </span>
                <span className="text-muted-foreground font-mono text-[11px]">
                  {new Date(log.timestamp).toLocaleString('en-US')}
                </span>
              </div>
              <p className="text-foreground font-semibold leading-relaxed">{log.details}</p>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px] text-muted-foreground pt-2 border-t border-border">
                <span>
                  Actor: <strong className="text-foreground font-semibold">{log.actor}</strong>
                </span>
                <div className="flex items-center gap-1.5 font-mono">
                  <code className="bg-background border border-border px-2 py-0.5 rounded-md text-foreground text-[10px] font-bold">{log.target_entity}</code>
                  <span className="text-[10px] text-muted-foreground">({log.entity_id})</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </Overlay>
  );
};
