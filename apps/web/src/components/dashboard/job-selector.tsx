'use client';

import React from 'react';
import { JobPosting } from '@/lib/types';
import { Briefcase, Clock, Code } from 'lucide-react';

interface JobSelectorProps {
  jobs: JobPosting[];
  selectedJobId: string;
  onSelectJob: (jobId: string) => void;
}

export const JobSelector: React.FC<JobSelectorProps> = ({
  jobs,
  selectedJobId,
  onSelectJob,
}) => {
  const selectedJob = jobs.find((j) => j.id === selectedJobId) || jobs[0];

  return (
    <div className="bg-white p-4 rounded-xl border border-slate-300 space-y-3">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-sky-100 border border-sky-300 text-sky-800 flex items-center justify-center font-bold">
            <Briefcase className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900">Pilih Lowongan Pekerjaan Target</h2>
            <p className="text-[11px] text-slate-500">
              Kandidat dan formula Job-Fit Score disesuaikan dengan posisi yang dipilih.
            </p>
          </div>
        </div>

        {/* Tab pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 max-w-full">
          {jobs.map((job) => {
            const isSelected = job.id === selectedJobId;
            return (
              <button
                key={job.id}
                onClick={() => onSelectJob(job.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 shrink-0 ${
                  isSelected
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-300'
                }`}
              >
                <span>{job.title}</span>
                <span
                  className={`px-1.5 py-0.2 text-[10px] rounded font-mono ${
                    isSelected ? 'bg-white/20 text-white font-bold' : 'bg-slate-200 text-slate-800'
                  }`}
                >
                  {job.applications_count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Job Metadata Summary */}
      {selectedJob && (
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-700 bg-slate-50 p-3 rounded-lg border border-slate-300">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1 text-slate-700 font-medium">
              <Clock className="w-3.5 h-3.5 text-sky-700" />
              Syarat Pengalaman: <strong className="text-slate-900">Min. {selectedJob.minimum_experience_months} Bulan</strong>
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1 text-slate-700 font-medium">
              <Code className="w-3.5 h-3.5 text-emerald-700" />
              Skill Wajib:
            </span>
            <div className="flex flex-wrap gap-1">
              {selectedJob.mandatory_skills.map((skill) => (
                <span
                  key={skill}
                  className="px-2 py-0.5 bg-emerald-50 text-emerald-900 border border-emerald-300 text-[11px] rounded font-semibold"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

