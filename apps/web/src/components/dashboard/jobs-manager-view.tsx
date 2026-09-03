'use client';

import React, { useState } from 'react';
import { JobPosting } from '@/lib/types';
import { Plus, Briefcase, MapPin, Clock, Code, Users, Search, Edit3, Trash2 } from 'lucide-react';

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
  const [searchQuery, setSearchQuery] = useState('');

  const filteredJobs = jobs.filter(
    (j) =>
      j.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      j.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
      j.mandatory_skills.some((s) => s.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="space-y-4 text-slate-900">
      {/* Search & Actions Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-300">
        <div>
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Briefcase className="w-4 h-4 text-sky-700" />
            Daftar Lowongan Pekerjaan ({jobs.length})
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Kelola kriteria posisi, syarat minimum pengalaman, dan skill wajib.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari posisi, divisi, skill..."
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-800 focus:outline-none focus:border-sky-600 placeholder:text-slate-400 transition"
            />
          </div>
        </div>
      </div>

      {/* Job Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredJobs.map((job) => (
          <div
            key={job.id}
            className="bg-white border border-slate-300 rounded-xl p-4 transition space-y-3 flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[10px] font-mono font-bold uppercase bg-slate-100 text-slate-700 px-2 py-0.5 rounded border border-slate-300">
                    {job.department}
                  </span>
                  <h3 className="text-base font-bold text-slate-900 mt-1.5">{job.title}</h3>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => onEditJob(job)}
                    className="p-1.5 text-slate-500 hover:text-sky-700 hover:bg-slate-100 rounded-lg transition"
                    title="Edit Lowongan"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onDeleteJob(job.id)}
                    className="p-1.5 text-slate-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition"
                    title="Hapus Lowongan"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="space-y-1 text-xs text-slate-700">
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                  <span>{job.location}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                  <span>Min. Pengalaman: <strong>{job.minimum_experience_months} Bulan</strong></span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                  <span>Jumlah Pelamar: <strong className="text-sky-800">{job.applications_count} Pelamar</strong></span>
                </div>
              </div>

              {/* Skills Tags */}
              <div className="space-y-1.5 pt-2 border-t border-slate-200">
                <span className="text-[11px] font-bold text-slate-600 flex items-center gap-1">
                  <Code className="w-3 h-3 text-sky-700" /> Skill Wajib:
                </span>
                <div className="flex flex-wrap gap-1">
                  {job.mandatory_skills.map((skill) => (
                    <span
                      key={skill}
                      className="px-2 py-0.5 bg-slate-100 text-slate-800 text-[10px] font-semibold rounded border border-slate-300"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <button
              onClick={() => onSelectJobForCandidates(job.id)}
              className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-lg border border-slate-300 transition text-center mt-2"
            >
              Lihat Peringkat Pelamar ({job.applications_count})
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

