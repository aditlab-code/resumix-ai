'use client';

import React, { useState } from 'react';
import { Modal } from '@/components/ui/modal';
import { JobPosting } from '@/lib/types';
import { Plus } from 'lucide-react';

interface CreateJobModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateSuccess: (newJob: JobPosting) => void;
}

export const CreateJobModal: React.FC<CreateJobModalProps> = ({
  isOpen,
  onClose,
  onCreateSuccess,
}) => {
  const [title, setTitle] = useState('');
  const [department, setDepartment] = useState('Engineering');
  const [location, setLocation] = useState('Jakarta (Hybrid)');
  const [minExpMonths, setMinExpMonths] = useState(24);
  const [mandatoryStr, setMandatoryStr] = useState('');
  const [preferredStr, setPreferredStr] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const mandatorySkills = mandatoryStr
      .split(',')
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    const preferredSkills = preferredStr
      .split(',')
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    const newJob: JobPosting = {
      id: `job-${Date.now()}`,
      title,
      department,
      location,
      status: 'open',
      minimum_experience_months: Number(minExpMonths),
      mandatory_skills: mandatorySkills.length > 0 ? mandatorySkills : ['Python'],
      preferred_skills: preferredSkills,
      created_at: new Date().toISOString(),
      applications_count: 0,
    };

    onCreateSuccess(newJob);
    onClose();
    setTitle('');
    setMandatoryStr('');
    setPreferredStr('');
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Buat Lowongan Pekerjaan Baru"
      subtitle="Definisikan kriteria pengalaman dan skill wajib untuk formula perhitungan Job-Fit Score AI"
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-xs text-slate-800">
        <div>
          <label className="block font-bold text-slate-700 mb-1">
            Judul Posisi Pekerjaan <span className="text-rose-600">*</span>
          </label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Contoh: Senior Python Backend Developer"
            className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-sky-500 font-medium"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Departemen / Divisi</label>
            <input
              type="text"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-sky-500 font-medium"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Lokasi & Skema Kerja</label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-sky-500 font-medium"
            />
          </div>
        </div>

        <div>
          <label className="block font-bold text-slate-700 mb-1">
            Syarat Minimum Pengalaman (Dalam Bulan) <span className="text-rose-600">*</span>
          </label>
          <input
            type="number"
            required
            min={0}
            value={minExpMonths}
            onChange={(e) => setMinExpMonths(Number(e.target.value))}
            className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-sky-500 font-mono font-semibold"
          />
        </div>

        <div>
          <label className="block font-bold text-slate-700 mb-1">
            Skill Wajib / Mandatory Skills (Dipisahkan Koma) <span className="text-rose-600">*</span>
          </label>
          <input
            type="text"
            required
            value={mandatoryStr}
            onChange={(e) => setMandatoryStr(e.target.value)}
            placeholder="Python, PostgreSQL, Docker"
            className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-sky-500 font-mono font-medium"
          />
          <p className="text-[10px] text-slate-500 mt-1">
            Skill di atas akan diberi bobot 30% pada formula kelulusan otomatis.
          </p>
        </div>

        <div>
          <label className="block font-bold text-slate-700 mb-1">
            Skill Tambahan / Preferred Skills (Dipisahkan Koma)
          </label>
          <input
            type="text"
            value={preferredStr}
            onChange={(e) => setPreferredStr(e.target.value)}
            placeholder="Redis, FastAPI, Kubernetes, gRPC"
            className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-sky-500 font-mono font-medium"
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
            <Plus className="w-4 h-4" /> Terbitkan Lowongan Baru
          </button>
        </div>
      </form>
    </Modal>
  );
};
