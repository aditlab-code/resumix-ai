'use client';

import React from 'react';
import { CVExtractionDTO } from '@cv-ats/contracts';
import {
  User,
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

interface CandidateProfileProps {
  extraction: CVExtractionDTO;
}

export const CandidateProfile: React.FC<CandidateProfileProps> = ({ extraction }) => {
  return (
    <div className="space-y-5 text-slate-800">
      {/* Contact & Personal Info Header */}
      <div className="bg-slate-50 border border-slate-300 rounded-xl p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <User className="w-5 h-5 text-sky-700" />
            {extraction.full_name || 'Nama Kandidat Tidak Ditemukan'}
          </h3>
          <span className="text-xs font-semibold px-2.5 py-1 bg-white border border-slate-300 text-slate-800 rounded-lg">
            Pengalaman Total: {extraction.total_experience_months || 0} Bulan
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-700 pt-2 border-t border-slate-300">
          {extraction.contact?.email && (
            <div className="flex items-center gap-2">
              <Mail className="w-3.5 h-3.5 text-slate-500 shrink-0" />
              <span>{extraction.contact.email}</span>
            </div>
          )}
          {extraction.contact?.phone_number && (
            <div className="flex items-center gap-2">
              <Phone className="w-3.5 h-3.5 text-slate-500 shrink-0" />
              <span>{extraction.contact.phone_number}</span>
            </div>
          )}
          {extraction.contact?.location && (
            <div className="flex items-center gap-2">
              <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
              <span>{extraction.contact.location}</span>
            </div>
          )}
          {extraction.contact?.linkedin_url && (
            <div className="flex items-center gap-2">
              <ExternalLink className="w-3.5 h-3.5 text-sky-700 shrink-0" />
              <a
                href={extraction.contact.linkedin_url}
                target="_blank"
                rel="noreferrer"
                className="text-sky-700 hover:underline truncate"
              >
                LinkedIn Profile
              </a>
            </div>
          )}
        </div>
      </div>

      {/* Summary */}
      {extraction.summary && (
        <div className="space-y-1.5">
          <h4 className="text-xs font-bold text-slate-600 uppercase tracking-wider">
            Ringkasan Eksekutif (AI Summary)
          </h4>
          <p className="text-xs text-slate-800 bg-white p-4 rounded-xl border border-slate-300 leading-relaxed">
            {extraction.summary}
          </p>
        </div>
      )}

      {/* Skills Matrix */}
      <div className="space-y-2">
        <h4 className="text-xs font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
          <Code className="w-3.5 h-3.5 text-sky-700" />
          Keahlian & Technical Skills ({extraction.skills?.length || 0})
        </h4>
        <div className="flex flex-wrap gap-2">
          {extraction.skills && extraction.skills.length > 0 ? (
            extraction.skills.map((skill, idx) => (
              <div
                key={idx}
                className="px-3 py-1 bg-white border border-slate-300 rounded-lg text-xs flex items-center gap-1.5"
              >
                <span className="font-semibold text-slate-900">{skill.name}</span>
                {skill.category && (
                  <span className="text-[10px] text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-300">
                    {skill.category}
                  </span>
                )}
              </div>
            ))
          ) : (
            <span className="text-xs text-slate-500 italic">Tidak ada data skill</span>
          )}
        </div>
      </div>

      {/* Hybrid Work Experience & Project-Based Experience Cards */}
      <div className="space-y-3">
        <h4 className="text-xs font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
          <Briefcase className="w-3.5 h-3.5 text-sky-700" />
          Riwayat Pengalaman Kerja & Proyek ({extraction.work_experience?.length || 0})
        </h4>
        <div className="space-y-3">
          {extraction.work_experience && extraction.work_experience.length > 0 ? (
            extraction.work_experience.map((exp, idx) => (
              <div
                key={idx}
                className="bg-white border border-slate-300 rounded-xl p-4 space-y-2.5"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h5 className="text-xs font-bold text-slate-900">{exp.role || 'Role'}</h5>
                    <p className="text-xs text-sky-800 font-semibold">{exp.company || 'Perusahaan / Proyek'}</p>
                  </div>
                  <span className="text-[10px] text-slate-700 font-mono bg-slate-100 px-2 py-0.5 rounded border border-slate-300">
                    {exp.start_date || '?'} — {exp.is_current ? 'Present' : exp.end_date || '?'} ({exp.duration_months || 0} bln)
                  </span>
                </div>

                {exp.description && (
                  <p className="text-xs text-slate-700 leading-relaxed">
                    {exp.description}
                  </p>
                )}

                {/* Sub-Projects under this experience */}
                {exp.projects && exp.projects.length > 0 && (
                  <div className="pt-2 border-t border-slate-200 space-y-1">
                    <span className="text-[10px] font-bold text-slate-600 flex items-center gap-1">
                      <FolderGit2 className="w-3 h-3 text-indigo-700" /> Proyek Kunci:
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {exp.projects.map((proj, pIdx) => (
                        <span
                          key={pIdx}
                          className="px-2 py-0.5 bg-indigo-50 text-indigo-900 text-[10px] font-semibold rounded border border-indigo-300"
                        >
                          {proj}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))
          ) : (
            <span className="text-xs text-slate-500 italic">Tidak ada pengalaman kerja</span>
          )}
        </div>
      </div>

      {/* Education */}
      <div className="space-y-3">
        <h4 className="text-xs font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
          <GraduationCap className="w-3.5 h-3.5 text-sky-700" />
          Riwayat Pendidikan
        </h4>
        <div className="space-y-2">
          {extraction.education && extraction.education.length > 0 ? (
            extraction.education.map((edu, idx) => (
              <div
                key={idx}
                className="bg-white border border-slate-300 rounded-xl p-3.5 flex justify-between items-center"
              >
                <div>
                  <h5 className="text-xs font-bold text-slate-900">{edu.institution}</h5>
                  <p className="text-[11px] text-slate-600">
                    {edu.degree} — {edu.major}
                  </p>
                </div>
                {(edu.start_year || edu.end_year) && (
                  <span className="text-[10px] text-slate-600 font-mono">
                    {edu.start_year || ''} - {edu.end_year || ''}
                  </span>
                )}
              </div>
            ))
          ) : (
            <span className="text-xs text-slate-500 italic">Tidak ada data pendidikan</span>
          )}
        </div>
      </div>

      {/* Certifications & Projects */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {extraction.certifications && extraction.certifications.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
              <Award className="w-3.5 h-3.5 text-amber-700" />
              Sertifikasi Professional
            </h4>
            <ul className="space-y-1">
              {extraction.certifications.map((c, i) => (
                <li
                  key={i}
                  className="text-xs text-slate-800 bg-white border border-slate-300 p-2 rounded-lg font-medium"
                >
                  {c}
                </li>
              ))}
            </ul>
          </div>
        )}

        {extraction.projects && extraction.projects.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
              <Code className="w-3.5 h-3.5 text-indigo-700" />
              Portofolio Proyek Tambahan
            </h4>
            <ul className="space-y-1">
              {extraction.projects.map((p, i) => (
                <li
                  key={i}
                  className="text-xs text-slate-800 bg-white border border-slate-300 p-2 rounded-lg font-medium"
                >
                  {p}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Warnings */}
      {extraction.extraction_warnings && extraction.extraction_warnings.length > 0 && (
        <div className="p-4 bg-amber-50 border border-amber-300 rounded-xl text-amber-950 text-xs space-y-1.5 font-medium">
          <h4 className="font-bold flex items-center gap-1.5 text-amber-900">
            <AlertTriangle className="w-4 h-4 text-amber-700" />
            Catatan AI Extraction Warnings:
          </h4>
          <ul className="list-disc list-inside space-y-1 text-[11px] text-amber-900">
            {extraction.extraction_warnings.map((w, i) => (
              <li key={i}>{w}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

