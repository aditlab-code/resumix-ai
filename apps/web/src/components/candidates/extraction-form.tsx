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
import { Field, Input, Textarea, Button, SectionLabel } from '@/components/ui';

interface ExtractionFormProps {
  application: CandidateApplication;
  job: JobPosting;
  onSave: (updatedApp: CandidateApplication) => void;
  onCancel: () => void;
}

const splitList = (value: string) =>
  value
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

const EntryCard: React.FC<{ label: string; onDelete: () => void; children: React.ReactNode }> = ({
  label,
  onDelete,
  children,
}) => (
  <div className="bg-canvas rounded p-3 space-y-2.5">
    <div className="flex justify-between items-center border-b border-line pb-1.5">
      <span className="font-mono text-[10px] font-bold text-ink-subtle uppercase">{label}</span>
      <button
        type="button"
        onClick={onDelete}
        className="text-ink-subtle hover:text-danger p-1 rounded transition-colors"
        aria-label="Delete entry"
      >
        <Trash2 className="w-3.5 h-3.5" />
      </button>
    </div>
    {children}
  </div>
);

const AddButton: React.FC<{ onClick: () => void }> = ({ onClick }) => (
  <Button
    type="button"
    variant="secondary"
    size="sm"
    onClick={onClick}
    iconLeft={<Plus className="w-3.5 h-3.5" />}
  >
    Add
  </Button>
);

export const ExtractionForm: React.FC<ExtractionFormProps> = ({
  application,
  job,
  onSave,
  onCancel,
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
  }, [application]);

  const addEducation = () =>
    setEducations((prev) => [
      ...prev,
      {
        institution: 'New University / Institute',
        degree: 'Bachelor',
        major: 'Computer Science',
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
        company: 'New Company / Project Name',
        role: 'Software Developer',
        start_date: '2023-01',
        end_date: 'Present',
        is_current: true,
        duration_months: 12,
        description: 'Key responsibilities and project contributions.',
        projects: ['Main Project'],
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
        title: 'New Portfolio / Project Title',
        url: 'https://github.com/username/project',
        description: 'Short portfolio description.',
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
        name: 'Reference Contact Name',
        role: 'Manager / Supervisor',
        company: 'Company Name',
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
      constructExecutiveSummary(fullName || 'Candidate', totalMonths || 24, skillList, job.title, companies)
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
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

    onSave({
      ...application,
      candidate_name: fullName,
      email,
      phone_number: phone,
      cv_extraction: updatedExtraction,
      job_fit_score: score,
      score_breakdown: breakdown,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5 text-xs">
      <div className="bg-canvas rounded p-3 space-y-3">
        <SectionLabel>Contact &amp; Summary</SectionLabel>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Field label="Full Name" required>
            <Input required value={fullName} onChange={(e) => setFullName(e.target.value)} />
          </Field>
          <Field label="Email" required>
            <Input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
          </Field>
          <Field label="Phone Number">
            <Input value={phone} onChange={(e) => setPhone(e.target.value)} />
          </Field>
        </div>

        <Field
          label={
            <span className="flex items-center justify-between w-full">
              Profile Summary
              <button
                type="button"
                onClick={handleRegenerateSummary}
                className="text-[11px] font-bold text-brand-accent hover:underline flex items-center gap-1"
              >
                <Sparkles className="w-3 h-3" /> AI Regenerate
              </button>
            </span>
          }
        >
          <Textarea rows={2} value={summary} onChange={(e) => setSummary(e.target.value)} />
        </Field>

        <Field label="Technical Skills" hint="Comma-separated.">
          <Input value={skillsText} onChange={(e) => setSkillsText(e.target.value)} />
        </Field>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <SectionLabel>Work Experience &amp; Projects ({workExperiences.length})</SectionLabel>
          <AddButton onClick={addExperience} />
        </div>
        {workExperiences.length === 0 ? (
          <p className="text-ink-subtle italic text-center py-3">No entries yet.</p>
        ) : (
          <div className="space-y-2">
            {workExperiences.map((exp, idx) => (
              <EntryCard key={idx} label={`Entry #${idx + 1}`} onDelete={() => deleteExperience(idx)}>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <Field label="Company / Project">
                    <Input
                      value={exp.company || ''}
                      onChange={(e) => updateExperience(idx, { company: e.target.value })}
                    />
                  </Field>
                  <Field label="Role">
                    <Input
                      value={exp.role || ''}
                      onChange={(e) => updateExperience(idx, { role: e.target.value })}
                    />
                  </Field>
                  <Field label="Duration (Months)">
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
                  <Field label="Period">
                    <div className="flex items-center gap-2">
                      <Input
                        value={exp.start_date || ''}
                        onChange={(e) => updateExperience(idx, { start_date: e.target.value })}
                        placeholder="2023-01"
                      />
                      <span className="text-ink-subtle">to</span>
                      <Input
                        value={exp.end_date || ''}
                        onChange={(e) => updateExperience(idx, { end_date: e.target.value })}
                        placeholder="Present"
                      />
                    </div>
                  </Field>
                  <Field label="Key Projects" hint="Comma-separated.">
                    <Input
                      value={(exp.projects || []).join(', ')}
                      onChange={(e) => updateExperience(idx, { projects: splitList(e.target.value) })}
                    />
                  </Field>
                </div>
                <Field label="Description">
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
          <SectionLabel>Education ({educations.length})</SectionLabel>
          <AddButton onClick={addEducation} />
        </div>
        {educations.length === 0 ? (
          <p className="text-ink-subtle italic text-center py-3">No entries yet.</p>
        ) : (
          <div className="space-y-2">
            {educations.map((edu, idx) => (
              <EntryCard key={idx} label={`Education #${idx + 1}`} onDelete={() => deleteEducation(idx)}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Field label="Institution">
                    <Input
                      value={edu.institution || ''}
                      onChange={(e) => updateEducation(idx, { institution: e.target.value })}
                    />
                  </Field>
                  <Field label="Degree">
                    <Input
                      value={edu.degree || ''}
                      onChange={(e) => updateEducation(idx, { degree: e.target.value })}
                    />
                  </Field>
                  <Field label="Major">
                    <Input
                      value={edu.major || ''}
                      onChange={(e) => updateEducation(idx, { major: e.target.value })}
                    />
                  </Field>
                  <Field label="Years">
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        value={edu.start_year || 2018}
                        onChange={(e) => updateEducation(idx, { start_year: Number(e.target.value) })}
                        className="font-mono"
                      />
                      <span className="text-ink-subtle">to</span>
                      <Input
                        type="number"
                        value={edu.end_year || 2022}
                        onChange={(e) => updateEducation(idx, { end_year: Number(e.target.value) })}
                        className="font-mono"
                      />
                    </div>
                  </Field>
                  <Field label="IPK / GPA">
                    <Input
                      value={edu.gpa !== undefined && edu.gpa !== null ? String(edu.gpa) : ''}
                      onChange={(e) => updateEducation(idx, { gpa: e.target.value })}
                      placeholder="e.g. 3.85"
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
          <SectionLabel>Portfolio ({portfolios.length})</SectionLabel>
          <AddButton onClick={addPortfolio} />
        </div>
        {portfolios.length === 0 ? (
          <p className="text-ink-subtle italic text-center py-3">No entries yet.</p>
        ) : (
          <div className="space-y-2">
            {portfolios.map((p, idx) => (
              <EntryCard key={idx} label={`Portfolio #${idx + 1}`} onDelete={() => deletePortfolio(idx)}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Field label="Title">
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
          <SectionLabel>Work References ({references.length})</SectionLabel>
          <AddButton onClick={addReference} />
        </div>
        {references.length === 0 ? (
          <p className="text-ink-subtle italic text-center py-3">No entries yet.</p>
        ) : (
          <div className="space-y-2">
            {references.map((r, idx) => (
              <EntryCard key={idx} label={`Reference #${idx + 1}`} onDelete={() => deleteReference(idx)}>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <Field label="Name">
                    <Input
                      value={r.name || ''}
                      onChange={(e) => updateReference(idx, { name: e.target.value })}
                    />
                  </Field>
                  <Field label="Role & Company">
                    <Input
                      value={r.role || ''}
                      onChange={(e) =>
                        updateReference(idx, {
                          role: e.target.value,
                          company: r.company || 'Company',
                        })
                      }
                    />
                  </Field>
                  <Field label="Contact">
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

      <div className="flex items-center justify-end gap-2 pt-3 border-t border-line sticky bottom-0 bg-surface pb-1">
        <Button variant="ghost" size="sm" type="button" onClick={onCancel}>
          Cancel
        </Button>
        <Button size="sm" type="submit" iconLeft={<Save className="w-4 h-4" />}>
          Save &amp; Recalculate
        </Button>
      </div>
    </form>
  );
};
