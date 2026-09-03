'use client';

import React from 'react';
import { CVExtractionDTO } from '@cv-ats/contracts';
import {
  Mail,
  Phone,
  MapPin,
  Briefcase,
  GraduationCap,
  Award,
  Code,
  AlertTriangle,
  ExternalLink,
  FolderGit2,
} from 'lucide-react';
import { Card, SectionLabel } from '@/components/ui';

interface CandidateProfileProps {
  extraction: CVExtractionDTO;
}

export const CandidateProfile: React.FC<CandidateProfileProps> = ({ extraction }) => (
  <div className="space-y-4">
    <Card className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <h3>{extraction.full_name || 'Nama tidak ditemukan'}</h3>
        <span className="text-xs font-semibold px-2 py-0.5 bg-canvas text-ink-muted rounded">
          {extraction.total_experience_months || 0} bln
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-ink-muted pt-2 border-t border-line">
        {extraction.contact?.email && (
          <div className="flex items-center gap-2">
            <Mail className="w-3.5 h-3.5 shrink-0" />
            {extraction.contact.email}
          </div>
        )}
        {extraction.contact?.phone_number && (
          <div className="flex items-center gap-2">
            <Phone className="w-3.5 h-3.5 shrink-0" />
            {extraction.contact.phone_number}
          </div>
        )}
        {extraction.contact?.location && (
          <div className="flex items-center gap-2">
            <MapPin className="w-3.5 h-3.5 shrink-0" />
            {extraction.contact.location}
          </div>
        )}
        {extraction.contact?.linkedin_url && (
          <div className="flex items-center gap-2">
            <ExternalLink className="w-3.5 h-3.5 text-accent shrink-0" />
            <a
              href={extraction.contact.linkedin_url}
              target="_blank"
              rel="noreferrer"
              className="text-accent hover:underline truncate"
            >
              LinkedIn
            </a>
          </div>
        )}
      </div>
    </Card>

    {extraction.summary && (
      <div className="space-y-1.5">
        <SectionLabel>Ringkasan (AI)</SectionLabel>
        <p className="text-xs text-ink bg-surface p-3 rounded leading-relaxed">
          {extraction.summary}
        </p>
      </div>
    )}

    <div className="space-y-2">
      <SectionLabel className="flex items-center gap-1.5">
        <Code className="w-3.5 h-3.5" />
        Keahlian ({extraction.skills?.length || 0})
      </SectionLabel>
      <div className="flex flex-wrap gap-1.5">
        {extraction.skills && extraction.skills.length > 0 ? (
          extraction.skills.map((skill, idx) => (
            <span
              key={idx}
              className="px-2 py-0.5 bg-surface rounded text-xs flex items-center gap-1.5"
            >
              <span className="font-semibold text-ink">{skill.name}</span>
              {skill.category && (
                <span className="text-[10px] text-ink-subtle bg-canvas px-1 py-0.5 rounded">
                  {skill.category}
                </span>
              )}
            </span>
          ))
        ) : (
          <span className="text-xs text-ink-subtle italic">Tidak ada data skill</span>
        )}
      </div>
    </div>

    <div className="space-y-2">
      <SectionLabel className="flex items-center gap-1.5">
        <Briefcase className="w-3.5 h-3.5" />
        Pengalaman kerja & proyek ({extraction.work_experience?.length || 0})
      </SectionLabel>
      <div className="space-y-2">
        {extraction.work_experience && extraction.work_experience.length > 0 ? (
          extraction.work_experience.map((exp, idx) => (
            <Card key={idx} className="space-y-2">
              <div className="flex justify-between items-start gap-2">
                <div>
                  <h5 className="font-bold text-ink">{exp.role || 'Role'}</h5>
                  <p className="text-xs text-accent font-semibold">
                    {exp.company || 'Perusahaan / Proyek'}
                  </p>
                </div>
                <span className="text-[10px] text-ink-muted font-mono bg-canvas px-1.5 py-0.5 rounded shrink-0">
                  {exp.start_date || '?'} — {exp.is_current ? 'Present' : exp.end_date || '?'} (
                  {exp.duration_months || 0} bln)
                </span>
              </div>

              {exp.description && (
                <p className="text-xs text-ink-muted leading-relaxed">{exp.description}</p>
              )}

              {exp.projects && exp.projects.length > 0 && (
                <div className="pt-2 border-t border-line space-y-1">
                  <span className="text-[10px] font-bold text-ink-subtle flex items-center gap-1">
                    <FolderGit2 className="w-3 h-3" /> Proyek kunci
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {exp.projects.map((proj, pIdx) => (
                      <span
                        key={pIdx}
                        className="px-1.5 py-0.5 bg-accent-soft text-accent text-[10px] font-semibold rounded"
                      >
                        {proj}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </Card>
          ))
        ) : (
          <span className="text-xs text-ink-subtle italic">Tidak ada pengalaman kerja</span>
        )}
      </div>
    </div>

    <div className="space-y-2">
      <SectionLabel className="flex items-center gap-1.5">
        <GraduationCap className="w-3.5 h-3.5" />
        Pendidikan
      </SectionLabel>
      <div className="space-y-1.5">
        {extraction.education && extraction.education.length > 0 ? (
          extraction.education.map((edu, idx) => (
            <Card key={idx} className="flex justify-between items-center gap-2 py-3">
              <div>
                <h5 className="font-bold text-ink">{edu.institution}</h5>
                <p className="text-[11px] text-ink-muted">
                  {edu.degree} — {edu.major}
                </p>
              </div>
              {(edu.start_year || edu.end_year) && (
                <span className="text-[10px] text-ink-muted font-mono shrink-0">
                  {edu.start_year || ''} - {edu.end_year || ''}
                </span>
              )}
            </Card>
          ))
        ) : (
          <span className="text-xs text-ink-subtle italic">Tidak ada data pendidikan</span>
        )}
      </div>
    </div>

    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {extraction.certifications && extraction.certifications.length > 0 && (
        <div className="space-y-2">
          <SectionLabel className="flex items-center gap-1.5">
            <Award className="w-3.5 h-3.5" />
            Sertifikasi
          </SectionLabel>
          <ul className="space-y-1">
            {extraction.certifications.map((c, i) => (
              <li key={i} className="text-xs text-ink bg-surface p-2 rounded font-medium">
                {c}
              </li>
            ))}
          </ul>
        </div>
      )}

      {extraction.projects && extraction.projects.length > 0 && (
        <div className="space-y-2">
          <SectionLabel className="flex items-center gap-1.5">
            <Code className="w-3.5 h-3.5" />
            Portofolio proyek
          </SectionLabel>
          <ul className="space-y-1">
            {extraction.projects.map((p, i) => (
              <li key={i} className="text-xs text-ink bg-surface p-2 rounded font-medium">
                {p}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>

    {extraction.extraction_warnings && extraction.extraction_warnings.length > 0 && (
      <div className="p-3 bg-warn-soft text-warn rounded text-xs space-y-1.5 font-medium">
        <h4 className="flex items-center gap-1.5 text-warn">
          <AlertTriangle className="w-4 h-4" />
          Catatan AI extraction ({extraction.extraction_warnings.length})
        </h4>
        <ul className="list-disc list-inside space-y-1 text-[11px]">
          {extraction.extraction_warnings.map((w, i) => (
            <li key={i}>{w}</li>
          ))}
        </ul>
      </div>
    )}
  </div>
);
