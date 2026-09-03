'use client';

import React, { useState, useEffect } from 'react';
import { CandidateApplication, JobPosting } from '@/lib/types';
import { WorkExperienceDTO, EducationDTO, PortfolioDTO, ReferenceDTO } from '@cv-ats/contracts';
import {
  calculateJobFitScore,
  constructExecutiveSummary,
  parseAndNormalizePhoneNumber,
} from '@/lib/utils';
import { Save, Plus, Trash2, Sparkles } from 'lucide-react';
import { Overlay, Field, Input, Textarea, Button, SectionLabel } from '@/components/ui';

interface ExtractionReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  application: CandidateApplication | null;
  job: JobPosting | null;
  onSaveSuccess: (updatedApp: CandidateApplication) => void;
}

const splitList = (value: string) =>
  value
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

const EntryCard: React.FC<{
  label: string;
  onDelete: () => void;
  children: React.ReactNode;
}> = ({ label, onDelete, children }) => (
  <div className="bg-surface rounded p-3 space-y-2.5">
    <div className="flex justify-between items-center border-b border-line pb-1.5">
      <span className="font-mono text-[10px] font-bold text-ink-subtle uppercase">{label}</span>
      <button
        type="button"
        onClick={onDelete}
        className="text-ink-subtle hover:text-danger p-1 rounded transition-colors"
        aria-label="Hapus entri"
      >
        <Trash2 className="w-3.5 h-3.5" />
      </button>
    </div>
    {children}
  </div>
);

const AddButton: React.FC<{ onClick: () => void; label: string }> = ({ onClick, label }) => (
  <Button
    type="button"
    variant="secondary"
    size="sm"
    onClick={onClick}
    iconLeft={<Plus className="w-3.5 h-3.5" />}
  >
    {label}
  </Button>
);

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
      setPhone(
        parseAndNormalizePhoneNumber(
          application.cv_extraction.contact.phone_number || application.phone_number || ''
        )
      );
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

  const addEducation = () =>
    setEducations((prev) => [
      ...prev,
      {
        institution: 'Universitas / Institut Baru',
        degree: 'Sarjana (S1)',
        major: 'Teknik Informatika',
        start_year: 2018,
        end_year: 2022,
      },
    ]);
  const updateEducation = (index: number, patch: Partial<EducationDTO>) =>
    setEducations((prev) => prev.map((edu, i) => (i === index ? { ...edu, ...patch } : edu)));
  const deleteEducation = (index: number) =>
    setEducations((prev) => prev.filter((_, i) => i !== index));

  const addExperience = () =>
    setWorkExperiences((prev) => [
      ...prev,
      {
        company: 'Nama Perusahaan / Proyek Baru',
        role: 'Software Developer',
        start_date: '2023-01',
        end_date: 'Present',
        is_current: true,
        duration_months: 12,
        description: 'Tanggung jawab utama dan kontribusi proyek.',
        projects: ['Proyek Utama'],
      },
    ]);
  const updateExperience = (index: number, patch: Partial<WorkExperienceDTO>) =>
    setWorkExperiences((prev) => prev.map((exp, i) => (i === index ? { ...exp, ...patch } : exp)));
  const deleteExperience = (index: number) =>
    setWorkExperiences((prev) => prev.filter((_, i) => i !== index));

  const addPortfolio = () =>
    setPortfolios((prev) => [
      ...prev,
      {
        title: 'Judul Portofolio / Proyek Baru',
        url: 'https://github.com/username/project',
        description: 'Deskripsi singkat portofolio karya.',
      },
    ]);
  const updatePortfolio = (index: number, patch: Partial<PortfolioDTO>) =>
    setPortfolios((prev) => prev.map((p, i) => (i === index ? { ...p, ...patch } : p)));
  const deletePortfolio = (index: number) =>
    setPortfolios((prev) => prev.filter((_, i) => i !== index));

  const addReference = () =>
    setReferences((prev) => [
      ...prev,
      {
        name: 'Nama Pemberi Referensi',
        role: 'Manager / Supervisor',
        company: 'Nama Perusahaan',
        contact_info: 'email@example.com / +62 812-xxxx-xxxx',
      },
    ]);
  const updateReference = (index: number, patch: Partial<ReferenceDTO>) =>
    setReferences((prev) => prev.map((r, i) => (i === index ? { ...r, ...patch } : r)));
  const deleteReference = (index: number) =>
    setReferences((prev) => prev.filter((_, i) => i !== index));

  const handleRegenerateSummary = () => {
    const skillList = splitList(skillsText);
    const totalMonths = workExperiences.reduce(
      (sum, item) => sum + (Number(item.duration_months) || 0),
      0
    );
    const companies = workExperiences.map((w) => w.company || '').filter((c) => c.length > 0);
    setSummary(
      constructExecutiveSummary(fullName || 'Kandidat', totalMonths || 24, skillList, job.title, companies)
    );
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    const updatedSkills = splitList(skillsText).map((name) => ({
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

    onSaveSuccess({
      ...application,
      candidate_name: fullName,
      email,
      phone_number: phone,
      cv_extraction: updatedExtraction,
      job_fit_score: score,
      score_breakdown: breakdown,
    });
    onClose();
  };

  return (
    <Overlay
      isOpen={isOpen}
      onClose={onClose}
      size="2xl"
      title="Koreksi data ekstraksi"
      footer={
        <>
          <Button variant="ghost" size="sm" onClick={onClose}>
            Batal
          </Button>
          <Button size="sm" type="submit" form="extraction-form" iconLeft={<Save className="w-4 h-4" />}>
            Simpan & hitung ulang
          </Button>
        </>
      }
    >
      <form id="extraction-form" onSubmit={handleSave} className="space-y-5 text-xs">
        <div className="bg-surface rounded p-3 space-y-3">
          <SectionLabel>Kontak & ringkasan</SectionLabel>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Field label="Nama lengkap" required>
              <Input required value={fullName} onChange={(e) => setFullName(e.target.value)} />
            </Field>
            <Field label="Email" required>
              <Input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
            </Field>
            <Field label="No. telepon">
              <Input value={phone} onChange={(e) => setPhone(e.target.value)} />
            </Field>
          </div>

          <Field
            label={
              <span className="flex items-center justify-between w-full">
                Ringkasan profil
                <button
                  type="button"
                  onClick={handleRegenerateSummary}
                  className="text-[11px] font-bold text-accent hover:underline flex items-center gap-1"
                >
                  <Sparkles className="w-3 h-3" /> Regenerasi AI
                </button>
              </span>
            }
          >
            <Textarea rows={2} value={summary} onChange={(e) => setSummary(e.target.value)} />
          </Field>

          <Field label="Skill teknis" hint="Dipisahkan koma.">
            <Input value={skillsText} onChange={(e) => setSkillsText(e.target.value)} />
          </Field>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <SectionLabel>Pengalaman kerja & proyek ({workExperiences.length})</SectionLabel>
            <AddButton onClick={addExperience} label="Tambah" />
          </div>

          {workExperiences.length === 0 ? (
            <p className="text-ink-subtle italic text-center py-3">Belum ada entri.</p>
          ) : (
            <div className="space-y-2">
              {workExperiences.map((exp, idx) => (
                <EntryCard key={idx} label={`Entri #${idx + 1}`} onDelete={() => deleteExperience(idx)}>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <Field label="Perusahaan / proyek">
                      <Input
                        value={exp.company || ''}
                        onChange={(e) => updateExperience(idx, { company: e.target.value })}
                      />
                    </Field>
                    <Field label="Peran">
                      <Input
                        value={exp.role || ''}
                        onChange={(e) => updateExperience(idx, { role: e.target.value })}
                      />
                    </Field>
                    <Field label="Durasi (bulan)">
                      <Input
                        type="number"
                        min={0}
                        value={exp.duration_months || 0}
                        onChange={(e) =>
                          updateExperience(idx, { duration_months: Number(e.target.value) })
                        }
                        className="font-mono"
                      />
                    </Field>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <Field label="Periode">
                      <div className="flex items-center gap-2">
                        <Input
                          value={exp.start_date || ''}
                          onChange={(e) => updateExperience(idx, { start_date: e.target.value })}
                          placeholder="2023-01"
                        />
                        <span className="text-ink-subtle">s/d</span>
                        <Input
                          value={exp.end_date || ''}
                          onChange={(e) => updateExperience(idx, { end_date: e.target.value })}
                          placeholder="Present"
                        />
                      </div>
                    </Field>
                    <Field label="Proyek kunci" hint="Dipisahkan koma.">
                      <Input
                        value={(exp.projects || []).join(', ')}
                        onChange={(e) => updateExperience(idx, { projects: splitList(e.target.value) })}
                      />
                    </Field>
                  </div>
                  <Field label="Deskripsi">
                    <Textarea
                      rows={2}
                      value={exp.description || ''}
                      onChange={(e) => updateExperience(idx, { description: e.target.value })}
                    />
                  </Field>
                </EntryCard>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <SectionLabel>Pendidikan ({educations.length})</SectionLabel>
            <AddButton onClick={addEducation} label="Tambah" />
          </div>

          {educations.length === 0 ? (
            <p className="text-ink-subtle italic text-center py-3">Belum ada entri.</p>
          ) : (
            <div className="space-y-2">
              {educations.map((edu, idx) => (
                <EntryCard key={idx} label={`Pendidikan #${idx + 1}`} onDelete={() => deleteEducation(idx)}>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <Field label="Institusi">
                      <Input
                        value={edu.institution || ''}
                        onChange={(e) => updateEducation(idx, { institution: e.target.value })}
                      />
                    </Field>
                    <Field label="Jenjang">
                      <Input
                        value={edu.degree || ''}
                        onChange={(e) => updateEducation(idx, { degree: e.target.value })}
                      />
                    </Field>
                    <Field label="Jurusan">
                      <Input
                        value={edu.major || ''}
                        onChange={(e) => updateEducation(idx, { major: e.target.value })}
                      />
                    </Field>
                    <Field label="Tahun">
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          value={edu.start_year || 2018}
                          onChange={(e) => updateEducation(idx, { start_year: Number(e.target.value) })}
                          className="font-mono"
                        />
                        <span className="text-ink-subtle">s/d</span>
                        <Input
                          type="number"
                          value={edu.end_year || 2022}
                          onChange={(e) => updateEducation(idx, { end_year: Number(e.target.value) })}
                          className="font-mono"
                        />
                      </div>
                    </Field>
                  </div>
                </EntryCard>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <SectionLabel>Portofolio ({portfolios.length})</SectionLabel>
            <AddButton onClick={addPortfolio} label="Tambah" />
          </div>

          {portfolios.length === 0 ? (
            <p className="text-ink-subtle italic text-center py-3">Belum ada entri.</p>
          ) : (
            <div className="space-y-2">
              {portfolios.map((p, idx) => (
                <EntryCard key={idx} label={`Portofolio #${idx + 1}`} onDelete={() => deletePortfolio(idx)}>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <Field label="Judul">
                      <Input
                        value={p.title || ''}
                        onChange={(e) => updatePortfolio(idx, { title: e.target.value })}
                      />
                    </Field>
                    <Field label="URL">
                      <Input
                        value={p.url || ''}
                        onChange={(e) => updatePortfolio(idx, { url: e.target.value })}
                        className="font-mono"
                      />
                    </Field>
                  </div>
                </EntryCard>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <SectionLabel>Referensi kerja ({references.length})</SectionLabel>
            <AddButton onClick={addReference} label="Tambah" />
          </div>

          {references.length === 0 ? (
            <p className="text-ink-subtle italic text-center py-3">Belum ada entri.</p>
          ) : (
            <div className="space-y-2">
              {references.map((r, idx) => (
                <EntryCard key={idx} label={`Referensi #${idx + 1}`} onDelete={() => deleteReference(idx)}>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <Field label="Nama">
                      <Input
                        value={r.name || ''}
                        onChange={(e) => updateReference(idx, { name: e.target.value })}
                      />
                    </Field>
                    <Field label="Jabatan & perusahaan">
                      <Input
                        value={r.role || ''}
                        onChange={(e) =>
                          updateReference(idx, {
                            role: e.target.value,
                            company: r.company || 'Perusahaan',
                          })
                        }
                      />
                    </Field>
                    <Field label="Kontak">
                      <Input
                        value={r.contact_info || ''}
                        onChange={(e) => updateReference(idx, { contact_info: e.target.value })}
                        className="font-mono"
                      />
                    </Field>
                  </div>
                </EntryCard>
              ))}
            </div>
          )}
        </div>
      </form>
    </Overlay>
  );
};
