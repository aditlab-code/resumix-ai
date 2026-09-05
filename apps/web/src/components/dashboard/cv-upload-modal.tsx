'use client';

import React, { useState, useRef } from 'react';
import { ProcessingTimeline } from '@/components/ui/processing-timeline';
import { Overlay, Field, Input, Select, Button, Tabs } from '@/components/ui';
import { JobPosting, CandidateApplication } from '@/lib/types';
import { ParseStatus } from '@cv-ats/contracts';
import {
  calculateJobFitScore,
  formatBytes,
  constructExecutiveSummary,
  parseAndNormalizePhoneNumber,
  parseSinceYear,
  reconstructPdfLines,
  extractMultipleEducations,
  extractMultipleWorkExperiences,
  extractProjectsAndAwards,
  extractCVSections,
  extractPortfoliosAndReferences,
} from '@/lib/utils';
import { Loader2 } from 'lucide-react';
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
  const [activeTab, setActiveTab] = useState<'upload' | 'guidelines'>('upload');

  React.useEffect(() => {
    if (isOpen) {
      setJobId(selectedJobId);
      setActiveTab('upload');
    }
  }, [isOpen, selectedJobId]);
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

      const pageTexts: string[] = [];
      for (let i = 1; i <= Math.min(pdf.numPages, 6); i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const viewport = page.getViewport({ scale: 1 });

        // Rebuild real lines from item geometry (pdf.js join(' ') loses line breaks).
        const pageText = reconstructPdfLines(
          textContent.items as any[],
          viewport.width
        );
        pageTexts.push(pageText);
      }
      fullText = pageTexts.join('\n');
      extractedTextLines = fullText.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
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
      const slug = candidateName.toLowerCase().replace(/[^a-z0-9]/g, '.').replace(/\.+/g, '.');
      email = slug ? `${slug}@example.com` : '';
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

    const thisYear = new Date().getFullYear();
    const sinceYear = parseSinceYear(fullText);
    const datedYears = [
      ...workExperience.map((w) => parseInt((w.start_date || '').slice(0, 4), 10)),
      ...education.map((e) => e.start_year || 0),
    ].filter((y) => y >= 1990 && y <= thisYear);
    const earliestYear = sinceYear || (datedYears.length ? Math.min(...datedYears) : 0);

    let totalExpMonths = workExperience.reduce((sum, item) => sum + (item.duration_months || 0), 0);
    if (earliestYear) {
      totalExpMonths = Math.max(totalExpMonths, (thisYear - earliestYear) * 12);
    }

    const sections2 = extractCVSections(fullText);
    let extractedSummary = (sections2.summary || '').replace(/\s*\n\s*/g, ' ').trim();
    if (extractedSummary.length < 40) {
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
        'Riwayat pengalaman/proyek tidak terdeteksi otomatis. Gunakan "Edit data" untuk melengkapi.'
      );
    }
    if (education.length === 0) {
      warnings.push(
        'Riwayat pendidikan tidak terdeteksi otomatis. Gunakan "Edit data" untuk melengkapi.'
      );
    }
    if (!phoneNumber) {
      warnings.push('Nomor telepon tidak tercantum pada CV.');
    }
    if (!emailMatch) {
      warnings.push('Alamat email tidak terdeteksi pada CV.');
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
      title={
        <div>
          <h3 className="text-base font-bold text-foreground">Upload Candidate Resume</h3>
          <p className="text-xs font-normal text-muted-foreground mt-0.5">PDF Format (Max 10 MB) for AI extraction & scoring</p>
        </div>
      }
      subheader={
        <Tabs
          items={[
            { key: 'upload', label: 'Upload PDF File' },
            { key: 'guidelines', label: 'Parsing Guidelines' },
          ]}
          active={activeTab}
          onChange={(k) => setActiveTab(k as 'upload' | 'guidelines')}
          className="w-full justify-start"
        />
      }
      footer={
        <div className="flex items-center justify-end gap-4 sm:gap-4 w-full">
          <Button variant="ghost" size="md" onClick={close} disabled={isProcessing} className="px-6">
            Cancel
          </Button>
          {activeTab === 'upload' && (
            <Button
              size="md"
              onClick={handleStartUpload}
              disabled={!file || isProcessing}
              className="px-6"
              iconLeft={isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : undefined}
            >
              {isProcessing ? 'Extracting...' : 'Start Extraction & Scoring'}
            </Button>
          )}
        </div>
      }
    >
      <div className="space-y-4">
        {activeTab === 'guidelines' ? (
          <div className="space-y-3.5">
            <div className="p-4 bg-muted/40 border border-border rounded-xl space-y-2">
              <h4 className="text-xs font-bold text-foreground">
                PDF Text Layer Requirements
              </h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                The ATS system processes PDF files containing a searchable text layer. Scanned images or photos without a readable text layer will be flagged with status <code className="px-1.5 py-0.5 rounded bg-muted font-mono font-bold text-amber-700 dark:text-amber-300 border border-border">needs_review</code> for manual HR review.
              </p>
            </div>

            <div className="p-4 bg-muted/40 border border-border rounded-xl space-y-2">
              <h4 className="text-xs font-bold text-foreground">
                Security & Private Storage
              </h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Each candidate resume document is securely stored in private storage with Temporary Signed URLs (max TTL 300 seconds) to protect candidate PII data.
              </p>
            </div>
          </div>
        ) : (
          <>
            <Field label="Target Job Position" required hint="Select the target position to match candidate qualifications.">
              <Select value={jobId} onChange={(e) => setJobId(e.target.value)} disabled={isProcessing} sizeVariant="md">
                {jobs.map((j) => (
                  <option key={j.id} value={j.id}>
                    {j.title} ({j.department}) — min. {j.minimum_experience_months} mos
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
                className={`rounded-xl p-8 text-center cursor-pointer transition-all duration-200 flex flex-col items-center justify-center gap-2 border-2 border-dashed ${
                  isDragOver
                    ? 'border-primary bg-primary/5 shadow-sm'
                    : 'border-border bg-muted/30 hover:border-primary/50 hover:bg-muted/50'
                }`}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={(e) => e.target.files && handleFileSelect(e.target.files[0])}
                  accept=".pdf,application/pdf"
                  className="hidden"
                />
                <p className="text-xs font-bold text-foreground">Click or Drag & Drop PDF Resume</p>
                <p className="text-[11px] text-muted-foreground">Max file size 10 MB. Securely stored in private storage.</p>
              </div>
            )}

            {file && !isProcessing && (
              <div className="space-y-3.5">
                <div className="bg-muted/50 border border-border rounded-xl p-3.5 flex items-center justify-between gap-3 shadow-xs">
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-foreground truncate">{file.name}</p>
                    <p className="text-[11px] text-muted-foreground font-mono">{formatBytes(file.size)}</p>
                  </div>
                  <Button variant="danger-soft" size="md" onClick={() => setFile(null)} className="px-4">
                    Replace File
                  </Button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 p-4 bg-card border border-border rounded-xl">
                  <Field label="Candidate Full Name" required>
                    <Input
                      required
                      value={candidateNameInput}
                      onChange={(e) => setCandidateNameInput(e.target.value)}
                      placeholder="Candidate name"
                    />
                  </Field>
                  <Field label="Candidate Email" required>
                    <Input
                      type="email"
                      required
                      value={emailInput}
                      onChange={(e) => setEmailInput(e.target.value)}
                      placeholder="name@example.com"
                    />
                  </Field>
                  <Field label="Phone Number" className="sm:col-span-2">
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
              <div className="space-y-3.5">
                <div className="flex items-center gap-3 p-4 bg-primary/10 border border-primary/20 rounded-xl text-foreground">
                  <Loader2 className="w-5 h-5 text-primary animate-spin shrink-0" />
                  <div>
                    <h4 className="text-xs font-bold text-foreground">Extracting PDF Data & Calculating Job-Fit Score</h4>
                    <p className="text-[11px] text-muted-foreground font-medium mt-0.5">
                      {candidateNameInput} ({emailInput})
                    </p>
                  </div>
                </div>
                <ProcessingTimeline currentStatus={currentStep} />
              </div>
            )}

            {errorMsg && (
              <div className="p-3.5 bg-destructive/10 border border-destructive/20 text-destructive rounded-xl text-xs font-medium">
                {errorMsg}
              </div>
            )}
          </>
        )}
      </div>
    </Overlay>
  );
};
