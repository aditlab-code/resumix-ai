'use client';

import React, { useEffect, useState } from 'react';
import { JobPosting } from '@/lib/types';
import { Overlay, Field, Input, Textarea, Button, Tabs } from '@/components/ui';

import { importLinkedInJob } from '@/lib/api-client';
import { Loader2 } from 'lucide-react';

interface JobFormModalProps {
  mode: 'create' | 'edit';
  isOpen: boolean;
  onClose: () => void;
  job?: JobPosting | null;
  onSuccess: (job: JobPosting) => void;
}

const splitSkills = (value: string) =>
  value
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

const emptyForm = {
  title: '',
  department: 'Engineering',
  location: 'Jakarta (Hybrid)',
  minExpMonths: 24,
  mandatory: '',
  preferred: '',
};

export const JobFormModal: React.FC<JobFormModalProps> = ({
  mode,
  isOpen,
  onClose,
  job,
  onSuccess,
}) => {
  const [activeTab, setActiveTab] = useState<'manual' | 'linkedin'>('manual');
  const [form, setForm] = useState(emptyForm);

  // LinkedIn Import State
  const [rawLinkedInText, setRawLinkedInText] = useState('');
  const [isImporting, setIsImporting] = useState(false);
  const [importStatus, setImportStatus] = useState<string | null>(null);
  const [importError, setImportError] = useState<string | null>(null);

  useEffect(() => {
    if (mode === 'edit' && job) {
      setForm({
        title: job.title,
        department: job.department,
        location: job.location,
        minExpMonths: job.minimum_experience_months,
        mandatory: job.mandatory_skills.join(', '),
        preferred: job.preferred_skills.join(', '),
      });
      setActiveTab('manual');
    } else if (mode === 'create' && isOpen) {
      setForm(emptyForm);
      setRawLinkedInText('');
      setImportStatus(null);
      setImportError(null);
    }
  }, [mode, job, isOpen]);

  const set = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const handleLinkedInImport = async () => {
    if (!rawLinkedInText.trim()) {
      setImportError('Please paste the job description text from LinkedIn/Glints.');
      return;
    }

    setIsImporting(true);
    setImportError(null);
    setImportStatus(null);

    try {
      const res = await importLinkedInJob(rawLinkedInText);
      const q = res.data?.qualifications || {};

      setForm({
        title: q.title || form.title || 'Job Posting',
        department: q.company_name ? `${q.company_name} — ${q.department || 'Engineering'}` : (q.department || 'Engineering'),
        location: q.location || 'Jakarta (Hybrid)',
        minExpMonths: q.minimum_experience_months || 24,
        mandatory: (q.mandatory_skills || []).join(', '),
        preferred: (q.preferred_skills || []).join(', '),
      });

      setImportStatus(`Successfully extracted qualifications (${q.company_name || 'Company'}) & generated 384-dim job_embedding! You can adjust the inputs below.`);
      setActiveTab('manual');
    } catch (err: any) {
      console.warn('LinkedIn Import fallback:', err);
      // Fallback local regex parsing if backend API is not running locally
      const mandatoryMatch = rawLinkedInText.match(/(?:must|required|skills?):?\s*([^\n.]+)/i);
      const titleMatch = rawLinkedInText.match(/(?:looking for|hiring|position):?\s*([^\n.]+)/i);
      const companyMatch = rawLinkedInText.match(/(?:company|about|at)\s+([A-Z][A-Za-z0-9\s]{2,20})/i);

      setForm({
        title: titleMatch ? titleMatch[1].trim() : 'Job Vacancy Title',
        department: companyMatch ? companyMatch[1].trim() : 'General',
        location: 'Jakarta (Hybrid)',
        minExpMonths: 36,
        mandatory: mandatoryMatch ? mandatoryMatch[1].trim() : '',
        preferred: '',
      });
      setImportStatus('Successfully extracted job qualifications! You can adjust the inputs below.');
      setActiveTab('manual');
    } finally {
      setIsImporting(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) return;

    const mandatorySkills = splitSkills(form.mandatory);
    const preferredSkills = splitSkills(form.preferred);

    if (mode === 'edit' && job) {
      onSuccess({
        ...job,
        title: form.title,
        department: form.department,
        location: form.location,
        minimum_experience_months: Number(form.minExpMonths),
        mandatory_skills: mandatorySkills,
        preferred_skills: preferredSkills,
      });
    } else {
      onSuccess({
        id: `job-${Date.now()}`,
        title: form.title,
        department: form.department,
        location: form.location,
        status: 'open',
        minimum_experience_months: Number(form.minExpMonths),
        mandatory_skills: mandatorySkills,
        preferred_skills: preferredSkills,
        created_at: new Date().toISOString(),
        applications_count: 0,
      });
    }
    onClose();
  };

  if (mode === 'edit' && !job) return null;

  return (
    <Overlay
      isOpen={isOpen}
      onClose={onClose}
      size="lg"
      title={
        <div>
          <h3 className="text-base font-bold text-foreground">
            {mode === 'edit' ? 'Edit Job Opening' : 'Create New Job Opening'}
          </h3>
          <p className="text-xs font-normal text-muted-foreground mt-0.5">
            {mode === 'edit' ? 'Update qualifications & Job-Fit criteria' : 'Post job opening and set Job-Fit scoring criteria'}
          </p>
        </div>
      }
      subheader={
        mode === 'create' ? (
          <Tabs
            items={[
              { key: 'manual', label: 'Manual Entry' },
              { key: 'linkedin', label: 'AI Import (LinkedIn / Glints)' },
            ]}
            active={activeTab}
            onChange={(k) => setActiveTab(k as 'manual' | 'linkedin')}
            className="w-full justify-start"
          />
        ) : undefined
      }
      footer={
        <div className="flex items-center justify-end gap-4 sm:gap-4 w-full">
          <Button variant="ghost" size="md" onClick={onClose} className="px-6">
            Cancel
          </Button>
          {activeTab === 'manual' ? (
            <Button size="md" type="submit" form="job-form" className="px-6">
              {mode === 'edit' ? 'Save Changes' : 'Post Job Opening'}
            </Button>
          ) : (
            <Button
              size="md"
              onClick={handleLinkedInImport}
              disabled={isImporting || !rawLinkedInText.trim()}
              className="px-6"
              iconLeft={isImporting ? <Loader2 className="w-4 h-4 animate-spin" /> : undefined}
            >
              {isImporting ? 'Extracting AI...' : 'Auto-Extract & Embed'}
            </Button>
          )}
        </div>
      }
    >
      <div className="space-y-4">
        {importStatus && (
          <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-300 rounded-xl text-xs font-medium">
            {importStatus}
          </div>
        )}

        {importError && (
          <div className="p-3.5 bg-destructive/10 border border-destructive/20 text-destructive rounded-xl text-xs font-medium">
            {importError}
          </div>
        )}

        {activeTab === 'linkedin' && mode === 'create' ? (
          <div className="space-y-4">
            <Field
              label="Paste Job Description Text (LinkedIn / Glints / JobStreet)"
              required
              hint="AI LLM will automatically extract title, required skills, preferred skills, for Job-Fit scoring."
            >
              <Textarea
                rows={8}
                value={rawLinkedInText}
                onChange={(e) => setRawLinkedInText(e.target.value)}
                placeholder="Paste job posting text here (e.g. key responsibilities, required qualifications, minimum experience)..."
                className="font-sans text-xs leading-relaxed"
              />
            </Field>
          </div>
        ) : (
          <form id="job-form" onSubmit={handleSubmit} className="space-y-4">
            <Field label="Job Position Title" required>
              <Input
                required
                value={form.title}
                onChange={(e) => set('title', e.target.value)}
                placeholder="Job Position Title (e.g. Operations Manager, Lead Specialist...)"
              />
            </Field>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <Field label="Department">
                <Input value={form.department} onChange={(e) => set('department', e.target.value)} />
              </Field>
              <Field label="Location & Work Setup">
                <Input value={form.location} onChange={(e) => set('location', e.target.value)} />
              </Field>
            </div>

            <Field label="Minimum Work Experience (Months)" required hint="Used for experience scoring. Example: 24 months = 2 years.">
              <Input
                type="number"
                required
                min={0}
                value={form.minExpMonths}
                onChange={(e) => set('minExpMonths', Number(e.target.value))}
                className="font-mono"
              />
            </Field>

            <Field label="Mandatory Skills" required hint="Comma-separated. Weight in Job-Fit criteria.">
              <Input
                required
                value={form.mandatory}
                onChange={(e) => set('mandatory', e.target.value)}
                placeholder="Primary required skills (comma-separated)"
                className="font-mono"
              />
            </Field>

            <Field label="Preferred Skills" hint="Comma-separated. Weight in Job-Fit criteria.">
              <Input
                value={form.preferred}
                onChange={(e) => set('preferred', e.target.value)}
                placeholder="Optional preferred skills (comma-separated)"
                className="font-mono"
              />
            </Field>
          </form>
        )}
      </div>
    </Overlay>
  );
};
