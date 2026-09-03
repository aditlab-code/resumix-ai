'use client';

import React, { useState, useEffect } from 'react';
import {
  FileText,
  ShieldCheck,
  RefreshCw,
  ZoomIn,
  ZoomOut,
  RotateCw,
  Download,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { formatBytes, cn } from '@/lib/utils';
import { CVExtractionDTO } from '@cv-ats/contracts';
import { SAMPLE_PDF_BASE64 } from '@/lib/sample-pdf';
import { Card } from '@/components/ui';

interface ResumePreviewProps {
  originalFilename: string;
  storagePath: string;
  fileSizeBytes: number;
  pdfUrl?: string;
  candidateName?: string;
  extraction?: CVExtractionDTO;
  pageCount?: number;
}

const iconBtn =
  'p-1.5 bg-surface rounded text-ink-muted hover:text-ink hover:bg-line transition-colors disabled:opacity-40';

export const ResumePreview: React.FC<ResumePreviewProps> = ({
  originalFilename,
  storagePath,
  fileSizeBytes,
  pdfUrl,
  candidateName = 'Kandidat',
  extraction,
  pageCount = 1,
}) => {
  const effectivePdfUrl = pdfUrl || SAMPLE_PDF_BASE64;
  const [signedUrlTtl, setSignedUrlTtl] = useState(300);
  const [zoomLevel, setZoomLevel] = useState(100);
  const [rotation, setRotation] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState<'embed' | 'vector'>('embed');
  const totalPages = Math.max(1, pageCount);

  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(1);
  }, [totalPages, currentPage]);

  useEffect(() => {
    const interval = setInterval(() => {
      setSignedUrlTtl((prev) => (prev > 0 ? prev - 1 : 300));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleDownload = () => {
    const a = document.createElement('a');
    a.href = effectivePdfUrl;
    a.download = originalFilename;
    a.click();
  };

  const section = (title: string, body: React.ReactNode) => (
    <div>
      <h3 className="uppercase tracking-wider text-[11px] border-b border-line pb-1 mb-2">{title}</h3>
      {body}
    </div>
  );

  const emptyLine = (text: string) => (
    <p className="text-ink-subtle italic text-[11px]">{text}</p>
  );

  return (
    <Card className="space-y-3">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-line pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded bg-canvas text-ink-muted flex items-center justify-center">
            <FileText className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <h4 className="truncate">{originalFilename}</h4>
            <p className="text-[10px] text-ink-subtle font-mono truncate">
              {formatBytes(fileSizeBytes)} · {storagePath}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span
            className={cn(
              'text-[10px] px-2 py-1 rounded-full flex items-center gap-1 font-mono font-bold',
              signedUrlTtl > 60 ? 'bg-ok-soft text-ok' : 'bg-warn-soft text-warn'
            )}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            TTL {signedUrlTtl}s
          </span>
          <button onClick={() => setSignedUrlTtl(300)} className={iconBtn} aria-label="Refresh signed URL">
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 bg-canvas p-2 rounded text-xs">
        <div className="flex items-center gap-1 bg-surface p-0.5 rounded">
          {(['embed', 'vector'] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => setViewMode(mode)}
              className={cn(
                'px-2.5 py-1 rounded text-[11px] font-bold transition-colors',
                viewMode === mode ? 'bg-accent text-accent-fg' : 'text-ink-muted hover:text-ink'
              )}
            >
              {mode === 'embed' ? 'Native PDF' : 'Structured'}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <button
            disabled={currentPage <= 1}
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            className={iconBtn}
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-ink-muted font-mono font-bold text-[11px]">
            {currentPage} / {totalPages}
          </span>
          <button
            disabled={currentPage >= totalPages}
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            className={iconBtn}
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-center gap-1">
          <button onClick={() => setZoomLevel((p) => Math.max(50, p - 25))} className={iconBtn} aria-label="Zoom out">
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <span className="text-[11px] font-mono font-bold text-ink-muted min-w-[42px] text-center">
            {zoomLevel}%
          </span>
          <button onClick={() => setZoomLevel((p) => Math.min(200, p + 25))} className={iconBtn} aria-label="Zoom in">
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <button onClick={() => setRotation((p) => (p + 90) % 360)} className={iconBtn} aria-label="Rotate">
            <RotateCw className="w-3.5 h-3.5" />
          </button>
          <button onClick={handleDownload} className={iconBtn} aria-label="Download">
            <Download className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <div className="w-full bg-canvas rounded p-3 min-h-[500px] flex items-start justify-center overflow-auto">
        {viewMode === 'embed' ? (
          <iframe
            src={effectivePdfUrl}
            title={originalFilename}
            className="w-full h-[600px] rounded bg-surface"
          />
        ) : (
          <div
            className="w-full max-w-2xl bg-surface rounded p-6 text-ink space-y-5 transition-transform duration-300"
            style={{
              transform: `scale(${zoomLevel / 100}) rotate(${rotation}deg)`,
              transformOrigin: 'top center',
            }}
          >
            <div className="border-b-2 border-ink pb-3">
              <h2 className="text-lg font-extrabold tracking-tight uppercase">
                {extraction?.full_name || candidateName}
              </h2>
              <p className="text-xs text-ink-muted mt-1">
                {extraction?.contact?.email || 'Email tidak tercantum'}
                {extraction?.contact?.phone_number ? ` · ${extraction.contact.phone_number}` : ''}
              </p>
              {extraction?.contact?.location && (
                <p className="text-[11px] text-ink-subtle font-mono">{extraction.contact.location}</p>
              )}
            </div>

            <div className="space-y-5 text-xs">
              {section(
                'Ringkasan Profil',
                extraction?.summary ? (
                  <p className="text-ink-muted leading-relaxed italic bg-canvas p-3 rounded">
                    &ldquo;{extraction.summary}&rdquo;
                  </p>
                ) : (
                  emptyLine('Ringkasan profil belum tersedia.')
                )
              )}

              {section(
                'Riwayat Pengalaman Kerja',
                extraction?.work_experience && extraction.work_experience.length > 0 ? (
                  <div className="space-y-2">
                    {extraction.work_experience.map((exp, i) => (
                      <div key={i} className="p-3 bg-canvas rounded space-y-1">
                        <div className="flex justify-between font-bold gap-2">
                          <span>
                            {exp.role || 'Role'} — <span className="text-accent">{exp.company || 'Perusahaan'}</span>
                          </span>
                          <span className="text-[10px] font-mono text-ink-subtle shrink-0">
                            {exp.start_date || '?'} s/d {exp.is_current ? 'Present' : exp.end_date || '?'} (
                            {exp.duration_months || 0} bln)
                          </span>
                        </div>
                        {exp.description && (
                          <p className="text-ink-muted text-[11px] leading-relaxed">{exp.description}</p>
                        )}
                        {exp.projects && exp.projects.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1">
                            {exp.projects.map((proj, pidx) => (
                              <span
                                key={pidx}
                                className="text-[10px] font-mono bg-accent-soft text-accent px-1.5 py-0.5 rounded"
                              >
                                {proj}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  emptyLine('Tidak ada riwayat pengalaman kerja.')
                )
              )}

              {section(
                'Skill & Kemampuan Teknis',
                extraction?.skills && extraction.skills.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5">
                    {extraction.skills.map((skill, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 bg-canvas text-ink font-semibold text-[11px] rounded"
                      >
                        {skill.normalized_name || skill.name}
                      </span>
                    ))}
                  </div>
                ) : (
                  emptyLine('Tidak ada daftar skill terdeteksi.')
                )
              )}

              {section(
                'Riwayat Pendidikan',
                extraction?.education && extraction.education.length > 0 ? (
                  <div className="space-y-1.5">
                    {extraction.education.map((edu, idx) => (
                      <div key={idx} className="p-3 bg-canvas rounded flex justify-between items-start gap-2">
                        <div>
                          <p className="font-bold">{edu.institution || 'Institusi'}</p>
                          <p className="text-ink-muted text-[11px] font-medium">
                            {edu.degree} — {edu.major}
                          </p>
                        </div>
                        {(edu.start_year || edu.end_year) && (
                          <span className="font-mono text-[10px] text-ink-subtle shrink-0">
                            {edu.start_year || '?'} – {edu.end_year || '?'}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  emptyLine('Tidak ada riwayat pendidikan formal.')
                )
              )}

              {section(
                'Portofolio & Proyek',
                extraction?.portfolios && extraction.portfolios.length > 0 ? (
                  <div className="space-y-1.5">
                    {extraction.portfolios.map((p, idx) => (
                      <div key={idx} className="p-3 bg-canvas rounded flex justify-between items-start gap-2">
                        <div>
                          <strong className="block font-bold">{p.title}</strong>
                          {p.description && <p className="text-[11px] text-ink-muted mt-0.5">{p.description}</p>}
                        </div>
                        {p.url && (
                          <a
                            href={p.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-accent hover:underline font-mono text-[10px] shrink-0"
                          >
                            link
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                ) : extraction?.projects && extraction.projects.length > 0 ? (
                  <div className="space-y-1.5">
                    {extraction.projects.map((proj, idx) => (
                      <div key={idx} className="p-3 bg-canvas rounded font-bold">
                        {proj}
                      </div>
                    ))}
                  </div>
                ) : (
                  emptyLine('Tidak ada data proyek portofolio.')
                )
              )}

              {extraction?.references &&
                extraction.references.length > 0 &&
                section(
                  'Referensi Kerja',
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {extraction.references.map((ref, idx) => (
                      <div key={idx} className="p-3 bg-canvas rounded space-y-0.5">
                        <p className="font-bold">{ref.name}</p>
                        <p className="text-[11px] text-accent font-medium">
                          {ref.role || 'Referensi'} {ref.company ? `— ${ref.company}` : ''}
                        </p>
                        {ref.contact_info && (
                          <p className="text-[10px] font-mono text-ink-subtle">{ref.contact_info}</p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};
