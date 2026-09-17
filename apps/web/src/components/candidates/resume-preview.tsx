'use client';

import React, { useState, useEffect, useRef } from 'react';
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
  Award,
  Code,
  ExternalLink,
  FolderGit2,
  Globe,
  UserCheck,
  Mail,
  Phone,
  MapPin,
  AlertTriangle,
} from 'lucide-react';
import { formatBytes, cn } from '@/lib/utils';
import { CVExtractionDTO } from '@cv-ats/contracts';
import { SAMPLE_PDF_BASE64 } from '@/lib/sample-pdf';
import { Card } from '@/components/ui';
import * as pdfjsLib from 'pdfjs-dist';

if (typeof window !== 'undefined') {
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
}

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
  'p-1.5 bg-muted rounded-md text-muted-foreground hover:text-foreground hover:bg-border transition-colors disabled:opacity-40';

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

interface PdfCanvasViewerProps {
  effectivePdfUrl: string;
  currentPage: number;
  zoomLevel: number;
  rotation: number;
  originalFilename: string;
  onPagesLoaded?: (pages: number) => void;
}

const PdfCanvasViewer: React.FC<PdfCanvasViewerProps> = ({
  effectivePdfUrl,
  currentPage,
  zoomLevel,
  rotation,
  originalFilename,
  onPagesLoaded,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [pdfDoc, setPdfDoc] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [renderError, setRenderError] = useState<string | null>(null);
  const renderTaskRef = useRef<any>(null);

  useEffect(() => {
    let isCancelled = false;
    setIsLoading(true);
    setRenderError(null);

    const loadPdfBytes = async (targetUrl: string): Promise<Uint8Array> => {
      if (targetUrl.startsWith('data:application/pdf;base64,')) {
        const base64Data = targetUrl.replace(/^data:application\/pdf;base64,/, '');
        const byteCharacters = atob(base64Data);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        return new Uint8Array(byteNumbers);
      }
      const res = await fetch(targetUrl);
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      }
      const buf = await res.arrayBuffer();
      return new Uint8Array(buf);
    };

    const loadPdfDoc = async () => {
      try {
        let byteArray: Uint8Array;
        try {
          byteArray = await loadPdfBytes(effectivePdfUrl);
        } catch (fetchErr) {
          console.warn('Failed to fetch primary PDF URL, falling back to sample PDF base64:', fetchErr);
          byteArray = await loadPdfBytes(SAMPLE_PDF_BASE64);
        }
        const loadingTask = pdfjsLib.getDocument({ data: byteArray });
        const loadedDoc = await loadingTask.promise;
        if (!isCancelled) {
          setPdfDoc(loadedDoc);
          if (onPagesLoaded) onPagesLoaded(loadedDoc.numPages);
          setIsLoading(false);
        }
      } catch (err: any) {
        console.error('Error loading PDF with pdfjs:', err);
        if (!isCancelled) {
          setIsLoading(false);
          setRenderError(err?.message || 'Failed to render PDF document.');
        }
      }
    };

    loadPdfDoc();

    return () => {
      isCancelled = true;
    };
  }, [effectivePdfUrl]);

  useEffect(() => {
    if (!pdfDoc || !canvasRef.current || renderError) return;

    let isCancelled = false;

    const renderPage = async () => {
      if (renderTaskRef.current) {
        try {
          renderTaskRef.current.cancel();
        } catch (_) {}
      }

      try {
        const targetPageNum = Math.min(Math.max(1, currentPage), pdfDoc.numPages);
        const page = await pdfDoc.getPage(targetPageNum);
        if (isCancelled || !canvasRef.current) return;

        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const scale = (zoomLevel / 100) * 1.35;
        const viewport = page.getViewport({ scale, rotation });

        canvas.height = viewport.height;
        canvas.width = viewport.width;

        const renderContext = {
          canvasContext: ctx,
          viewport,
        };

        const task = page.render(renderContext);
        renderTaskRef.current = task;
        await task.promise;
      } catch (err: any) {
        if (err?.name !== 'RenderingCancelledException') {
          console.warn('Page render error:', err);
        }
      }
    };

    renderPage();

    return () => {
      isCancelled = true;
      if (renderTaskRef.current) {
        try {
          renderTaskRef.current.cancel();
        } catch (_) {}
      }
    };
  }, [pdfDoc, currentPage, zoomLevel, rotation, renderError]);

  if (renderError) {
    return (
      <div className="w-full flex flex-col items-center justify-center p-4 space-y-4">
        <div className="bg-amber-500/10 border border-amber-500/30 text-amber-900 dark:text-amber-200 p-3 rounded-lg text-xs flex items-center gap-2 max-w-md">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
          <span>Canvas renderer note: {renderError}. Displaying iframe viewer fallback.</span>
        </div>
        <iframe
          src={`${effectivePdfUrl}#toolbar=0&navpanes=0`}
          title={originalFilename}
          className="w-full h-[650px] rounded-xl border border-border shadow-sm bg-white"
        />
      </div>
    );
  }

  return (
    <div className="relative w-full flex flex-col items-center justify-center min-h-[550px] overflow-auto py-2">
      {isLoading && (
        <div className="flex flex-col items-center justify-center h-[450px] w-full text-muted-foreground text-xs space-y-2">
          <RefreshCw className="w-6 h-6 animate-spin text-primary" />
          <p className="font-semibold">Rendering PDF canvas preview...</p>
        </div>
      )}
      <canvas
        ref={canvasRef}
        className={cn(
          'max-w-full rounded-xl border border-border shadow-md transition-all duration-200 bg-white',
          isLoading ? 'hidden' : 'block'
        )}
      />
    </div>
  );
};

export const ResumePreview: React.FC<ResumePreviewProps> = ({
  originalFilename,
  storagePath,
  fileSizeBytes,
  pdfUrl,
  candidateName = 'Candidate',
  extraction,
  pageCount = 1,
}) => {
  const effectivePdfUrl = pdfUrl || SAMPLE_PDF_BASE64;
  const [signedUrlTtl, setSignedUrlTtl] = useState(300);
  const [zoomLevel, setZoomLevel] = useState(100);
  const [rotation, setRotation] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [detectedPageCount, setDetectedPageCount] = useState(pageCount || 1);
  const [viewMode, setViewMode] = useState<'embed' | 'vector'>('embed');
  const totalPages = Math.max(1, detectedPageCount);

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
      <h3 className="uppercase tracking-wider text-[11px] font-bold text-foreground border-b border-border pb-1 mb-2">{title}</h3>
      {body}
    </div>
  );

  const emptyLine = (text: string) => (
    <p className="text-muted-foreground italic text-[11px]">{text}</p>
  );

  return (
    <Card className="p-5 space-y-4 bg-card border border-border rounded-xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-9 h-9 rounded-lg bg-primary/10 text-primary border border-primary/20 flex items-center justify-center shrink-0 font-bold">
            <FileText className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <h4 className="font-bold text-sm text-foreground truncate">{originalFilename}</h4>
            <p className="text-[11px] text-muted-foreground font-mono truncate">
              {formatBytes(fileSizeBytes)} · {storagePath}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span
            className={cn(
              'text-[10px] px-2.5 py-1 rounded-full flex items-center gap-1 font-mono font-bold border',
              signedUrlTtl > 60
                ? 'bg-emerald-500/10 text-emerald-700 border-emerald-500/30'
                : 'bg-amber-500/10 text-amber-700 border-amber-500/30'
            )}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            Signed URL TTL {signedUrlTtl}s
          </span>
          <button onClick={() => setSignedUrlTtl(300)} className={iconBtn} aria-label="Refresh signed URL">
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 bg-muted/40 p-2 rounded-xl border border-border text-xs">
        <div className="inline-flex items-center gap-1 bg-background p-1 rounded-lg border border-border shadow-xs">
          {(['embed', 'vector'] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => setViewMode(mode)}
              className={cn(
                'px-3 py-1 rounded-md text-xs font-bold transition-all select-none',
                viewMode === mode
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'
              )}
            >
              {mode === 'embed' ? 'Native PDF' : 'Structured'}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 font-mono">
          <button
            disabled={currentPage <= 1}
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            className={iconBtn}
            aria-label="Previous page"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-muted-foreground font-mono font-bold text-xs px-1">
            Page {currentPage} of {totalPages}
          </span>
          <button
            disabled={currentPage >= totalPages}
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            className={iconBtn}
            aria-label="Next page"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-center gap-1">
          <button onClick={() => setZoomLevel((p) => Math.max(50, p - 25))} className={iconBtn} aria-label="Zoom out">
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <span className="text-xs font-mono font-bold text-foreground min-w-[42px] text-center">
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

      <div className="w-full bg-muted/20 rounded-xl p-3 min-h-[550px] flex items-start justify-center overflow-auto border border-border">
        {viewMode === 'embed' ? (
          <PdfCanvasViewer
            effectivePdfUrl={effectivePdfUrl}
            currentPage={currentPage}
            zoomLevel={zoomLevel}
            rotation={rotation}
            originalFilename={originalFilename}
            onPagesLoaded={(count) => setDetectedPageCount(count)}
          />
        ) : (
          <div
            className="w-full max-w-2xl bg-card border border-border rounded-xl p-6 text-foreground space-y-5 transition-transform duration-300 shadow-sm"
            style={{
              '--scale': zoomLevel / 100,
              '--rotation': `${rotation}deg`,
              transform: `scale(var(--scale)) rotate(var(--rotation))`,
              transformOrigin: 'top center',
            } as React.CSSProperties}
          >
            <div className="border-b border-border pb-3">
              <h2 className="text-lg font-extrabold tracking-tight uppercase text-foreground">
                {extraction?.full_name || candidateName}
              </h2>
              <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground mt-1 font-medium">
                {extraction?.contact?.email && (
                  <span className="flex items-center gap-1">
                    <Mail className="w-3.5 h-3.5 text-primary shrink-0" />
                    {extraction.contact.email}
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5 text-primary shrink-0" />
                  {extraction?.contact?.phone_number || 'Not Available'}
                </span>

                {extraction?.contact?.location && (
                  <span className="flex items-center gap-1 font-mono text-[11px]">
                    <MapPin className="w-3.5 h-3.5 text-primary shrink-0" />
                    {extraction.contact.location}
                  </span>
                )}
              </div>
            </div>

            <div className="space-y-5 text-xs">
              {section(
                'Profile Summary',
                extraction?.summary ? (
                  <p className="text-muted-foreground font-medium leading-relaxed bg-muted/30 p-3 rounded-lg border border-border/50">
                    &ldquo;{extraction.summary}&rdquo;
                  </p>
                ) : (
                  emptyLine('Profile summary not available.')
                )
              )}

              {section(
                'Skills & Technical Abilities',
                extraction?.skills && extraction.skills.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5">
                    {extraction.skills.map((skill, idx) => {
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
                    })}
                  </div>
                ) : (
                  emptyLine('No skills detected.')
                )
              )}

              {section(
                'Work Experience',
                extraction?.work_experience && extraction.work_experience.length > 0 ? (
                  <div className="space-y-2.5">
                    {extraction.work_experience.map((exp, i) => (
                      <div key={i} className="p-3.5 bg-muted/20 border border-border rounded-xl space-y-2">
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-1 border-b border-border/60 pb-1.5">
                          <div className="min-w-0 flex-1">
                            <h5 className="font-bold text-sm text-foreground leading-snug">
                              {exp.role || 'Role'}
                            </h5>
                            {exp.company && (
                              <p className="text-xs text-primary font-semibold mt-0.5">{exp.company}</p>
                            )}
                          </div>
                          <span className="text-[10px] text-blue-700 font-mono font-extrabold bg-blue-500/15 px-2.5 py-0.5 rounded-full border border-blue-500/35 shrink-0 self-start">
                            {exp.start_date || '?'} — {exp.is_current ? 'Present' : exp.end_date || '?'} (
                            {exp.duration_months || 0} mos)
                          </span>
                        </div>

                        {exp.description && (
                          <p className="text-xs text-muted-foreground leading-relaxed">{exp.description}</p>
                        )}

                        {exp.projects && exp.projects.length > 0 && (
                          <div className="flex flex-wrap gap-1 items-center pt-1">
                            <span className="text-[10px] font-extrabold text-muted-foreground flex items-center gap-1 uppercase tracking-wider mr-1">
                              <FolderGit2 className="w-3 h-3 text-purple-600" /> Projects:
                            </span>
                            {exp.projects.map((proj, pidx) => (
                              <span
                                key={pidx}
                                className="px-2.5 py-0.5 bg-purple-500/15 text-purple-800 border border-purple-500/35 text-[11px] font-bold rounded-md"
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
                  emptyLine('No work experience recorded.')
                )
              )}

              {section(
                'Education History',
                extraction?.education && extraction.education.length > 0 ? (
                  <div className="space-y-2">
                    {extraction.education.map((edu, idx) => (
                      <div key={idx} className="p-3.5 bg-muted/20 border border-border rounded-xl flex flex-col sm:flex-row justify-between items-start gap-2">
                        <div>
                          <p className="font-bold text-sm text-foreground">{edu.institution || 'Institution'}</p>
                          <p className="text-xs text-primary font-semibold mt-0.5">
                            {[edu.degree, edu.major].filter(Boolean).join(' — ')}
                          </p>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0 self-start">
                          {edu.gpa && (
                            <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-mono font-extrabold bg-emerald-500/15 px-2.5 py-0.5 rounded-full border border-emerald-500/35">
                              IPK {edu.gpa}
                            </span>
                          )}
                          {(edu.start_year || edu.end_year) && (
                            <span className="text-[10px] text-blue-700 dark:text-blue-400 font-mono font-extrabold bg-blue-500/15 px-2.5 py-0.5 rounded-full border border-blue-500/35">
                              {edu.start_year || '?'} — {edu.end_year || '?'}
                            </span>
                          )}
                        </div>

                      </div>
                    ))}
                  </div>
                ) : (
                  emptyLine('No formal education history.')
                )
              )}

              {extraction?.certifications && extraction.certifications.length > 0 && (
                section(
                  'Certifications & Licenses',
                  <div className="space-y-1.5">
                    {extraction.certifications.map((c, i) => (
                      <div key={i} className="text-xs text-indigo-950 bg-indigo-500/15 border border-indigo-500/35 p-3 rounded-xl font-extrabold shadow-2xs flex items-center gap-2">
                        <Award className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                        <span>{c}</span>
                      </div>
                    ))}
                  </div>
                )
              )}

              {section(
                'Portfolio & Projects',
                extraction?.portfolios && extraction.portfolios.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {extraction.portfolios.map((p, idx) => (
                      <a
                        key={idx}
                        href={p.url || '#'}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-sky-950 bg-sky-500/15 border border-sky-500/35 p-3 rounded-xl font-extrabold shadow-2xs flex items-center justify-between gap-2 hover:bg-sky-500/25 transition-colors"
                      >
                        <div className="flex items-center gap-2 truncate">
                          <Globe className="w-3.5 h-3.5 text-sky-600 shrink-0" />
                          <span className="truncate">{p.title}</span>
                        </div>
                        <ExternalLink className="w-3.5 h-3.5 text-sky-600 shrink-0" />
                      </a>
                    ))}
                  </div>
                ) : extraction?.projects && extraction.projects.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {extraction.projects.map((proj, idx) => (
                      <div key={idx} className="text-xs text-purple-950 bg-purple-500/15 border border-purple-500/35 p-3 rounded-xl font-extrabold shadow-2xs flex items-center gap-2">
                        <Code className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                        <span>{proj}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  emptyLine('No portfolio project data.')
                )
              )}

              {extraction?.references && extraction.references.length > 0 && (
                section(
                  'Work References',
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {extraction.references.map((ref, idx) => (
                      <div
                        key={idx}
                        className="text-xs text-emerald-950 bg-emerald-500/15 border border-emerald-500/35 p-3 rounded-xl font-extrabold shadow-2xs flex items-center gap-2"
                      >
                        <UserCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                        <div>
                          <span className="block font-bold">{ref.name}</span>
                          {ref.role && (
                            <span className="block text-[11px] text-emerald-700 font-semibold">
                              {ref.role} {ref.company ? `(${ref.company})` : ''}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )
              )}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};
