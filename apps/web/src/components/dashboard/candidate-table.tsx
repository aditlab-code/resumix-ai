'use client';

import React, { useMemo, useState } from 'react';
import { CandidateApplication } from '@/lib/types';
import {
  DataTable,
  EmptyState,
  Toolbar,
  SearchInput,
  FilterSelect,
} from '@/components/ui';
import { buildCandidateColumns } from '@/components/candidates/candidate-columns';

interface CandidateTableProps {
  applications: CandidateApplication[];
  onSelectCandidate: (app: CandidateApplication) => void;
  onReprocessCv: (appId: string) => void;
  onOpenUploadModal: () => void;
  onDeleteCandidate: (app: CandidateApplication) => void;
}

const matchesText = (app: CandidateApplication, term: string) =>
  app.candidate_name.toLowerCase().includes(term) ||
  app.email.toLowerCase().includes(term) ||
  (app.cv_extraction.skills || []).some((s) =>
    (s.normalized_name || s.name).toLowerCase().includes(term)
  );

export const CandidateTable: React.FC<CandidateTableProps> = ({
  applications,
  onSelectCandidate,
  onReprocessCv,
  onOpenUploadModal,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState<'score_desc' | 'score_asc' | 'date_desc'>('score_desc');

  const rows = useMemo(() => {
    const term = searchTerm.toLowerCase();
    const filtered = applications.filter((app) => {
      const matchesStatus =
        statusFilter === 'all' ||
        app.status === statusFilter ||
        app.parse_status === statusFilter;
      return matchesText(app, term) && matchesStatus;
    });

    return [...filtered].sort((a, b) => {
      if (sortBy === 'score_desc') return b.job_fit_score - a.job_fit_score;
      if (sortBy === 'score_asc') return a.job_fit_score - b.job_fit_score;
      return new Date(b.applied_at).getTime() - new Date(a.applied_at).getTime();
    });
  }, [applications, searchTerm, statusFilter, sortBy]);

  const columns = useMemo(
    () => buildCandidateColumns({ onSelect: onSelectCandidate, onReprocess: onReprocessCv }),
    [onSelectCandidate, onReprocessCv]
  );

  return (
    <div className="space-y-2">
      <Toolbar>
        <SearchInput
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search candidate, email, skill..."
        />
        <div className="flex items-center gap-2 sm:ml-auto">
          <FilterSelect value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="all">All statuses</option>
            <option value="screening">Screening</option>
            <option value="applied">Applied</option>
            <option value="interview">Interview</option>
            <option value="hired">Hired</option>
            <option value="needs_review">Needs Review</option>
            <option value="failed">Failed</option>
          </FilterSelect>
          <FilterSelect value={sortBy} onChange={(e) => setSortBy(e.target.value as typeof sortBy)}>
            <option value="score_desc">Highest score</option>
            <option value="score_asc">Lowest score</option>
            <option value="date_desc">Most recent</option>
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
            title="No candidates found"
            description="Adjust search term or status filter."
            actionLabel="Upload CV"
            onAction={onOpenUploadModal}
          />
        }
      />
    </div>
  );
};
