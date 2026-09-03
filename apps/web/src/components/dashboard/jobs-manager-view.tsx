'use client';

import React, { useState } from 'react';
import { JobPosting } from '@/lib/types';
import { Plus, MapPin, Clock, Users, Edit3, Trash2, Briefcase } from 'lucide-react';
import { Button, Card, Toolbar, SearchInput, EmptyState } from '@/components/ui';

interface JobsManagerViewProps {
  jobs: JobPosting[];
  onOpenCreateJobModal: () => void;
  onSelectJobForCandidates: (jobId: string) => void;
  onEditJob: (job: JobPosting) => void;
  onDeleteJob: (jobId: string) => void;
}

export const JobsManagerView: React.FC<JobsManagerViewProps> = ({
  jobs,
  onOpenCreateJobModal,
  onSelectJobForCandidates,
  onEditJob,
  onDeleteJob,
}) => {
  const [query, setQuery] = useState('');

  const filtered = jobs.filter(
    (j) =>
      j.title.toLowerCase().includes(query.toLowerCase()) ||
      j.department.toLowerCase().includes(query.toLowerCase()) ||
      j.mandatory_skills.some((s) => s.toLowerCase().includes(query.toLowerCase()))
  );

  return (
    <div className="space-y-3">
      <Toolbar>
        <SearchInput
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Cari posisi, divisi, skill"
        />
        <div className="sm:ml-auto">
          <Button
            size="sm"
            onClick={onOpenCreateJobModal}
            iconLeft={<Plus className="w-3.5 h-3.5" />}
          >
            Lowongan Baru
          </Button>
        </div>
      </Toolbar>

      {filtered.length === 0 ? (
        <EmptyState
          icon={<Briefcase className="w-8 h-8 text-brand-accent" />}
          title={jobs.length === 0 ? 'Belum Ada Lowongan Kerja Diterbitkan' : 'Lowongan Tidak Ditemukan'}
          description={
            jobs.length === 0
              ? 'Terbitkan lowongan kerja baru atau impor deskripsi pekerjaan dari LinkedIn/Glints untuk mulai menyaring CV.'
              : 'Tidak ada lowongan yang sesuai dengan kriteria kata kunci pencarian.'
          }
          actionLabel="Buat Lowongan Kerja Baru"
          onAction={onOpenCreateJobModal}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((job) => (
            <Card key={job.id} interactive className="flex flex-col justify-between gap-4">
              <div className="space-y-3.5">
                <div className="flex justify-between items-start gap-2">
                  <div>
                    <span className="text-caption font-semibold uppercase tracking-wider text-ink-subtle">
                      {job.department}
                    </span>
                    <h3 className="text-h3 font-bold text-ink-default mt-0.5">{job.title}</h3>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => onEditJob(job)}
                      className="p-1.5 text-ink-subtle hover:text-brand-accent hover:bg-surface-sunken rounded-md transition-colors focus-ring"
                      aria-label="Edit lowongan"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onDeleteJob(job.id)}
                      className="p-1.5 text-ink-subtle hover:text-semantic-danger hover:bg-semantic-danger_soft rounded-md transition-colors focus-ring"
                      aria-label="Hapus lowongan"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5 text-caption text-ink-muted">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-ink-subtle shrink-0" />
                    {job.location}
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-ink-subtle shrink-0" />
                    Min. <strong className="text-ink-default font-semibold">{job.minimum_experience_months} bln</strong>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-ink-subtle shrink-0" />
                    <strong className="text-ink-default font-semibold">{job.applications_count}</strong> pelamar
                  </div>
                </div>

                <div className="flex flex-wrap gap-1.5 pt-3 border-t border-surface-border">
                  {job.mandatory_skills.map((skill) => (
                    <span
                      key={skill}
                      className="px-2 py-0.5 bg-surface-sunken text-ink-default text-caption font-semibold rounded-sm border border-surface-border"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              <Button
                variant="secondary"
                size="sm"
                onClick={() => onSelectJobForCandidates(job.id)}
                className="w-full mt-2"
              >
                Lihat pelamar ({job.applications_count})
              </Button>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
