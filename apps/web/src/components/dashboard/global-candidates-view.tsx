'use client';

import React, { useState } from 'react';
import { CandidateApplication, JobPosting } from '@/lib/types';
import { StatusBadge } from '@/components/ui/status-badge';
import { Users, Search, Filter, ChevronRight } from 'lucide-react';

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
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [jobFilter, setJobFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  const filteredApps = applications.filter((app) => {
    const matchesSearch =
      app.candidate_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (app.cv_extraction.skills || []).some((s) =>
        (s.normalized_name || s.name).toLowerCase().includes(searchTerm.toLowerCase())
      );

    const matchesJob = jobFilter === 'all' || app.job_id === jobFilter;
    const matchesStatus = statusFilter === 'all' || app.status === statusFilter || app.parse_status === statusFilter;

    return matchesSearch && matchesJob && matchesStatus;
  });

  return (
    <div className="space-y-4 text-slate-900">
      {/* Filter & Search Header */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3 rounded-xl border border-slate-300">
        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          <div className="w-8 h-8 rounded-lg bg-indigo-100 border border-indigo-300 text-indigo-800 flex items-center justify-center font-bold">
            <Users className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900">Database Kandidat Global ({applications.length})</h2>
            <p className="text-[11px] text-slate-500">Pencarian seluruh berkas pelamar di semua posisi lowongan.</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto justify-end">
          <div className="relative w-full sm:w-60">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Cari nama, email, skill..."
              className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-800 focus:outline-none focus:border-sky-600 transition"
            />
          </div>

          {/* Job Filter */}
          <select
            value={jobFilter}
            onChange={(e) => setJobFilter(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 focus:outline-none cursor-pointer"
          >
            <option value="all">Semua Lowongan ({jobs.length})</option>
            {jobs.map((j) => (
              <option key={j.id} value={j.id}>
                {j.title}
              </option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 focus:outline-none cursor-pointer"
          >
            <option value="all">Semua Status</option>
            <option value="screening">Screening</option>
            <option value="applied">Applied</option>
            <option value="interview">Interview</option>
            <option value="hired">Hired</option>
            <option value="needs_review">Needs Review (AI)</option>
          </select>
        </div>
      </div>

      {/* Global Table */}
      <div className="bg-white border border-slate-300 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-800">
            <thead className="bg-slate-100 text-slate-700 uppercase text-[11px] font-bold border-b border-slate-300 tracking-wider">
              <tr>
                <th className="px-5 py-3.5">Nama Kandidat</th>
                <th className="px-5 py-3.5">Lowongan Target</th>
                <th className="px-5 py-3.5">Job-Fit Score</th>
                <th className="px-5 py-3.5">Pengalaman</th>
                <th className="px-5 py-3.5">Status Pemrosesan</th>
                <th className="px-5 py-3.5 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredApps.map((app) => {
                const targetJob = jobs.find((j) => j.id === app.job_id);
                return (
                  <tr
                    key={app.id}
                    onClick={() => onSelectCandidate(app)}
                    className="hover:bg-slate-50 transition cursor-pointer group"
                  >
                    <td className="px-5 py-3.5">
                      <div>
                        <span className="font-bold text-slate-900 block group-hover:text-sky-700 transition">
                          {app.candidate_name}
                        </span>
                        <span className="text-xs text-slate-500 font-normal">{app.email}</span>
                      </div>
                    </td>

                    <td className="px-5 py-3.5 text-xs font-semibold text-sky-800">
                      {targetJob?.title || 'Posisi Target'}
                    </td>

                    <td className="px-5 py-3.5 font-mono font-extrabold text-sky-800 text-sm">
                      {app.job_fit_score} %
                    </td>

                    <td className="px-5 py-3.5 text-xs font-semibold text-slate-700">
                      {app.cv_extraction.total_experience_months || 0} Bulan
                    </td>

                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-1.5">
                        <StatusBadge status={app.status} />
                        {app.parse_status !== 'processed' && (
                          <StatusBadge status={app.parse_status} />
                        )}
                      </div>
                    </td>

                    <td className="px-5 py-3.5 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => onSelectCandidate(app)}
                          className="text-xs font-bold text-slate-800 hover:text-white hover:bg-slate-900 px-3 py-1.5 bg-slate-100 border border-slate-300 rounded-lg transition flex items-center gap-1"
                        >
                          <span>Lihat Detail</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

