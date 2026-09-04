'use client';

import React, { useMemo, useState } from 'react';
import { CandidateApplication, JobPosting } from '@/lib/types';
import { ApplicationStatus } from '@cv-ats/contracts';
import {
  DataTable,
  EmptyState,
  Toolbar,
  SearchInput,
  FilterSelect,
} from '@/components/ui';
import { buildCandidateColumns } from '@/components/candidates/candidate-columns';
import { SubNavTab, TabItem } from './sub-nav-tab';
import { KanbanBoard } from '@/components/candidates/kanban-board';
import { CandidateComparator } from '@/components/candidates/candidate-comparator';
import { Table, Kanban, Scale } from 'lucide-react';

interface GlobalCandidatesViewProps {
  applications: CandidateApplication[];
  jobs: JobPosting[];
  onSelectCandidate: (app: CandidateApplication) => void;
  onOpenUploadModal: () => void;
  onDeleteCandidate: (app: CandidateApplication) => void;
  onReprocessCv: (appId: string) => void;
  onUpdateStatus?: (appId: string, status: ApplicationStatus) => void;
}

type ViewMode = 'table' | 'kanban' | 'compare';

export const GlobalCandidatesView: React.FC<GlobalCandidatesViewProps> = ({
  applications,
  jobs,
  onSelectCandidate,
  onOpenUploadModal,
  onDeleteCandidate,
  onReprocessCv,
  onUpdateStatus,
}) => {
  const [viewMode, setViewMode] = useState<ViewMode>('table');
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

  const subTabs: TabItem<ViewMode>[] = [
    { id: 'table', label: 'Tabel Kandidat', icon: Table, count: rows.length },
    { id: 'kanban', label: 'Kanban Board', icon: Kanban },
    { id: 'compare', label: 'Komparasi Matriks', icon: Scale },
  ];

  return (
    <div className="space-y-4">
      {/* Unified SubNavTab Bar */}
      <SubNavTab
        tabs={subTabs}
        activeTab={viewMode}
        onTabChange={setViewMode}
      />

      {/* Filter Toolbar */}
      <Toolbar>
        <SearchInput
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Cari nama kandidat, email, atau skill..."
          className="w-full sm:max-w-md"
        />
        <div className="flex flex-wrap items-center gap-2 sm:ml-auto">
          <FilterSelect value={jobFilter} onChange={(e) => setJobFilter(e.target.value)}>
            <option value="all">Semua Lowongan Pekerjaan</option>
            {jobs.map((j) => (
              <option key={j.id} value={j.id}>
                {j.title}
              </option>
            ))}
          </FilterSelect>
          <FilterSelect value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="all">Semua Status Rekrutmen</option>
            <option value="screening">Screening</option>
            <option value="applied">Applied</option>
            <option value="interview">Interview</option>
            <option value="hired">Hired</option>
            <option value="needs_review">Needs Review</option>
          </FilterSelect>
        </div>
      </Toolbar>

      {/* View Mode Content */}
      {viewMode === 'compare' ? (
        <CandidateComparator
          applications={rows}
          onClose={() => setViewMode('table')}
        />
      ) : viewMode === 'kanban' ? (
        <KanbanBoard
          applications={rows}
          onSelectCandidate={onSelectCandidate}
          onUpdateStatus={onUpdateStatus || (() => {})}
          onDeleteCandidate={onDeleteCandidate}
        />
      ) : (
        <DataTable
          columns={columns}
          rows={rows}
          rowKey={(app) => app.id}
          onRowClick={onSelectCandidate}
          empty={
            <EmptyState
              title="Tidak ada kandidat ditemukan"
              description="Sesuaikan kriteria pencarian kata kunci atau filter posisi pekerjaan."
              actionLabel="Unggah CV Kandidat Baru"
              onAction={onOpenUploadModal}
            />
          }
        />
      )}
    </div>
  );
};

