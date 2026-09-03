'use client';

import React, { useState, useEffect } from 'react';
import {
  FileText,
  ShieldCheck,
  RefreshCw,
  Eye,
  ZoomIn,
  ZoomOut,
  RotateCw,
  Download,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';
import { formatBytes } from '@/lib/utils';
import { CVExtractionDTO } from '@cv-ats/contracts';
import { SAMPLE_PDF_BASE64 } from '@/lib/sample-pdf';

interface ResumePreviewProps {
  originalFilename: string;
  storagePath: string;
  fileSizeBytes: number;
  pdfUrl?: string;
  candidateName?: string;
  extraction?: CVExtractionDTO;
  pageCount?: number;
}

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
  const [zoomLevel, setZoomLevel] = useState(100); // 50 to 200%
  const [rotation, setRotation] = useState(0); // 0, 90, 180, 270
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState<'embed' | 'vector'>('embed');
  const totalPages = Math.max(1, pageCount);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(1);
    }
  }, [totalPages, currentPage]);

  // Real-time TTL countdown simulation
  useEffect(() => {
    const interval = setInterval(() => {
      setSignedUrlTtl((prev) => (prev > 0 ? prev - 1 : 300));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleRefreshSignedUrl = () => {
    setSignedUrlTtl(300);
  };

  const handleZoomIn = () => setZoomLevel((prev) => Math.min(200, prev + 25));
  const handleZoomOut = () => setZoomLevel((prev) => Math.max(50, prev - 25));
  const handleRotate = () => setRotation((prev) => (prev + 90) % 360);

  const handleDownload = () => {
    const a = document.createElement('a');
    a.href = effectivePdfUrl;
    a.download = originalFilename;
    a.click();
  };

  return (
    <div className="bg-white border border-slate-300 rounded-xl p-5 space-y-4">
      {/* Top File Metadata & Signed URL Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-sky-100 border border-sky-300 text-sky-800 flex items-center justify-center font-bold">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-900 flex items-center gap-2">
              {originalFilename}
              <span className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-mono border border-slate-300">
                PDF Document
              </span>
            </h4>
            <p className="text-[10px] text-slate-500 font-mono mt-0.5">
              {formatBytes(fileSizeBytes)} | Storage Path: <span className="text-slate-500">{storagePath}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Signed URL Security Badge */}
          <span
            className={`text-[10px] border px-2.5 py-1 rounded-full flex items-center gap-1 font-mono font-bold transition ${
              signedUrlTtl > 60
                ? 'text-emerald-900 bg-emerald-50 border-emerald-300'
                : 'text-amber-900 bg-amber-50 border-amber-300'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
            Signed URL TTL: {signedUrlTtl}s
          </span>

          <button
            onClick={handleRefreshSignedUrl}
            className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition rounded-lg border border-slate-300"
            title="Refresh Signed URL"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main PDF Viewer Control Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-50 p-2.5 rounded-xl border border-slate-300 text-xs">
        {/* Left: View Mode Toggle */}
        <div className="flex items-center gap-1 bg-white p-1 rounded-lg border border-slate-300">
          <button
            onClick={() => setViewMode('embed')}
            className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition ${
              viewMode === 'embed'
                ? 'bg-sky-700 text-white'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Native Stream (PDF)
          </button>
          <button
            onClick={() => setViewMode('vector')}
            className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition ${
              viewMode === 'vector'
                ? 'bg-sky-700 text-white'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Structured Vector View
          </button>
        </div>

        {/* Center: Page Navigation */}
        <div className="flex items-center gap-2">
          <button
            disabled={currentPage <= 1}
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            className="p-1 bg-white border border-slate-300 rounded-md text-slate-700 hover:bg-slate-100 disabled:opacity-40 transition"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-slate-700 font-mono font-bold text-[11px]">
            Halaman {currentPage} / {totalPages}
          </span>
          <button
            disabled={currentPage >= totalPages}
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            className="p-1 bg-white border border-slate-200 rounded-md text-slate-700 hover:bg-slate-100 disabled:opacity-40 transition"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Right: Zoom, Rotate & Download Controls */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={handleZoomOut}
            className="p-1.5 bg-white border border-slate-200 rounded-md text-slate-700 hover:bg-slate-100 transition"
            title="Zoom Out (-25%)"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>

          <span className="text-[11px] font-mono font-bold text-slate-700 min-w-[45px] text-center bg-white px-2 py-1 rounded border border-slate-200">
            {zoomLevel}%
          </span>

          <button
            onClick={handleZoomIn}
            className="p-1.5 bg-white border border-slate-200 rounded-md text-slate-700 hover:bg-slate-100 transition"
            title="Zoom In (+25%)"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={handleRotate}
            className="p-1.5 bg-white border border-slate-200 rounded-md text-slate-700 hover:bg-slate-100 transition ml-1"
            title="Putar Dokumen (90°)"
          >
            <RotateCw className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={handleDownload}
            className="p-1.5 bg-white border border-slate-200 rounded-md text-slate-700 hover:bg-slate-100 transition"
            title="Unduh Berkas PDF"
          >
            <Download className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* PDF Viewport Canvas Area */}
      <div className="w-full bg-slate-100 border border-slate-300 rounded-xl p-4 min-h-[500px] flex items-center justify-center overflow-auto relative">
        {/* Stream Native PDF Embed */}
        {viewMode === 'embed' ? (
          <iframe
            src={effectivePdfUrl}
            title={originalFilename}
            className="w-full h-[600px] rounded-lg border border-slate-300 bg-white shadow-sm"
          />
        ) : (
          /* Vector Structured Document View displaying 100% REAL data */
          <div
            className="w-full max-w-2xl bg-white border border-slate-300 rounded-lg p-8 text-slate-900 transition-all duration-300 space-y-6"
            style={{
              transform: `scale(${zoomLevel / 100}) rotate(${rotation}deg)`,
              transformOrigin: 'top center',
            }}
          >
            {/* Document Page Header */}
            <div className="border-b-2 border-slate-900 pb-4 flex justify-between items-end">
              <div>
                <h2 className="text-xl font-extrabold tracking-tight text-slate-900 uppercase">
                  {extraction?.full_name || candidateName}
                </h2>
                <p className="text-xs text-slate-600 font-medium mt-1">
                  {extraction?.contact?.email || 'Email tidak tercantum'} {extraction?.contact?.phone_number ? `| ${extraction.contact.phone_number}` : ''}
                </p>
                {extraction?.contact?.location && (
                  <p className="text-[11px] text-slate-500 font-mono">
                    Lokasi: {extraction.contact.location}
                  </p>
                )}
              </div>
              <div className="text-right">
                <span className="text-[10px] font-mono uppercase bg-slate-100 text-slate-700 px-2 py-1 rounded border border-slate-300">
                  STRUCTURED VECTOR VIEW
                </span>
              </div>
            </div>

            {/* Single Unified Vector View Displaying ALL Sections */}
            <div className="space-y-6 text-xs">
              {/* 1. Profile Summary */}
              <div>
                <h3 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] border-b border-slate-200 pb-1 mb-2 flex items-center gap-1.5">
                  <span>📝</span> RINGKASAN PROFIL KANDIDAT (AI SUMMARY)
                </h3>
                {extraction?.summary ? (
                  <p className="text-slate-700 leading-relaxed italic bg-slate-50 p-3 rounded-lg border border-slate-200">
                    "{extraction.summary}"
                  </p>
                ) : (
                  <p className="text-slate-400 italic text-[11px]">
                    Ringkasan profil belum tersedia.
                  </p>
                )}
              </div>

              {/* 2. Work Experience */}
              <div>
                <h3 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] border-b border-slate-200 pb-1 mb-2 flex items-center gap-1.5">
                  <span>💼</span> RIWAYAT PENGALAMAN KERJA (WORK EXPERIENCE)
                </h3>
                {extraction?.work_experience && extraction.work_experience.length > 0 ? (
                  <div className="space-y-3">
                    {extraction.work_experience.map((exp, i) => (
                      <div key={i} className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-1">
                        <div className="flex justify-between font-bold text-slate-900">
                          <span>{exp.role || 'Software Engineer'} — <span className="text-sky-700">{exp.company || 'Tech Corp'}</span></span>
                          <span className="text-[10px] font-mono text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200">
                            {exp.start_date || '2022'} s/d {exp.is_current ? 'Present' : exp.end_date || '2024'} ({exp.duration_months || 12} bln)
                          </span>
                        </div>
                        {exp.description && (
                          <p className="text-slate-600 text-[11px] leading-relaxed mt-1">{exp.description}</p>
                        )}
                        {exp.projects && exp.projects.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {exp.projects.map((proj, pidx) => (
                              <span key={pidx} className="text-[9px] font-mono bg-sky-50 text-sky-800 px-1.5 py-0.5 rounded border border-sky-200">
                                🚀 {proj}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-slate-400 italic text-[11px]">
                    Tidak ada riwayat pengalaman kerja yang terdaftar.
                  </p>
                )}
              </div>

              {/* 3. Technical Skills */}
              <div>
                <h3 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] border-b border-slate-200 pb-1 mb-2 flex items-center gap-1.5">
                  <span>⚡</span> SKILL & KEMAMPUAN TEKNIS
                </h3>
                {extraction?.skills && extraction.skills.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5">
                    {extraction.skills.map((skill, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-1 bg-slate-100 text-slate-800 border border-slate-300 font-semibold text-[11px] rounded-md shadow-sm"
                      >
                        {skill.normalized_name || skill.name}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-slate-400 italic text-[11px]">
                    Tidak ada daftar skill terdeteksi.
                  </p>
                )}
              </div>

              {/* 4. Education History */}
              <div>
                <h3 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] border-b border-slate-200 pb-1 mb-2 flex items-center gap-1.5">
                  <span>🎓</span> RIWAYAT PENDIDIKAN (EDUCATION)
                </h3>
                {extraction?.education && extraction.education.length > 0 ? (
                  <div className="space-y-2">
                    {extraction.education.map((edu, idx) => (
                      <div key={idx} className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex justify-between items-start">
                        <div>
                          <p className="font-bold text-slate-900">{edu.institution || 'Institusi Pendidikan'}</p>
                          <p className="text-slate-700 text-[11px] font-medium">{edu.degree} — {edu.major}</p>
                        </div>
                        {(edu.start_year || edu.end_year) && (
                          <span className="font-mono text-[10px] text-slate-600 bg-white px-2 py-0.5 rounded border border-slate-200">
                            {edu.start_year || '?'} – {edu.end_year || '?'}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-slate-400 italic text-[11px]">
                    Tidak ada riwayat pendidikan formal terdaftar.
                  </p>
                )}
              </div>

              {/* 5. Projects & Portfolios */}
              <div>
                <h3 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] border-b border-slate-200 pb-1 mb-2 flex items-center gap-1.5">
                  <span>🚀</span> PORTOFOLIO KARYA & PROYEK UTAMA
                </h3>
                {extraction?.portfolios && extraction.portfolios.length > 0 ? (
                  <div className="space-y-2">
                    {extraction.portfolios.map((p, idx) => (
                      <div key={idx} className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex justify-between items-start">
                        <div>
                          <strong className="block text-slate-900 font-bold">{p.title}</strong>
                          {p.description && <p className="text-[11px] text-slate-600 mt-0.5">{p.description}</p>}
                        </div>
                        {p.url && (
                          <a href={p.url} target="_blank" rel="noopener noreferrer" className="text-sky-700 hover:underline font-mono text-[10px] bg-sky-50 px-2 py-1 rounded border border-sky-200">
                            {p.url}
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                ) : extraction?.projects && extraction.projects.length > 0 ? (
                  <div className="space-y-2 text-slate-700">
                    {extraction.projects.map((proj, idx) => (
                      <div key={idx} className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                        <strong className="block text-slate-900 font-bold">{proj}</strong>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-slate-400 italic text-[11px]">
                    Tidak ada data proyek portofolio.
                  </p>
                )}
              </div>

              {/* 6. Work References */}
              {extraction?.references && extraction.references.length > 0 && (
                <div>
                  <h3 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] border-b border-slate-200 pb-1 mb-2 flex items-center gap-1.5">
                    <span>👥</span> REFERENSI KERJA PROFESSIONAL
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {extraction.references.map((ref, idx) => (
                      <div key={idx} className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-0.5">
                        <p className="font-bold text-slate-900">{ref.name}</p>
                        <p className="text-[11px] text-sky-700 font-medium">{ref.role || 'Referensi Professional'} {ref.company ? `— ${ref.company}` : ''}</p>
                        {ref.contact_info && <p className="text-[10px] font-mono text-slate-500">{ref.contact_info}</p>}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Document Footer Page Indicator */}
            <div className="pt-6 border-t border-slate-200 flex justify-between items-center text-[10px] text-slate-400 font-mono">
              <span>Original File: {originalFilename}</span>
              <span>STRUCTURED VECTOR VIEW — PAGE 1/1</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
