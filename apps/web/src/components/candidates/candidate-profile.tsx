'use client';

import React from 'react';
import { CVExtractionDTO } from '@cv-ats/contracts';
import { AlertTriangle } from 'lucide-react';
import { Card, SectionLabel } from '@/components/ui';

interface CandidateProfileProps {
  extraction: CVExtractionDTO;
}

export const CandidateProfile: React.FC<CandidateProfileProps> = ({ extraction }) => (
  <div className="space-y-4">
    {/* Profile Summary */}
    {extraction.summary && (
      <Card className="p-4 space-y-3 bg-card border border-border rounded-xl">
        <div className="border-b border-border/60 pb-2">
          <SectionLabel className="mb-0">Profile Summary (AI)</SectionLabel>
        </div>
        <p className="text-xs text-muted-foreground font-medium leading-relaxed bg-muted/30 p-3 rounded-lg border border-border/50">
          {extraction.summary}
        </p>
      </Card>
    )}

    {/* Keahlian / Skills */}
    <Card className="p-4 space-y-3 bg-card border border-border rounded-xl">
      <div className="border-b border-border/60 pb-2">
        <SectionLabel className="mb-0">
          Skills & Technical Tags ({extraction.skills?.length || 0})
        </SectionLabel>
      </div>
      <div className="flex flex-wrap gap-1.5 pt-0.5">
        {extraction.skills && extraction.skills.length > 0 ? (
          extraction.skills.map((skill, idx) => (
            <span
              key={idx}
              className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 text-foreground border border-border rounded-lg text-xs flex items-center gap-1.5 font-bold shadow-2xs"
            >
              <span>{skill.name || skill.normalized_name}</span>
              {skill.category && (
                <span className="text-[9px] bg-slate-200 dark:bg-slate-700 text-muted-foreground px-1.5 py-0.5 rounded font-mono font-bold uppercase tracking-wider">
                  {skill.category}
                </span>
              )}
            </span>
          ))
        ) : (
          <span className="text-xs text-muted-foreground italic">No skill data available</span>
        )}
      </div>
    </Card>

    {/* Work Experience */}
    <Card className="p-4 space-y-3 bg-card border border-border rounded-xl">
      <div className="border-b border-border/60 pb-2">
        <SectionLabel className="mb-0">
          Work Experience & Projects ({extraction.work_experience?.length || 0})
        </SectionLabel>
      </div>
      <div className="space-y-2.5 pt-0.5">
        {extraction.work_experience && extraction.work_experience.length > 0 ? (
          extraction.work_experience.map((exp, idx) => {
            const hasDuplicateDesc =
              exp.description &&
              exp.role &&
              (exp.description.trim().toLowerCase() === exp.role.trim().toLowerCase() ||
                exp.description.trim().toLowerCase().startsWith(exp.role.trim().toLowerCase()));

            const isLongRole = exp.role && exp.role.length > 55;
            const displayTitle = isLongRole ? (exp.company || 'Work Experience') : (exp.role || 'Role');
            const displaySubTitle = isLongRole ? null : exp.company;
            const bodyDescription = isLongRole
              ? exp.role
              : hasDuplicateDesc
              ? null
              : exp.description;

            return (
              <div key={idx} className="p-3.5 space-y-2.5 bg-muted/20 border border-border/60 rounded-lg">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 border-b border-border/40 pb-2">
                  <div className="min-w-0 flex-1">
                    <h5 className="font-bold text-sm text-foreground leading-snug">{displayTitle}</h5>
                    {displaySubTitle && (
                      <p className="text-xs text-primary font-semibold mt-0.5">{displaySubTitle}</p>
                    )}
                  </div>
                  <span className="text-[10px] text-foreground font-mono font-bold bg-slate-100 dark:bg-slate-800 px-2.5 py-0.5 rounded-full border border-border shrink-0 self-start">
                    {exp.start_date || '?'} — {exp.is_current ? 'Present' : exp.end_date || '?'} (
                    {exp.duration_months || 0} mos)
                  </span>
                </div>

                {bodyDescription && (
                  <p className="text-xs text-muted-foreground leading-relaxed">{bodyDescription}</p>
                )}

                {/* Technologies used */}
                {exp.technologies && exp.technologies.length > 0 && (
                  <div className="pt-1 space-y-1">
                    <span className="text-[10px] font-extrabold text-muted-foreground uppercase tracking-wider">
                      Technologies:
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {exp.technologies.map((tech, tIdx) => (
                        <span
                          key={tIdx}
                          className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-foreground border border-border text-[11px] font-medium rounded-md"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Projects */}
                {exp.projects && exp.projects.length > 0 && (
                  <div className="pt-1.5 border-t border-border/40 space-y-1">
                    <span className="text-[10px] font-extrabold text-muted-foreground uppercase tracking-wider">
                      Key Projects
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {exp.projects.map((proj, pIdx) => (
                        <span
                          key={pIdx}
                          className="px-2.5 py-0.5 bg-slate-100 dark:bg-slate-800 text-foreground border border-border text-[11px] font-medium rounded-md"
                        >
                          {proj}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <span className="text-xs text-muted-foreground italic">No work experience available</span>
        )}
      </div>
    </Card>

    {/* Pendidikan */}
    <Card className="p-4 space-y-3 bg-card border border-border rounded-xl">
      <div className="border-b border-border/60 pb-2">
        <SectionLabel className="mb-0">
          Education ({extraction.education?.length || 0})
        </SectionLabel>
      </div>
      <div className="space-y-2 pt-0.5">
        {extraction.education && extraction.education.length > 0 ? (
          extraction.education.map((edu, idx) => {
            const hasInst = edu.institution && edu.institution.trim() !== '' && edu.institution.trim() !== 'Tidak tercantum' && edu.institution.trim() !== 'Not listed';
            const displayInst = hasInst && edu.institution ? edu.institution.trim() : (edu.degree || 'Education');
            
            const subDetails = [edu.degree, edu.major]
              .filter((x) => x && x.trim() !== '' && x.trim() !== 'Tidak tercantum' && x.trim() !== 'Not listed' && x.trim() !== displayInst)
              .join(' — ');

            return (
              <div key={idx} className="p-3.5 bg-muted/20 border border-border/60 rounded-lg shadow-2xs">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <h5 className="font-bold text-sm text-foreground leading-snug">{displayInst}</h5>
                    {subDetails && (
                      <p className="text-xs text-primary font-semibold mt-0.5">{subDetails}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0 self-start">
                    {edu.gpa && (
                      <span className="text-[10px] text-foreground font-mono font-bold bg-slate-100 dark:bg-slate-800 px-2.5 py-0.5 rounded-full border border-border">
                        IPK {edu.gpa}
                      </span>
                    )}
                    {(edu.start_year || edu.end_year) && (
                      <span className="text-[10px] text-foreground font-mono font-bold bg-slate-100 dark:bg-slate-800 px-2.5 py-0.5 rounded-full border border-border">
                        {edu.start_year || '?'} — {edu.end_year || '?'}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <span className="text-xs text-muted-foreground italic">No education data available</span>
        )}
      </div>
    </Card>

    {/* Certifications */}
    <Card className="p-4 space-y-3 bg-card border border-border rounded-xl">
      <div className="border-b border-border/60 pb-2">
        <SectionLabel className="mb-0">
          Certifications ({extraction.certifications?.length || 0})
        </SectionLabel>
      </div>
      <div className="pt-0.5">
        {extraction.certifications && extraction.certifications.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {extraction.certifications.map((c, i) => (
              <div
                key={i}
                className="text-xs text-foreground bg-muted/20 border border-border/60 p-2.5 rounded-lg font-semibold shadow-2xs flex items-center gap-2"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                <span className="leading-snug">{c}</span>
              </div>
            ))}
          </div>
        ) : (
          <span className="text-xs text-muted-foreground italic">No certifications recorded</span>
        )}
      </div>
    </Card>

    {/* Project Portfolio (if present) */}
    {extraction.projects && extraction.projects.length > 0 && (
      <Card className="p-4 space-y-3 bg-card border border-border rounded-xl">
        <div className="border-b border-border/60 pb-2">
          <SectionLabel className="mb-0">
            Project Portfolio ({extraction.projects.length})
          </SectionLabel>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-0.5">
          {extraction.projects.map((p, i) => (
            <div
              key={i}
              className="text-xs text-foreground bg-muted/20 border border-border/60 p-2.5 rounded-lg font-semibold shadow-2xs flex items-center gap-2"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
              <span className="leading-snug">{p}</span>
            </div>
          ))}
        </div>
      </Card>
    )}

    {/* Portfolios section */}
    {extraction.portfolios && extraction.portfolios.length > 0 && (
      <Card className="p-4 space-y-3 bg-card border border-border rounded-xl">
        <div className="border-b border-border/60 pb-2">
          <SectionLabel className="mb-0">
            Portfolio Links ({extraction.portfolios.length})
          </SectionLabel>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-0.5">
          {extraction.portfolios.map((pf, i) => (
            <a
              key={i}
              href={pf.url || '#'}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-foreground bg-muted/20 border border-border/60 p-2.5 rounded-lg font-semibold shadow-2xs flex items-center justify-between gap-2 hover:bg-muted/50 transition-colors"
            >
              <span className="truncate">{pf.title}</span>
            </a>
          ))}
        </div>
      </Card>
    )}

    {/* References section */}
    {extraction.references && extraction.references.length > 0 && (
      <Card className="p-4 space-y-3 bg-card border border-border rounded-xl">
        <div className="border-b border-border/60 pb-2">
          <SectionLabel className="mb-0">
            Work References ({extraction.references.length})
          </SectionLabel>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-0.5">
          {extraction.references.map((rf, i) => (
            <div
              key={i}
              className="text-xs text-foreground bg-muted/20 border border-border/60 p-2.5 rounded-lg font-semibold shadow-2xs flex items-center"
            >
              <div>
                <span className="block font-bold">{rf.name}</span>
                {rf.role && <span className="block text-[11px] text-muted-foreground font-semibold">{rf.role} {rf.company ? `(${rf.company})` : ''}</span>}
              </div>
            </div>
          ))}
        </div>
      </Card>
    )}

    {/* Catatan AI Extraction */}
    {extraction.extraction_warnings && extraction.extraction_warnings.length > 0 && (
      <div className="p-4 bg-amber-500/15 border border-amber-500/35 text-amber-900 rounded-xl text-xs space-y-2 font-medium">
        <h4 className="flex items-center gap-2 font-bold text-amber-900 uppercase tracking-wider text-[11px]">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
          AI Extraction Warnings ({extraction.extraction_warnings.length})
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
