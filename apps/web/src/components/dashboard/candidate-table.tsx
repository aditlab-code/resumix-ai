'use client';

import React, { useState } from 'react';
import { CandidateApplication } from '@/lib/types';
import { StatusBadge } from '@/components/ui/status-badge';
import { EmptyState } from '@/components/ui/empty-state';
import { Search, Filter, ArrowUpDown, ChevronRight, RefreshCw } from 'lucide-react';

interface CandidateTableProps {
  applications: CandidateApplication[];
  onSelectCandidate: (app: CandidateApplication) => void;
  onReprocessCv: (appId: string) => void;
  onOpenUploadModal: () => void;
  onDeleteCandidate: (app: CandidateApplication) => void;
}

export const CandidateTable: React.FC<CandidateTableProps> = ({
  applications,
  onSelectCandidate,
  onReprocessCv,
  onOpenUploadModal,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'score_desc' | 'score_asc' | 'date_desc'>('score_desc');

  // Filter & Search Logic
  const filteredApplications = applications.filter((app) => {
    const matchesSearch =
      app.candidate_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (app.cv_extraction.skills || []).some((s) =>
        (s.normalized_name || s.name).toLowerCase().includes(searchTerm.toLowerCase())
      );

    const matchesStatus =
      statusFilter === 'all'
        ? true
        : app.status === statusFilter || app.parse_status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Sorting
  const sortedApplications = [...filteredApplications].sort((a, b) => {
    if (sortBy === 'score_desc') return b.job_fit_score - a.job_fit_score;
    if (sortBy === 'score_asc') return a.job_fit_score - b.job_fit_score;
    if (sortBy === 'date_desc')
      return new Date(b.applied_at).getTime() - new Date(a.applied_at).getTime();
    return 0;
  });

  return (
    <div className="space-y-3">
      {/* Search, Filter & Sort Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3 rounded-xl border border-slate-300">
        {/* Search input */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Cari kandidat, email, skill..."
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-800 focus:outline-none focus:border-sky-600 placeholder:text-slate-400 transition"
          />
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
          {/* Status Filter */}
          <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-300 text-xs">
            <Filter className="w-3.5 h-3.5 text-slate-500" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-transparent text-slate-700 font-semibold focus:outline-none cursor-pointer text-xs"
            >
              <option value="all">Semua Status</option>
              <option value="screening">Screening</option>
              <option value="applied">Applied</option>
              <option value="interview">Interview</option>
              <option value="hired">Hired</option>
              <option value="needs_review">Needs Review (AI)</option>
              <option value="failed">Failed Parsing (AI)</option>
            </select>
          </div>

          {/* Sort By */}
          <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-300 text-xs">
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-500" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-transparent text-slate-700 font-semibold focus:outline-none cursor-pointer text-xs"
            >
              <option value="score_desc">Skor Tertinggi ➔ Terendah</option>
              <option value="score_asc">Skor Terendah ➔ Tertinggi</option>
              <option value="date_desc">Tanggal Terbaru</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      {sortedApplications.length === 0 ? (
        <EmptyState
          title="Tidak Ada Kandidat Ditemukan"
          description="Cobalah menyesuaikan kata kunci pencarian atau filter status yang Anda pilih."
          actionLabel="+ Unggah CV Kandidat Baru"
          onAction={onOpenUploadModal}
        />
      ) : (
        <div className="bg-white border border-slate-300 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-800">
              <thead className="bg-slate-100 text-slate-700 uppercase text-[11px] font-bold border-b border-slate-300 tracking-wider">
                <tr>
                  <th className="px-5 py-3.5">Kandidat</th>
                  <th className="px-5 py-3.5">Job-Fit Score</th>
                  <th className="px-5 py-3.5">Pengalaman</th>
                  <th className="px-5 py-3.5">Status Pemrosesan</th>
                  <th className="px-5 py-3.5 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {sortedApplications.map((app) => {
                  const isHighMatch = app.job_fit_score >= 80;
                  const isMidMatch = app.job_fit_score >= 60;

                  return (
                    <tr
                      key={app.id}
                      onClick={() => onSelectCandidate(app)}
                      className="hover:bg-slate-50 transition cursor-pointer group"
                    >
                      {/* Candidate Name & Email */}
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-slate-200 border border-slate-300 flex items-center justify-center font-extrabold text-slate-800 text-xs">
                            {app.candidate_name.charAt(0)}
                          </div>
                          <div>
                            <span className="font-bold text-slate-900 block group-hover:text-sky-700 transition">
                              {app.candidate_name}
                            </span>
                            <span className="text-xs font-normal text-slate-500 block">
                              {app.email}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Job Fit Score */}
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2">
                          <span
                            className={`font-mono font-extrabold text-sm ${
                              isHighMatch
                                ? 'text-sky-700'
                                : isMidMatch
                                ? 'text-slate-800'
                                : 'text-amber-700'
                            }`}
                          >
                            {app.job_fit_score} %
                          </span>
                          <span className="text-[10px] text-slate-500 font-mono">
                            (Skill Matched: {app.score_breakdown.matched_skills.length})
                          </span>
                        </div>
                      </td>

                      {/* Experience */}
                      <td className="px-5 py-3.5 text-slate-700 font-semibold text-xs">
                        {app.cv_extraction.total_experience_months || 0} Bulan
                      </td>

                      {/* Statuses */}
                      <td className="px-5 py-3.5">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <StatusBadge status={app.status} />
                          {app.parse_status !== 'processed' && (
                            <StatusBadge status={app.parse_status} />
                          )}
                        </div>
                      </td>

                      {/* Action Buttons */}
                      <td className="px-5 py-3.5 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1.5">
                          {app.parse_status === 'failed' ? (
                            <button
                              onClick={() => onReprocessCv(app.id)}
                              className="text-xs font-semibold text-amber-800 hover:bg-amber-100 px-3 py-1.5 bg-amber-50 border border-amber-300 rounded-lg transition flex items-center gap-1"
                            >
                              <RefreshCw className="w-3.5 h-3.5" />
                              <span>Reprocess</span>
                            </button>
                          ) : (
                            <button
                              onClick={() => onSelectCandidate(app)}
                              className="text-xs font-bold text-slate-800 hover:text-white hover:bg-slate-900 px-3 py-1.5 bg-slate-100 border border-slate-300 rounded-lg transition flex items-center gap-1"
                            >
                              <span>Lihat Detail</span>
                              <ChevronRight className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

