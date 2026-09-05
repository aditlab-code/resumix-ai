'use client';

import React from 'react';
import { useAppData } from '@/context/app-data-context';
import { PipelineSettingsView } from '@/components/dashboard/pipeline-settings-view';

export default function SettingsPage() {
  const { addToast, addAuditLog } = useAppData();

  return (
    <div className="space-y-6">
      <PipelineSettingsView
        onSaveSettings={(msg) => addToast('success', 'Settings saved', msg)}
        onAddToast={addToast}
        onAddAuditLog={addAuditLog}
      />
    </div>
  );
}
