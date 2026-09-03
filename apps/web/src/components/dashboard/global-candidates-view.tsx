'use client';

import React, { useMemo, useState } from 'react';
import { CandidateApplication, JobPosting } from '@/lib/types';
import {
  DataTable,
  EmptyState,
  Toolbar,
  SearchInput,
  FilterSelect,
} from '@/components/ui';
import { buildCandidateColumns } from '@/components/candidates/candidate-columns';

interface GlobalCandidatesViewProps {
  applications: CandidateApplication[];
  jobs: JobPosting[];
  onSelectCandidate: (app: CandidateApplication) => void;
  onOpenUploadModal: () => void;
  onDeleteCandidate: (app: CandidateApplication) => void;
  onReprocessCv: (appId: string) => void;
}

export const GlobalCandidatesView: React.FC<GlobalCandidatesViewProps> = ({
  applications,
  jobs,
  onSelectCandidate,
  onOpenUploadModal,
  onReprocessCv,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [jobFilter, setJobFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  const rows = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return applications.filter((app) => {
      const matchesSearch =
        app.candidate_name.toLowerCase().includes(term) ||
        app.email.toLowerCase().includes(term) ||
        (app.cv_extraction.skills || []).some((s) =>
          (s.normalized_name || s.name).toLowerCase().includes(term)
        );
      const matchesJob = jobFilter === 'all' || app.job_id === jobFilter;
      const matchesStatus =
        statusFilter === 'all' ||
        app.status === statusFilter ||
        app.parse_status === statusFilter;
      return matchesSearch && matchesJob && matchesStatus;
    });
  }, [applications, searchTerm, jobFilter, statusFilter]);

  const columns = useMemo(
    () => buildCandidateColumns({ jobs, onSelect: onSelectCandidate, onReprocess: onReprocessCv }),
    [jobs, onSelectCandidate, onReprocessCv]
  );

  return (
    <div className="space-y-2">
      <Toolbar>
        <SearchInput
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Cari nama, email, skill"
        />
        <div className="flex flex-wrap items-center gap-2 sm:ml-auto">
          <FilterSelect value={jobFilter} onChange={(e) => setJobFilter(e.target.value)}>
            <option value="all">Semua lowongan</option>
            {jobs.map((j) => (
              <option key={j.id} value={j.id}>
                {j.title}
              </option>
            ))}
          </FilterSelect>
          <FilterSelect value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="all">Semua status</option>
            <option value="screening">Screening</option>
            <option value="applied">Applied</option>
            <option value="interview">Interview</option>
            <option value="hired">Hired</option>
            <option value="needs_review">Needs Review</option>
          </FilterSelect>
        </div>
      </Toolbar>

      <DataTable
        columns={columns}
        rows={rows}
        rowKey={(app) => app.id}
        onRowClick={onSelectCandidate}
        empty={
          <EmptyState
            title="Tidak ada kandidat"
            description="Sesuaikan pencarian atau filter."
            actionLabel="Unggah CV"
            onAction={onOpenUploadModal}
          />
        }
      />
    </div>
  );
};
