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
          icon={<Briefcase className="w-8 h-8 text-accent" />}
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {filtered.map((job) => (
            <Card key={job.id} className="flex flex-col justify-between gap-3">
              <div className="space-y-3">
                <div className="flex justify-between items-start gap-2">
                  <div>
                    <span className="text-[11px] font-bold uppercase text-ink-subtle">
                      {job.department}
                    </span>
                    <h3 className="mt-0.5">{job.title}</h3>
                  </div>
                  <div className="flex items-center gap-0.5 shrink-0">
                    <button
                      onClick={() => onEditJob(job)}
                      className="p-1.5 text-ink-subtle hover:text-accent hover:bg-canvas rounded transition-colors"
                      aria-label="Edit lowongan"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onDeleteJob(job.id)}
                      className="p-1.5 text-ink-subtle hover:text-danger hover:bg-canvas rounded transition-colors"
                      aria-label="Hapus lowongan"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="space-y-1 text-xs text-ink-muted">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 shrink-0" />
                    {job.location}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 shrink-0" />
                    Min. <strong className="text-ink">{job.minimum_experience_months} bln</strong>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 shrink-0" />
                    <strong className="text-ink">{job.applications_count}</strong> pelamar
                  </div>
                </div>

                <div className="flex flex-wrap gap-1 pt-2 border-t border-line">
                  {job.mandatory_skills.map((skill) => (
                    <span
                      key={skill}
                      className="px-1.5 py-0.5 bg-canvas text-ink text-[11px] font-semibold rounded"
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
                className="w-full"
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
