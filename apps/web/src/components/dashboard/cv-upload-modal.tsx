'use client';

import React, { useState, useRef } from 'react';
import { ProcessingTimeline } from '@/components/ui/processing-timeline';
import { Overlay, Field, Input, Select, Button } from '@/components/ui';
import { JobPosting, CandidateApplication } from '@/lib/types';
import { ParseStatus } from '@cv-ats/contracts';
import {
  calculateJobFitScore,
  formatBytes,
  constructExecutiveSummary,
  parseAndNormalizePhoneNumber,
  extractMultipleEducations,
  extractMultipleWorkExperiences,
  extractProjectsAndAwards,
  extractCVSections,
  extractPortfoliosAndReferences,
} from '@/lib/utils';
import { Upload, FileText, CheckCircle2, AlertTriangle, Loader2 } from 'lucide-react';
import * as pdfjsLib from 'pdfjs-dist';

pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

interface CvUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  jobs: JobPosting[];
  selectedJobId: string;
  onUploadSuccess: (newApp: CandidateApplication) => void;
}

const IGNORED_HEADER_KEYWORDS = [
  'curriculum', 'vitae', 'resume', 'biodata', 'profile', 'profil', 'application',
  'lamaran', 'halaman', 'page', 'software engineer', 'fullstack', 'backend', 'frontend',
  'developer', 'programmer', 'manager', 'lead', 'architect', 'specialist', 'analyst',
  'designer', 'devops', 'administrator', 'intern', 'junior', 'senior',
];

export const CvUploadModal: React.FC<CvUploadModalProps> = ({
  isOpen,
  onClose,
  jobs,
  selectedJobId,
  onUploadSuccess,
}) => {
  const [jobId, setJobId] = useState(selectedJobId);
  const [file, setFile] = useState<File | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentStep, setCurrentStep] = useState<ParseStatus>('uploaded');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [candidateNameInput, setCandidateNameInput] = useState('');
  const [emailInput, setEmailInput] = useState('');
  const [phoneInput, setPhoneInput] = useState('');

  const parsePdfMetadataWithPdfJs = async (uploadedFile: File, targetJob: JobPosting) => {
    let fullText = '';
    let extractedTextLines: string[] = [];

    try {
      const arrayBuffer = await uploadedFile.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: new Uint8Array(arrayBuffer) }).promise;

      for (let i = 1; i <= Math.min(pdf.numPages, 5); i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();

        const pageText = textContent.items.map((item: any) => item.str).join(' ');
        fullText += ' ' + pageText;

        textContent.items.forEach((item: any) => {
          if (item.str && item.str.trim().length > 0) {
            extractedTextLines.push(item.str.trim());
          }
        });
      }
    } catch (e) {
      console.warn('PDFJS fallback:', e);
      try {
        const arrayBuffer = await uploadedFile.arrayBuffer();
        const decoder = new TextDecoder('latin1');
        const binaryStr = decoder.decode(arrayBuffer);
        const textMatches = binaryStr.match(/\(([^()]{2,100})\)/g);
        if (textMatches) {
          extractedTextLines = textMatches.map((m) => m.slice(1, -1).trim());
          fullText = extractedTextLines.join(' ');
        } else {
          fullText = binaryStr;
        }
      } catch (err) {
        fullText = '';
      }
    }

    if (fullText.trim().length < 50) {
      extractedTextLines = fullText.split(/\r?\n/).map((l) => l.trim()).filter((l) => l.length > 0);
    }

    const emailMatch = fullText.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
    let email = emailMatch ? emailMatch[0].replace(/^[^a-zA-Z0-9]+|[^a-zA-Z0-9]+$/g, '') : '';

    let phoneNumber = parseAndNormalizePhoneNumber(fullText);

    let candidateName = '';
    for (const line of extractedTextLines) {
      const cleanLine = line.replace(/[^\w\s]/gi, '').trim();
      const lower = cleanLine.toLowerCase();

      const isIgnored = IGNORED_HEADER_KEYWORDS.some((kw) => lower.includes(kw));
      const words = cleanLine.split(/\s+/).filter((w) => w.length > 1);

      if (!isIgnored && words.length >= 2 && words.length <= 5 && !/\d/.test(cleanLine)) {
        candidateName = words
          .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
          .join(' ');
        break;
      }
    }

    if (!candidateName) {
      const rawFilename = uploadedFile.name
        .replace(/\.pdf$/i, '')
        .replace(/^(cv|resume|biodata)[_\-\s]*/i, '')
        .replace(/[_\-]+/g, ' ')
        .trim();

      candidateName = rawFilename
        .split(/\s+/)
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
        .join(' ');
    }

    if (!email) {
      const slug = candidateName.toLowerCase().replace(/[^a-z0-9]/g, '.');
      email = `${slug}@example.com`;
    }

    if (!phoneNumber) {
      phoneNumber = '+62 812-' + Math.floor(1000000 + Math.random() * 9000000);
    }

    const detectedSkills: { name: string; normalized_name: string; category: string }[] = [];
    const sections = extractCVSections(fullText);
    if (sections.skills) {
      const sLines = sections.skills
        .split(/[,\n•|;]/)
        .map((s) => s.trim())
        .filter((s) => s.length > 1 && s.length < 35);
      sLines.forEach((skill) => {
        if (!detectedSkills.some((s) => s.normalized_name.toLowerCase() === skill.toLowerCase())) {
          detectedSkills.push({ name: skill, normalized_name: skill, category: 'Competency' });
        }
      });
    }

    const pool = [
      ...targetJob.mandatory_skills,
      ...targetJob.preferred_skills,
      'Python', 'React', 'TypeScript', 'Docker', 'PostgreSQL', 'Node.js', 'Go', 'AWS', 'Linux', 'Git',
      'Java', 'C++', 'Golang', 'SQL', 'NoSQL',
    ];

    pool.forEach((skill) => {
      if (
        fullText.toLowerCase().includes(skill.toLowerCase()) ||
        uploadedFile.name.toLowerCase().includes(skill.toLowerCase())
      ) {
        if (!detectedSkills.some((s) => s.normalized_name.toLowerCase() === skill.toLowerCase())) {
          detectedSkills.push({ name: skill, normalized_name: skill, category: 'Technical' });
        }
      }
    });

    const uniqueSkills = detectedSkills.filter(
      (s, idx, self) =>
        idx ===
        self.findIndex((t) => t.normalized_name.toLowerCase() === s.normalized_name.toLowerCase())
    );

    const workExperience = extractMultipleWorkExperiences(fullText);
    const education = extractMultipleEducations(fullText);
    const { projects, certifications } = extractProjectsAndAwards(fullText);
    const { portfolios, references } = extractPortfoliosAndReferences(fullText);

    const totalExpMonths = workExperience.reduce((sum, item) => sum + (item.duration_months || 0), 0);

    let extractedSummary = '';
    const summaryMatch = fullText.match(
      /(summary|about me|profile|profil|ringkasan|objective)\s*[:\-\n]+\s*([^.\n]{20,250}\.[^.\n]{20,250}\.)/i
    );
    if (summaryMatch && summaryMatch[2]) {
      extractedSummary = summaryMatch[2].trim();
    } else {
      const skillNames = detectedSkills.map((s) => s.normalized_name);
      const companies = workExperience.map((w) => w.company || '').filter((c) => c.length > 0);
      extractedSummary = constructExecutiveSummary(
        candidateName,
        totalExpMonths || 24,
        skillNames,
        targetJob.title,
        companies
      );
    }

    const warnings: string[] = [];
    if (workExperience.length === 0) {
      warnings.push(
        'Riwayat perusahaan/proyek belum terdeteksi otomatis dari PDF. Gunakan "Koreksi data" untuk melengkapi.'
      );
    }
    if (education.length === 0) {
      warnings.push(
        'Institusi pendidikan belum terdeteksi otomatis dari PDF. Gunakan "Koreksi data" untuk melengkapi.'
      );
    }

    const fullTextLength = fullText.trim().length;
    const isScannedPdf = fullTextLength < 50;

    if (isScannedPdf) {
      warnings.unshift(
        'Halaman PDF tidak memiliki layer teks. Sistem tidak menggunakan OCR untuk efisiensi; dokumen ditandai untuk tinjauan HR.'
      );
    }

    return {
      candidateName,
      email,
      phoneNumber,
      extractedSummary,
      detectedSkills: uniqueSkills,
      workExperience,
      totalExpMonths,
      education,
      projects,
      certifications,
      portfolios,
      references,
      warnings,
      fullTextLength,
      isScannedPdf,
    };
  };

  const handleFileSelect = async (selectedFile: File) => {
    setErrorMsg(null);

    if (
      !selectedFile.name.toLowerCase().endsWith('.pdf') &&
      selectedFile.type !== 'application/pdf'
    ) {
      setErrorMsg('Hanya berkas PDF yang diperbolehkan.');
      return;
    }

    if (selectedFile.size > 10 * 1024 * 1024) {
      setErrorMsg('Ukuran berkas melebihi batas maksimum 10 MB.');
      return;
    }

    setFile(selectedFile);

    const activeJob = jobs.find((j) => j.id === jobId) || jobs[0];
    const parsed = await parsePdfMetadataWithPdfJs(selectedFile, activeJob);
    setCandidateNameInput(parsed.candidateName);
    setEmailInput(parsed.email);
    setPhoneInput(parsed.phoneNumber);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleStartUpload = async () => {
    if (!file) return;

    if (!candidateNameInput.trim()) {
      setErrorMsg('Nama kandidat wajib diisi atau dipastikan.');
      return;
    }

    setIsProcessing(true);
    setErrorMsg(null);
    setCurrentStep('uploaded');

    await new Promise((r) => setTimeout(r, 600));
    setCurrentStep('queued');

    await new Promise((r) => setTimeout(r, 800));
    setCurrentStep('processing');

    await new Promise((r) => setTimeout(r, 1200));

    const activeJob = jobs.find((j) => j.id === jobId) || jobs[0];
    const realData = await parsePdfMetadataWithPdfJs(file, activeJob);

    const isScan =
      file.name.toLowerCase().includes('scan') ||
      realData.isScannedPdf ||
      realData.fullTextLength < 50;
    const isCorrupt = file.name.toLowerCase().includes('corrupt');

    let finalParseStatus: ParseStatus = 'processed';
    let combinedWarnings: string[] = [...realData.warnings];
    let errorMessage: string | undefined = undefined;

    if (isCorrupt) {
      finalParseStatus = 'failed';
      errorMessage = 'PDF terproteksi kata sandi atau berstruktur rusak.';
    } else if (isScan || realData.warnings.length > 0) {
      finalParseStatus = 'needs_review';
      if (isScan) {
        combinedWarnings.unshift(
          'Halaman PDF berupa gambar/scan tanpa layer teks. Dokumen memerlukan perhatian HR (needs_review).'
        );
      }
    }

    setCurrentStep(finalParseStatus);

    const realExtraction = {
      full_name: candidateNameInput.trim(),
      contact: {
        email: emailInput.trim(),
        phone_number: phoneInput.trim(),
        location: 'Indonesia',
      },
      summary: realData.extractedSummary,
      total_experience_months: isCorrupt ? 0 : realData.totalExpMonths,
      skills: isCorrupt ? [] : realData.detectedSkills,
      work_experience: isCorrupt ? [] : realData.workExperience,
      education: isCorrupt ? [] : realData.education,
      certifications: isCorrupt ? [] : realData.certifications,
      projects: isCorrupt
        ? []
        : realData.projects.length > 0
          ? realData.projects
          : realData.workExperience.flatMap((w) => w.projects || []),
      portfolios: isCorrupt ? [] : realData.portfolios,
      references: isCorrupt ? [] : realData.references,
      extraction_warnings: combinedWarnings,
    };

    const { score, breakdown } = calculateJobFitScore(realExtraction, activeJob);

    const newApp: CandidateApplication = {
      id: `app-${Date.now()}`,
      job_id: activeJob.id,
      candidate_id: `cand-${Date.now()}`,
      document_id: `doc-${Date.now()}`,
      candidate_name: candidateNameInput.trim(),
      email: emailInput.trim(),
      phone_number: phoneInput.trim(),
      applied_at: new Date().toISOString(),
      status: 'applied',
      parse_status: finalParseStatus,
      storage_path: `private/cv/${file.name}`,
      original_filename: file.name,
      file_size_bytes: file.size,
      pdf_url: URL.createObjectURL(file),
      job_fit_score: isCorrupt ? 0 : score,
      score_breakdown: breakdown,
      cv_extraction: realExtraction,
      parse_error: errorMessage,
    };

    setIsProcessing(false);
    onUploadSuccess(newApp);
    handleReset();
    onClose();
  };

  const handleReset = () => {
    setFile(null);
    setIsProcessing(false);
    setCurrentStep('uploaded');
    setErrorMsg(null);
    setCandidateNameInput('');
    setEmailInput('');
    setPhoneInput('');
  };

  const close = () => {
    if (isProcessing) return;
    handleReset();
    onClose();
  };

  return (
    <Overlay
      isOpen={isOpen}
      onClose={close}
      size="lg"
      title="Unggah CV kandidat (PDF)"
      footer={
        <>
          <Button variant="ghost" size="sm" onClick={close} disabled={isProcessing}>
            Batal
          </Button>
          <Button
            size="sm"
            onClick={handleStartUpload}
            disabled={!file || isProcessing}
            iconLeft={
              isProcessing ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <CheckCircle2 className="w-4 h-4" />
              )
            }
          >
            {isProcessing ? 'Mengekstrak...' : 'Mulai ekstraksi & scoring'}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <Field label="Target lowongan" required>
          <Select value={jobId} onChange={(e) => setJobId(e.target.value)} disabled={isProcessing}>
            {jobs.map((j) => (
              <option key={j.id} value={j.id}>
                {j.title} ({j.department}) — min. {j.minimum_experience_months} bln
              </option>
            ))}
          </Select>
        </Field>

        {!isProcessing && !file && (
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragOver(true);
            }}
            onDragLeave={() => setIsDragOver(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`rounded p-8 text-center cursor-pointer transition-colors flex flex-col items-center justify-center gap-3 border border-dashed ${
              isDragOver ? 'border-accent bg-accent-soft' : 'border-line bg-surface hover:border-accent'
            }`}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={(e) => e.target.files && handleFileSelect(e.target.files[0])}
              accept=".pdf,application/pdf"
              className="hidden"
            />
            <div className="w-11 h-11 rounded-full bg-surface text-ink-muted flex items-center justify-center">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-ink">Klik atau tarik & lepas file PDF</p>
              <p className="text-[11px] text-ink-subtle mt-1">PDF maksimum 10 MB, disimpan di storage privat.</p>
            </div>
          </div>
        )}

        {file && !isProcessing && (
          <div className="space-y-3">
            <div className="bg-surface rounded p-3 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-9 h-9 rounded bg-canvas flex items-center justify-center text-ink-muted shrink-0">
                  <FileText className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-ink truncate">{file.name}</p>
                  <p className="text-[10px] text-ink-subtle font-mono">{formatBytes(file.size)}</p>
                </div>
              </div>
              <Button variant="danger-soft" size="sm" onClick={() => setFile(null)}>
                Ganti
              </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Field label="Nama lengkap" required>
                <Input
                  required
                  value={candidateNameInput}
                  onChange={(e) => setCandidateNameInput(e.target.value)}
                  placeholder="Nama kandidat"
                />
              </Field>
              <Field label="Email" required>
                <Input
                  type="email"
                  required
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  placeholder="nama@example.com"
                />
              </Field>
              <Field label="Nomor telepon" className="sm:col-span-2">
                <Input
                  value={phoneInput}
                  onChange={(e) => setPhoneInput(e.target.value)}
                  placeholder="+62 812-3456-7890"
                />
              </Field>
            </div>
          </div>
        )}

        {isProcessing && (
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 bg-accent-soft rounded">
              <Loader2 className="w-5 h-5 text-accent animate-spin shrink-0" />
              <div>
                <h4 className="text-accent">Mengekstrak data PDF & menghitung skor</h4>
                <p className="text-[11px] text-ink-muted">
                  {candidateNameInput} ({emailInput})
                </p>
              </div>
            </div>
            <ProcessingTimeline currentStatus={currentStep} />
          </div>
        )}

        {errorMsg && (
          <div className="p-3 bg-danger-soft text-danger rounded text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            {errorMsg}
          </div>
        )}
      </div>
    </Overlay>
  );
};
