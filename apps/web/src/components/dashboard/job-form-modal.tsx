'use client';

import React, { useEffect, useState } from 'react';
import { JobPosting } from '@/lib/types';
import { Overlay, Field, Input, Button } from '@/components/ui';

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
  const [form, setForm] = useState(emptyForm);

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
    } else if (mode === 'create' && isOpen) {
      setForm(emptyForm);
    }
  }, [mode, job, isOpen]);

  const set = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

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
          <Button size="sm" type="submit" form="job-form">
            {mode === 'edit' ? 'Simpan' : 'Terbitkan'}
          </Button>
        </>
      }
    >
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
    </Overlay>
  );
};
