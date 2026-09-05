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
  Globe,
  UserCheck,
} from 'lucide-react';
import { Card, SectionLabel } from '@/components/ui';

interface CandidateProfileProps {
  extraction: CVExtractionDTO;
}

const SKILL_COLOR_PALETTES = [
  { bg: 'bg-blue-500/15', text: 'text-blue-900', border: 'border-blue-500/35', badge: 'bg-blue-600 text-white' },
  { bg: 'bg-indigo-500/15', text: 'text-indigo-900', border: 'border-indigo-500/35', badge: 'bg-indigo-600 text-white' },
  { bg: 'bg-purple-500/15', text: 'text-purple-900', border: 'border-purple-500/35', badge: 'bg-purple-600 text-white' },
  { bg: 'bg-cyan-500/15', text: 'text-cyan-950', border: 'border-cyan-500/35', badge: 'bg-cyan-600 text-white' },
  { bg: 'bg-emerald-500/15', text: 'text-emerald-950', border: 'border-emerald-500/35', badge: 'bg-emerald-600 text-white' },
  { bg: 'bg-teal-500/15', text: 'text-teal-950', border: 'border-teal-500/35', badge: 'bg-teal-600 text-white' },
  { bg: 'bg-amber-500/15', text: 'text-amber-950', border: 'border-amber-500/35', badge: 'bg-amber-600 text-white' },
  { bg: 'bg-rose-500/15', text: 'text-rose-950', border: 'border-rose-500/35', badge: 'bg-rose-600 text-white' },
];

const getSkillPalette = (skillName: string, category?: string) => {
  const seed = (category || skillName).toLowerCase();
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = seed.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % SKILL_COLOR_PALETTES.length;
  return SKILL_COLOR_PALETTES[index];
};

export const CandidateProfile: React.FC<CandidateProfileProps> = ({ extraction }) => (
  <div className="space-y-4">
    {/* Summary Card */}
    {extraction.summary && (
      <Card className="p-4 space-y-2 bg-card border border-border rounded-xl">
        <SectionLabel className="text-xs font-extrabold text-foreground uppercase tracking-wider">Ringkasan Profil (AI)</SectionLabel>
        <p className="text-xs text-muted-foreground font-medium leading-relaxed bg-muted/30 p-3 rounded-lg border border-border/50">
          {extraction.summary}
        </p>
      </Card>
    )}

    {/* Keahlian / Skills */}
    <Card className="p-4 space-y-2.5 bg-card border border-border rounded-xl">
      <SectionLabel className="flex items-center gap-1.5 text-xs font-extrabold text-foreground uppercase tracking-wider">
        <Code className="w-3.5 h-3.5 text-primary" />
        Keahlian & Technical Tags ({extraction.skills?.length || 0})
      </SectionLabel>
      <div className="flex flex-wrap gap-1.5">
        {extraction.skills && extraction.skills.length > 0 ? (
          extraction.skills.map((skill, idx) => {
            const palette = getSkillPalette(skill.name || skill.normalized_name || '', skill.category);
            return (
              <span
                key={idx}
                className={`px-2.5 py-1 ${palette.bg} ${palette.text} border ${palette.border} rounded-lg text-xs flex items-center gap-1.5 font-extrabold shadow-2xs`}
              >
                <span>{skill.name || skill.normalized_name}</span>
                {skill.category && (
                  <span className={`text-[9px] ${palette.badge} px-1.5 py-0.5 rounded font-mono font-black uppercase tracking-wider`}>
                    {skill.category}
                  </span>
                )}
              </span>
            );
          })
        ) : (
          <span className="text-xs text-muted-foreground italic">Tidak ada data skill</span>
        )}
      </div>
    </Card>

    <div className="space-y-2">
      <SectionLabel className="flex items-center gap-1.5 text-xs font-extrabold text-foreground uppercase tracking-wider">
        <Briefcase className="w-3.5 h-3.5 text-primary" />
        Pengalaman Kerja & Proyek ({extraction.work_experience?.length || 0})
      </SectionLabel>
      <div className="space-y-2.5">
        {extraction.work_experience && extraction.work_experience.length > 0 ? (
          extraction.work_experience.map((exp, idx) => {
            const hasDuplicateDesc =
              exp.description &&
              exp.role &&
              (exp.description.trim().toLowerCase() === exp.role.trim().toLowerCase() ||
                exp.description.trim().toLowerCase().startsWith(exp.role.trim().toLowerCase()));

            const isLongRole = exp.role && exp.role.length > 55;
            const displayTitle = isLongRole ? (exp.company || 'Pengalaman Kerja') : (exp.role || 'Role');
            const displaySubTitle = isLongRole ? null : exp.company;
            const bodyDescription = isLongRole
              ? exp.role
              : hasDuplicateDesc
              ? null
              : exp.description;

            return (
              <Card key={idx} className="p-4 space-y-2.5 bg-card border border-border rounded-xl">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 border-b border-border/60 pb-2">
                  <div className="min-w-0 flex-1">
                    <h5 className="font-bold text-sm text-foreground leading-snug">{displayTitle}</h5>
                    {displaySubTitle && (
                      <p className="text-xs text-primary font-semibold mt-0.5">{displaySubTitle}</p>
                    )}
                  </div>
                  <span className="text-[10px] text-blue-700 font-mono font-extrabold bg-blue-500/15 px-2.5 py-0.5 rounded-full border border-blue-500/35 shrink-0 self-start">
                    {exp.start_date || '?'} — {exp.is_current ? 'Present' : exp.end_date || '?'} (
                    {exp.duration_months || 0} bln)
                  </span>
                </div>

                {bodyDescription && (
                  <p className="text-xs text-muted-foreground leading-relaxed">{bodyDescription}</p>
                )}

                {/* Technologies used */}
                {exp.technologies && exp.technologies.length > 0 && (
                  <div className="pt-1.5 space-y-1">
                    <span className="text-[10px] font-extrabold text-muted-foreground uppercase tracking-wider">
                      Teknologi:
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {exp.technologies.map((tech, tIdx) => (
                        <span
                          key={tIdx}
                          className="px-2 py-0.5 bg-teal-500/15 text-teal-800 border border-teal-500/35 text-[11px] font-bold rounded-md"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Projects */}
                {exp.projects && exp.projects.length > 0 && (
                  <div className="pt-2 border-t border-border/60 space-y-1.5">
                    <span className="text-[10px] font-extrabold text-muted-foreground flex items-center gap-1 uppercase tracking-wider">
                      <FolderGit2 className="w-3.5 h-3.5 text-purple-600" /> Proyek Kunci
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {exp.projects.map((proj, pIdx) => (
                        <span
                          key={pIdx}
                          className="px-2.5 py-0.5 bg-purple-500/15 text-purple-800 border border-purple-500/35 text-[11px] font-bold rounded-md"
                        >
                          {proj}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </Card>
            );
          })
        ) : (
          <span className="text-xs text-muted-foreground italic">Tidak ada pengalaman kerja</span>
        )}
      </div>
    </div>

    {/* Pendidikan */}
    <div className="space-y-2.5">
      <SectionLabel className="text-xs font-extrabold text-foreground uppercase tracking-wider">
        Pendidikan ({extraction.education?.length || 0})
      </SectionLabel>
      <div className="space-y-2">
        {extraction.education && extraction.education.length > 0 ? (
          extraction.education.map((edu, idx) => {
            const hasInst = edu.institution && edu.institution.trim() !== '' && edu.institution.trim() !== 'Tidak tercantum';
            const displayInst = hasInst && edu.institution ? edu.institution.trim() : (edu.degree || 'Pendidikan');
            
            const subDetails = [edu.degree, edu.major]
              .filter((x) => x && x.trim() !== '' && x.trim() !== 'Tidak tercantum' && x.trim() !== displayInst)
              .join(' — ');

            return (
              <Card key={idx} className="p-4 bg-card border border-border rounded-xl shadow-xs">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <h5 className="font-bold text-sm text-foreground leading-snug">{displayInst}</h5>
                    {subDetails && (
                      <p className="text-xs text-primary font-semibold mt-0.5">{subDetails}</p>
                    )}
                  </div>
                  {(edu.start_year || edu.end_year) && (
                    <span className="text-[10px] text-blue-700 font-mono font-extrabold bg-blue-500/15 px-2.5 py-0.5 rounded-full border border-blue-500/35 shrink-0 self-start">
                      {edu.start_year || '?'} — {edu.end_year || '?'}
                    </span>
                  )}
                </div>
              </Card>
            );
          })
        ) : (
          <span className="text-xs text-muted-foreground italic">Tidak ada data pendidikan</span>
        )}
      </div>
    </div>

    {/* Sertifikasi & Portofolio */}
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {extraction.certifications && extraction.certifications.length > 0 && (
        <div className="space-y-2">
          <SectionLabel className="text-xs font-extrabold text-foreground uppercase tracking-wider">
            Sertifikasi ({extraction.certifications.length})
          </SectionLabel>
          <div className="space-y-1.5">
            {extraction.certifications.map((c, i) => (
              <div key={i} className="text-xs text-indigo-950 bg-indigo-500/15 border border-indigo-500/35 p-3 rounded-xl font-extrabold shadow-2xs flex items-center gap-2">
                <Award className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                <span>{c}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {extraction.projects && extraction.projects.length > 0 && (
        <div className="space-y-2">
          <SectionLabel className="text-xs font-extrabold text-foreground uppercase tracking-wider">
            Portofolio Proyek ({extraction.projects.length})
          </SectionLabel>
          <div className="space-y-1.5">
            {extraction.projects.map((p, i) => (
              <div key={i} className="text-xs text-purple-950 bg-purple-500/15 border border-purple-500/35 p-3 rounded-xl font-extrabold shadow-2xs flex items-center gap-2">
                <Code className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                <span>{p}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>

    {/* Portfolios section */}
    {extraction.portfolios && extraction.portfolios.length > 0 && (
      <div className="space-y-2">
        <SectionLabel className="text-xs font-extrabold text-foreground uppercase tracking-wider">
          Portofolio Link ({extraction.portfolios.length})
        </SectionLabel>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {extraction.portfolios.map((pf, i) => (
            <a
              key={i}
              href={pf.url || '#'}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-sky-950 bg-sky-500/15 border border-sky-500/35 p-3 rounded-xl font-extrabold shadow-2xs flex items-center justify-between gap-2 hover:bg-sky-500/25 transition-colors"
            >
              <div className="flex items-center gap-2 truncate">
                <Globe className="w-3.5 h-3.5 text-sky-600 shrink-0" />
                <span className="truncate">{pf.title}</span>
              </div>
              <ExternalLink className="w-3.5 h-3.5 text-sky-600 shrink-0" />
            </a>
          ))}
        </div>
      </div>
    )}

    {/* References section */}
    {extraction.references && extraction.references.length > 0 && (
      <div className="space-y-2">
        <SectionLabel className="text-xs font-extrabold text-foreground uppercase tracking-wider">
          Referensi Kerja ({extraction.references.length})
        </SectionLabel>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {extraction.references.map((rf, i) => (
            <div
              key={i}
              className="text-xs text-emerald-950 bg-emerald-500/15 border border-emerald-500/35 p-3 rounded-xl font-extrabold shadow-2xs flex items-center gap-2"
            >
              <UserCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <div>
                <span className="block font-bold">{rf.name}</span>
                {rf.role && <span className="block text-[11px] text-emerald-700 font-semibold">{rf.role} {rf.company ? `(${rf.company})` : ''}</span>}
              </div>
            </div>
          ))}
        </div>
      </div>
    )}

    {/* Catatan AI Extraction */}
    {extraction.extraction_warnings && extraction.extraction_warnings.length > 0 && (
      <div className="p-4 bg-amber-500/15 border border-amber-500/35 text-amber-900 rounded-xl text-xs space-y-2 font-medium">
        <h4 className="flex items-center gap-2 font-bold text-amber-900 uppercase tracking-wider text-[11px]">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
          Catatan AI Extraction ({extraction.extraction_warnings.length})
        </h4>
        <ul className="list-disc list-inside space-y-1 text-xs">
          {extraction.extraction_warnings.map((w, i) => (
            <li key={i}>{w}</li>
          ))}
        </ul>
      </div>
    )}
  </div>
);
