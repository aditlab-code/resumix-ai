'use client';

import React, { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/modal';
import { JobPosting } from '@/lib/types';
import { Briefcase, Edit3 } from 'lucide-react';

interface EditJobModalProps {
  isOpen: boolean;
  onClose: () => void;
  job: JobPosting | null;
  onSaveSuccess: (updatedJob: JobPosting) => void;
}

export const EditJobModal: React.FC<EditJobModalProps> = ({
  isOpen,
  onClose,
  job,
  onSaveSuccess,
}) => {
  const [title, setTitle] = useState('');
  const [department, setDepartment] = useState('');
  const [location, setLocation] = useState('');
  const [minExpMonths, setMinExpMonths] = useState(24);
  const [mandatorySkillsText, setMandatorySkillsText] = useState('');
  const [preferredSkillsText, setPreferredSkillsText] = useState('');

  useEffect(() => {
    if (job) {
      setTitle(job.title);
      setDepartment(job.department);
      setLocation(job.location);
      setMinExpMonths(job.minimum_experience_months);
      setMandatorySkillsText(job.mandatory_skills.join(', '));
      setPreferredSkillsText(job.preferred_skills.join(', '));
    }
  }, [job]);

  if (!job) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const mandatorySkills = mandatorySkillsText
      .split(',')
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    const preferredSkills = preferredSkillsText
      .split(',')
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    const updatedJob: JobPosting = {
      ...job,
      title,
      department,
      location,
      minimum_experience_months: Number(minExpMonths),
      mandatory_skills: mandatorySkills,
      preferred_skills: preferredSkills,
    };

    onSaveSuccess(updatedJob);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Edit Kriteria Lowongan Kerja"
      subtitle="Perbarui posisi, syarat minimum pengalaman, dan daftar skill wajib untuk kalkulasi ATS"
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-xs text-slate-800">
        <div>
          <label className="block font-bold text-slate-700 mb-1">
            Judul Posisi Lowongan <span className="text-rose-600">*</span>
          </label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:border-sky-500"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Divisi / Departemen <span className="text-rose-600">*</span>
            </label>
            <input
              type="text"
              required
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-sky-500"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Lokasi Kerja</label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-sky-500"
            />
          </div>
        </div>

        <div>
          <label className="block font-bold text-slate-700 mb-1">
            Syarat Minimum Pengalaman Kerja (Bulan)
          </label>
          <input
            type="number"
            min={0}
            value={minExpMonths}
            onChange={(e) => setMinExpMonths(Number(e.target.value))}
            className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono font-bold text-slate-900 focus:outline-none focus:border-sky-500"
          />
        </div>

        <div>
          <label className="block font-bold text-slate-700 mb-1">
            Skill Wajib / Mandatory (Dipisahkan koma) <span className="text-rose-600">*</span>
          </label>
          <input
            type="text"
            required
            value={mandatorySkillsText}
            onChange={(e) => setMandatorySkillsText(e.target.value)}
            placeholder="Python, PostgreSQL, Docker"
            className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-sky-500"
          />
        </div>

        <div>
          <label className="block font-bold text-slate-700 mb-1">
            Skill Tambahan / Preferred (Dipisahkan koma)
          </label>
          <input
            type="text"
            value={preferredSkillsText}
            onChange={(e) => setPreferredSkillsText(e.target.value)}
            placeholder="Redis, FastAPI, Kubernetes"
            className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-sky-500"
          />
        </div>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 font-semibold text-slate-500 hover:text-slate-800 transition"
          >
            Batal
          </button>
          <button
            type="submit"
            className="px-5 py-2.5 bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs rounded-lg border border-sky-600 transition flex items-center gap-1.5"
          >
            <Edit3 className="w-4 h-4" /> Simpan Perubahan Lowongan
          </button>
        </div>
      </form>
    </Modal>
  );
};
