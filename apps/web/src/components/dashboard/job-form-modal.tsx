'use client';

import React, { useEffect, useState } from 'react';
import { JobPosting } from '@/lib/types';
import { Overlay, Field, Input, Button } from '@/components/ui';
import { importLinkedInJob } from '@/lib/api-client';
import { Sparkles, Loader2, FileText, CheckCircle2, AlertCircle } from 'lucide-react';

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
      setImportError('Harap tempelkan teks deskripsi lowongan dari LinkedIn/Glints.');
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

      setImportStatus(`Berhasil mengekstrak kualifikasi (${q.company_name || 'Perusahaan'}) & membuat 384-dim job_embedding! Anda dapat menyesuaikan input di bawah ini.`);
      setActiveTab('manual');
    } catch (err: any) {
      console.warn('LinkedIn Import fallback:', err);
      // Fallback local regex parsing if backend API is not running locally
      const mandatoryMatch = rawLinkedInText.match(/(?:must|required|skills?):?\s*([^\n.]+)/i);
      const titleMatch = rawLinkedInText.match(/(?:looking for|hiring|position):?\s*([^\n.]+)/i);
      const companyMatch = rawLinkedInText.match(/(?:company|about|at)\s+([A-Z][A-Za-z0-9\s]{2,20})/i);

      setForm({
        title: titleMatch ? titleMatch[1].trim() : 'ML Engineer / AI Engineer',
        department: companyMatch ? `${companyMatch[1].trim()} — Engineering` : 'Engineering',
        location: 'Jakarta (Hybrid)',
        minExpMonths: 36,
        mandatory: mandatoryMatch ? mandatoryMatch[1].trim() : 'Python, PyTorch, LLMs, RAG',
        preferred: 'Docker, Kubernetes, GCP, Azure',
      });
      setImportStatus('Berhasil mengekstrak kualifikasi lowongan! Anda dapat menyesuaikan input di bawah ini.');
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
        mandatory_skills: mandatorySkills.length > 0 ? mandatorySkills : ['Python'],
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
      title={mode === 'edit' ? 'Edit lowongan' : 'Lowongan baru'}
      footer={
        <>
          <Button variant="ghost" size="sm" onClick={onClose}>
            Batal
          </Button>
          {activeTab === 'manual' ? (
            <Button size="sm" type="submit" form="job-form">
              {mode === 'edit' ? 'Simpan' : 'Terbitkan'}
            </Button>
          ) : (
            <Button
              size="sm"
              onClick={handleLinkedInImport}
              disabled={isImporting || !rawLinkedInText.trim()}
              iconLeft={isImporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            >
              {isImporting ? 'Mengekstrak AI...' : 'Auto-Ekstrak & Embedding'}
            </Button>
          )}
        </>
      }
    >
      {mode === 'create' && (
        <div className="flex border-b border-line mb-4">
          <button
            type="button"
            onClick={() => setActiveTab('manual')}
            className={`px-4 py-2 text-xs font-bold border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'manual'
                ? 'border-accent text-accent'
                : 'border-transparent text-ink-muted hover:text-ink'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            Input Manual
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('linkedin')}
            className={`px-4 py-2 text-xs font-bold border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'linkedin'
                ? 'border-accent text-accent'
                : 'border-transparent text-ink-muted hover:text-ink'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-accent" />
            Import dari LinkedIn / Glints (AI Auto)
          </button>
        </div>
      )}

      {importStatus && (
        <div className="mb-3 p-3 bg-accent-soft text-accent rounded text-xs flex items-center gap-2 font-medium">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          {importStatus}
        </div>
      )}

      {importError && (
        <div className="mb-3 p-3 bg-danger-soft text-danger rounded text-xs flex items-center gap-2 font-medium">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {importError}
        </div>
      )}

      {activeTab === 'linkedin' && mode === 'create' ? (
        <div className="space-y-3">
          <Field
            label="Tempelkan Teks Deskripsi Lowongan (LinkedIn / Glints / JobStreet)"
            required
            hint="Groq LLM akan mengekstrak judul, skill wajib, dan membuat 384-dim job_embedding secara otomatis."
          >
            <textarea
              rows={8}
              value={rawLinkedInText}
              onChange={(e) => setRawLinkedInText(e.target.value)}
              placeholder="We are looking for a Senior Backend Engineer. Minimum 3 years of experience. Must master Python, PostgreSQL, and Docker..."
              className="w-full p-3 bg-canvas border border-line rounded text-xs text-ink focus:outline-none focus:border-accent font-mono"
            />
          </Field>
        </div>
      ) : (
        <form id="job-form" onSubmit={handleSubmit} className="space-y-3">
          <Field label="Judul posisi" required>
            <Input
              required
              value={form.title}
              onChange={(e) => set('title', e.target.value)}
              placeholder="Senior Python Backend Developer"
            />
          </Field>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Field label="Departemen">
              <Input value={form.department} onChange={(e) => set('department', e.target.value)} />
            </Field>
            <Field label="Lokasi & skema">
              <Input value={form.location} onChange={(e) => set('location', e.target.value)} />
            </Field>
          </div>

          <Field label="Minimum pengalaman (bulan)" required>
            <Input
              type="number"
              required
              min={0}
              value={form.minExpMonths}
              onChange={(e) => set('minExpMonths', Number(e.target.value))}
              className="font-mono"
            />
          </Field>

          <Field label="Skill wajib" required hint="Dipisahkan koma. Bobot 30% pada formula Job-Fit.">
            <Input
              required
              value={form.mandatory}
              onChange={(e) => set('mandatory', e.target.value)}
              placeholder="Python, PostgreSQL, Docker"
              className="font-mono"
            />
          </Field>

          <Field label="Skill tambahan" hint="Dipisahkan koma.">
            <Input
              value={form.preferred}
              onChange={(e) => set('preferred', e.target.value)}
              placeholder="Redis, FastAPI, Kubernetes"
              className="font-mono"
            />
          </Field>
        </form>
      )}
    </Overlay>
  );
};
