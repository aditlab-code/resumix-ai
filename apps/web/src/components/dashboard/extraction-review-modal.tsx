'use client';

import React, { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/modal';
import { CandidateApplication, JobPosting } from '@/lib/types';
import { WorkExperienceDTO, EducationDTO, PortfolioDTO, ReferenceDTO } from '@cv-ats/contracts';
import { calculateJobFitScore, constructExecutiveSummary, parseAndNormalizePhoneNumber } from '@/lib/utils';
import { Save, Plus, Trash2, Edit3, Briefcase, GraduationCap, Sparkles, RefreshCw, FolderGit2, Users } from 'lucide-react';

interface ExtractionReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  application: CandidateApplication | null;
  job: JobPosting | null;
  onSaveSuccess: (updatedApp: CandidateApplication) => void;
}

export const ExtractionReviewModal: React.FC<ExtractionReviewModalProps> = ({
  isOpen,
  onClose,
  application,
  job,
  onSaveSuccess,
}) => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [summary, setSummary] = useState('');
  const [skillsText, setSkillsText] = useState('');
  const [workExperiences, setWorkExperiences] = useState<WorkExperienceDTO[]>([]);
  const [educations, setEducations] = useState<EducationDTO[]>([]);
  const [portfolios, setPortfolios] = useState<PortfolioDTO[]>([]);
  const [references, setReferences] = useState<ReferenceDTO[]>([]);

  useEffect(() => {
    if (application) {
      setFullName(application.cv_extraction.full_name || application.candidate_name);
      setEmail(application.cv_extraction.contact.email || application.email);
      setPhone(parseAndNormalizePhoneNumber(application.cv_extraction.contact.phone_number || application.phone_number || ''));
      setSummary(application.cv_extraction.summary || '');
      setSkillsText(
        (application.cv_extraction.skills || [])
          .map((s) => s.normalized_name || s.name)
          .join(', ')
      );
      setWorkExperiences(application.cv_extraction.work_experience || []);
      setEducations(application.cv_extraction.education || []);
      setPortfolios(application.cv_extraction.portfolios || []);
      setReferences(application.cv_extraction.references || []);
    }
  }, [application]);

  if (!application || !job) return null;

  // Education CRUD Handlers
  const handleAddEducation = () => {
    const newItem: EducationDTO = {
      institution: 'Universitas / Institut Baru',
      degree: 'Sarjana (S1)',
      major: 'Teknik Informatika',
      start_year: 2018,
      end_year: 2022,
    };
    setEducations((prev) => [...prev, newItem]);
  };

  const handleUpdateEducation = (index: number, updatedField: Partial<EducationDTO>) => {
    setEducations((prev) =>
      prev.map((edu, i) => (i === index ? { ...edu, ...updatedField } : edu))
    );
  };

  const handleDeleteEducation = (index: number) => {
    setEducations((prev) => prev.filter((_, i) => i !== index));
  };

  // Work Experience CRUD Handlers
  const handleAddExperience = () => {
    const newItem: WorkExperienceDTO = {
      company: 'Nama Perusahaan / Proyek Baru',
      role: 'Software Developer',
      start_date: '2023-01',
      end_date: 'Present',
      is_current: true,
      duration_months: 12,
      description: 'Tanggung jawab utama dan kontribusi proyek.',
      projects: ['Proyek Utama'],
    };
    setWorkExperiences((prev) => [...prev, newItem]);
  };

  const handleUpdateExperience = (index: number, updatedField: Partial<WorkExperienceDTO>) => {
    setWorkExperiences((prev) =>
      prev.map((exp, i) => (i === index ? { ...exp, ...updatedField } : exp))
    );
  };

  const handleDeleteExperience = (index: number) => {
    setWorkExperiences((prev) => prev.filter((_, i) => i !== index));
  };

  // Portfolio CRUD Handlers
  const handleAddPortfolio = () => {
    const newItem: PortfolioDTO = {
      title: 'Judul Portofolio / Proyek Baru',
      url: 'https://github.com/username/project',
      description: 'Deskripsi singkat portofolio karya.',
    };
    setPortfolios((prev) => [...prev, newItem]);
  };

  const handleUpdatePortfolio = (index: number, updatedField: Partial<PortfolioDTO>) => {
    setPortfolios((prev) =>
      prev.map((p, i) => (i === index ? { ...p, ...updatedField } : p))
    );
  };

  const handleDeletePortfolio = (index: number) => {
    setPortfolios((prev) => prev.filter((_, i) => i !== index));
  };

  // Reference CRUD Handlers
  const handleAddReference = () => {
    const newItem: ReferenceDTO = {
      name: 'Nama Pemberi Referensi',
      role: 'Manager / Supervisor',
      company: 'Nama Perusahaan',
      contact_info: 'email@example.com / +62 812-xxxx-xxxx',
    };
    setReferences((prev) => [...prev, newItem]);
  };

  const handleUpdateReference = (index: number, updatedField: Partial<ReferenceDTO>) => {
    setReferences((prev) =>
      prev.map((r, i) => (i === index ? { ...r, ...updatedField } : r))
    );
  };

  const handleDeleteReference = (index: number) => {
    setReferences((prev) => prev.filter((_, i) => i !== index));
  };

  // Regenerate Executive Summary Handler
  const handleRegenerateSummary = () => {
    const skillList = skillsText
      .split(',')
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    const totalMonths = workExperiences.reduce(
      (sum, item) => sum + (Number(item.duration_months) || 0),
      0
    );

    const companies = workExperiences.map((w) => w.company || '').filter((c) => c.length > 0);

    const freshSummary = constructExecutiveSummary(
      fullName || 'Kandidat',
      totalMonths || 24,
      skillList,
      job.title,
      companies
    );

    setSummary(freshSummary);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    const updatedSkillNames = skillsText
      .split(',')
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    const updatedSkills = updatedSkillNames.map((name) => ({
      name,
      normalized_name: name,
      category: 'Technical',
    }));

    const calculatedTotalMonths = workExperiences.reduce(
      (sum, item) => sum + (Number(item.duration_months) || 0),
      0
    );

    const updatedExtraction = {
      ...application.cv_extraction,
      full_name: fullName,
      contact: {
        ...application.cv_extraction.contact,
        email,
        phone_number: parseAndNormalizePhoneNumber(phone),
      },
      summary,
      skills: updatedSkills,
      work_experience: workExperiences,
      education: educations,
      portfolios,
      references,
      total_experience_months: calculatedTotalMonths,
      projects: workExperiences.flatMap((w) => w.projects || []),
    };

    const { score, breakdown } = calculateJobFitScore(updatedExtraction, job);

    const updatedApplication: CandidateApplication = {
      ...application,
      candidate_name: fullName,
      email,
      phone_number: phone,
      cv_extraction: updatedExtraction,
      job_fit_score: score,
      score_breakdown: breakdown,
    };

    onSaveSuccess(updatedApplication);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Koreksi AI Data & Riwayat Kerja / Proyek"
      subtitle="HR dapat mengubah data profil, meregenerasikan Ringkasan AI, menambah/mengedit entri pengalaman kerja, dan merecalculasi skor"
      maxWidth="2xl"
    >
      <form onSubmit={handleSave} className="space-y-6 text-xs text-slate-800">
        {/* Basic Information */}
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
          <h4 className="font-bold text-slate-900 text-xs">1. Informasi Kontak & Ringkasan</h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Nama Lengkap</label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg font-bold text-slate-900 focus:outline-none focus:border-sky-500"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-sky-500"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">No. Telepon</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-sky-500"
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block font-bold text-slate-700">Ringkasan Profil (Executive Summary)</label>
              <button
                type="button"
                onClick={handleRegenerateSummary}
                className="text-[11px] font-bold text-sky-700 hover:text-sky-800 flex items-center gap-1 bg-white px-2 py-0.5 rounded border border-slate-200"
              >
                <Sparkles className="w-3 h-3 text-sky-600" /> Generasikan Ulang Ringkasan AI
              </button>
            </div>
            <textarea
              rows={2}
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-sky-500"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Skill Teknis (Dipisahkan Koma)</label>
            <input
              type="text"
              value={skillsText}
              onChange={(e) => setSkillsText(e.target.value)}
              className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-sky-500"
            />
          </div>
        </div>

        {/* Work Experience & Project CRUD Section */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
              <Briefcase className="w-4 h-4 text-sky-600" />
              2. Manager Riwayat Pengalaman Kerja & Proyek ({workExperiences.length})
            </h4>
            <button
              type="button"
              onClick={handleAddExperience}
              className="px-3 py-1.5 bg-sky-50 hover:bg-sky-100 text-sky-700 font-bold text-xs rounded-xl border border-sky-200 transition flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" /> + Tambah Pengalaman / Proyek
            </button>
          </div>

          {workExperiences.length === 0 ? (
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-center text-slate-400 italic">
              Belum ada riwayat pengalaman kerja/proyek. Klik tombol di atas untuk menambahkan entri baru.
            </div>
          ) : (
            <div className="space-y-3">
              {workExperiences.map((exp, idx) => (
                <div key={idx} className="p-4 bg-white border border-slate-200 rounded-xl space-y-3 relative">
                  <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                    <span className="font-mono text-[10px] font-bold text-sky-700 uppercase bg-sky-50 px-2 py-0.5 rounded border border-sky-200">
                      Entri #{idx + 1}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleDeleteExperience(idx)}
                      className="text-slate-400 hover:text-rose-600 p-1 rounded transition"
                      title="Hapus Entri Pengalaman Ini"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Perusahaan / Klien / Proyek</label>
                      <input
                        type="text"
                        value={exp.company || ''}
                        onChange={(e) => handleUpdateExperience(idx, { company: e.target.value })}
                        placeholder="Contoh: PT Tech / Freelance Project"
                        className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-bold focus:outline-none focus:border-sky-500"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Peran (Role)</label>
                      <input
                        type="text"
                        value={exp.role || ''}
                        onChange={(e) => handleUpdateExperience(idx, { role: e.target.value })}
                        placeholder="Contoh: Backend Developer"
                        className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-sky-500"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Durasi Pengalaman (Bulan)</label>
                      <input
                        type="number"
                        min={0}
                        value={exp.duration_months || 0}
                        onChange={(e) => handleUpdateExperience(idx, { duration_months: Number(e.target.value) })}
                        className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg font-mono font-bold text-slate-900 focus:outline-none focus:border-sky-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Periode (Tgl Mulai — Tgl Selesai)</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={exp.start_date || ''}
                          onChange={(e) => handleUpdateExperience(idx, { start_date: e.target.value })}
                          placeholder="2023-01"
                          className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-sky-500"
                        />
                        <span className="text-slate-400">s/d</span>
                        <input
                          type="text"
                          value={exp.end_date || ''}
                          onChange={(e) => handleUpdateExperience(idx, { end_date: e.target.value })}
                          placeholder="Present"
                          className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-sky-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Daftar Proyek Kunci (Dipisahkan koma)</label>
                      <input
                        type="text"
                        value={(exp.projects || []).join(', ')}
                        onChange={(e) =>
                          handleUpdateExperience(idx, {
                            projects: e.target.value
                              .split(',')
                              .map((p) => p.trim())
                              .filter((p) => p.length > 0),
                          })
                        }
                        placeholder="E-Commerce API, Core Payment Service"
                        className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-sky-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Deskripsi Tanggung Jawab & Pencapaian</label>
                    <textarea
                      rows={2}
                      value={exp.description || ''}
                      onChange={(e) => handleUpdateExperience(idx, { description: e.target.value })}
                      placeholder="Mengembangkan fitur REST API, optimasi query database, integrasi cloud AWS..."
                      className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-sky-500"
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Education History CRUD Section */}
        <div className="space-y-3 pt-3 border-t border-slate-200">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
              <GraduationCap className="w-4 h-4 text-sky-700" />
              3. Manager Riwayat Pendidikan ({educations.length})
            </h4>
            <button
              type="button"
              onClick={handleAddEducation}
              className="px-3 py-1.5 bg-sky-50 hover:bg-sky-100 text-sky-700 font-bold text-xs rounded-xl border border-sky-200 transition flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" /> + Tambah Pendidikan
            </button>
          </div>

          {educations.length === 0 ? (
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-center text-slate-400 italic">
              Belum ada riwayat pendidikan. Klik tombol di atas untuk menambahkan entri baru.
            </div>
          ) : (
            <div className="space-y-3">
              {educations.map((edu, idx) => (
                <div key={idx} className="p-4 bg-white border border-slate-200 rounded-xl space-y-3 relative">
                  <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                    <span className="font-mono text-[10px] font-bold text-sky-700 uppercase bg-sky-50 px-2 py-0.5 rounded border border-sky-200">
                      Pendidikan #{idx + 1}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleDeleteEducation(idx)}
                      className="text-slate-400 hover:text-rose-600 p-1 rounded transition"
                      title="Hapus Entri Pendidikan Ini"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Institusi / Universitas / Sekolah</label>
                      <input
                        type="text"
                        value={edu.institution || ''}
                        onChange={(e) => handleUpdateEducation(idx, { institution: e.target.value })}
                        placeholder="Contoh: Universitas Indonesia"
                        className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-bold focus:outline-none focus:border-sky-500"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Jenjang / Degree</label>
                      <input
                        type="text"
                        value={edu.degree || ''}
                        onChange={(e) => handleUpdateEducation(idx, { degree: e.target.value })}
                        placeholder="Contoh: Sarjana (S1) / Magister (S2)"
                        className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-sky-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Jurusan / Major</label>
                      <input
                        type="text"
                        value={edu.major || ''}
                        onChange={(e) => handleUpdateEducation(idx, { major: e.target.value })}
                        placeholder="Contoh: Teknik Informatika"
                        className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-sky-500"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Tahun (Mulai — Selesai)</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          value={edu.start_year || 2018}
                          onChange={(e) => handleUpdateEducation(idx, { start_year: Number(e.target.value) })}
                          className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-mono focus:outline-none focus:border-sky-500"
                        />
                        <span className="text-slate-400">s/d</span>
                        <input
                          type="number"
                          value={edu.end_year || 2022}
                          onChange={(e) => handleUpdateEducation(idx, { end_year: Number(e.target.value) })}
                          className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-mono focus:outline-none focus:border-sky-500"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Portofolio Karya Manager */}
        <div className="space-y-3 pt-3 border-t border-slate-200">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
              <FolderGit2 className="w-4 h-4 text-blue-700" />
              4. Manager Tautan Portofolio Karya ({portfolios.length})
            </h4>
            <button
              type="button"
              onClick={handleAddPortfolio}
              className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs rounded-xl border border-blue-200 transition flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" /> + Tambah Portofolio
            </button>
          </div>

          {portfolios.length === 0 ? (
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-center text-slate-400 italic text-xs">
              Belum ada tautan portofolio. Klik "+ Tambah Portofolio" untuk menambahkan link GitHub, Figma, Behance, atau Drive.
            </div>
          ) : (
            <div className="space-y-2.5">
              {portfolios.map((p, idx) => (
                <div key={idx} className="p-3 bg-white border border-slate-200 rounded-xl space-y-2 relative">
                  <div className="flex justify-between items-center border-b border-slate-100 pb-1.5">
                    <span className="font-mono text-[10px] font-bold text-blue-700 uppercase bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                      Portofolio #{idx + 1}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleDeletePortfolio(idx)}
                      className="text-slate-400 hover:text-rose-600 p-1 rounded transition"
                      title="Hapus Portofolio Ini"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div>
                      <label className="block font-bold text-slate-700 text-[11px] mb-1">Judul / Nama Proyek</label>
                      <input
                        type="text"
                        value={p.title || ''}
                        onChange={(e) => handleUpdatePortfolio(idx, { title: e.target.value })}
                        placeholder="Contoh: GitHub Code Repository / E-Commerce Figma"
                        className="w-full px-2.5 py-1 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-bold text-xs focus:outline-none focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 text-[11px] mb-1">Tautan / URL Portofolio</label>
                      <input
                        type="text"
                        value={p.url || ''}
                        onChange={(e) => handleUpdatePortfolio(idx, { url: e.target.value })}
                        placeholder="Contoh: https://github.com/username/project"
                        className="w-full px-2.5 py-1 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-mono text-xs focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Referensi Kerja Manager */}
        <div className="space-y-3 pt-3 border-t border-slate-200">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
              <Users className="w-4 h-4 text-emerald-700" />
              5. Manager Referensi Kerja ({references.length})
            </h4>
            <button
              type="button"
              onClick={handleAddReference}
              className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold text-xs rounded-xl border border-emerald-200 transition flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" /> + Tambah Referensi
            </button>
          </div>

          {references.length === 0 ? (
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-center text-slate-400 italic text-xs">
              Belum ada kontak referensi kerja. Klik "+ Tambah Referensi" untuk menambahkan kontak atasan/rekan profesional.
            </div>
          ) : (
            <div className="space-y-2.5">
              {references.map((r, idx) => (
                <div key={idx} className="p-3 bg-white border border-slate-200 rounded-xl space-y-2 relative">
                  <div className="flex justify-between items-center border-b border-slate-100 pb-1.5">
                    <span className="font-mono text-[10px] font-bold text-emerald-700 uppercase bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      Referensi #{idx + 1}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleDeleteReference(idx)}
                      className="text-slate-400 hover:text-rose-600 p-1 rounded transition"
                      title="Hapus Referensi Ini"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <div>
                      <label className="block font-bold text-slate-700 text-[11px] mb-1">Nama Pemberi Referensi</label>
                      <input
                        type="text"
                        value={r.name || ''}
                        onChange={(e) => handleUpdateReference(idx, { name: e.target.value })}
                        placeholder="Contoh: Bpk. Budi Santoso"
                        className="w-full px-2.5 py-1 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-bold text-xs focus:outline-none focus:border-emerald-500"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 text-[11px] mb-1">Jabatan & Perusahaan</label>
                      <input
                        type="text"
                        value={r.role || ''}
                        onChange={(e) => handleUpdateReference(idx, { role: e.target.value, company: r.company || 'Perusahaan' })}
                        placeholder="Contoh: Engineering Manager — TechNusa"
                        className="w-full px-2.5 py-1 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 text-xs focus:outline-none focus:border-emerald-500"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 text-[11px] mb-1">Kontak (Telepon / Email)</label>
                      <input
                        type="text"
                        value={r.contact_info || ''}
                        onChange={(e) => handleUpdateReference(idx, { contact_info: e.target.value })}
                        placeholder="Contoh: +62 812-3456-7890"
                        className="w-full px-2.5 py-1 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-mono text-xs focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Action Buttons */}
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
            <Save className="w-4 h-4" /> Simpan Koreksi & Hitung Ulang Skor
          </button>
        </div>
      </form>
    </Modal>
  );
};
