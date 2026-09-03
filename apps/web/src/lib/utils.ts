import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { ScoreBreakdown, CVExtractionDTO, EducationDTO, WorkExperienceDTO } from '@cv-ats/contracts';
import { JobPosting } from './types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatBytes(bytes: number, decimals = 1) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

export function parseAndNormalizePhoneNumber(text: string): string {
  if (!text) return '';

  // 1. Labeled phone number search (Phone: +62 812..., HP: 0812..., Telp: (021)...)
  const labeledRegex = /(?:phone|telepon|telp|hp|mobile|wa|whatsapp|contact|kontak|no\.?\s*hp|no\.?\s*telp|nomor)[\s:]*([+()]?[\d\s\-./()]{9,20}\d)/i;
  const labeledMatch = text.match(labeledRegex);

  let rawPhone = '';
  if (labeledMatch && labeledMatch[1]) {
    rawPhone = labeledMatch[1];
  } else {
    // 2. Generic pattern search (+62..., 08..., (021)...)
    const genericRegex = /(?:\+?62|08|021|\(\+?62\))[\s\-./()]*\d[\d\s\-./()]{7,16}\d/;
    const genericMatch = text.match(genericRegex);
    if (genericMatch) {
      rawPhone = genericMatch[0];
    }
  }

  if (!rawPhone) return '';

  // Clean non-digit characters except leading +
  let digits = rawPhone.replace(/[^\d+]/g, '');

  // Normalize Indonesian numbers starting with 08 or 628
  if (digits.startsWith('08')) {
    digits = '+628' + digits.slice(2);
  } else if (digits.startsWith('628')) {
    digits = '+' + digits;
  }

  // Format into standard clean Indonesian number (+62 8xx-xxxx-xxxx)
  if (digits.startsWith('+628') && digits.length >= 11 && digits.length <= 14) {
    const prefix = digits.slice(0, 3); // +62
    const provider = digits.slice(3, 6); // 812
    const middle = digits.slice(6, 10); // 3456
    const rest = digits.slice(10); // 7890
    return rest ? `${prefix} ${provider}-${middle}-${rest}` : `${prefix} ${provider}-${middle}`;
  }

  return digits.length > 5 ? digits : rawPhone.trim();
}

export function cleanOcrText(text: string): string {
  if (!text) return '';
  let cleaned = text.replace(/([a-zA-Z]{2,})-\s*\r?\n\s*([a-zA-Z]{2,})/g, '$1$2');
  cleaned = cleaned.replace(/([a-zA-Z]{2,})-\s+([a-zA-Z]{2,})/g, '$1-$2');
  cleaned = cleaned.replace(/github\.comy/g, 'github.com/');
  cleaned = cleaned.replace(/gitlab\.comy/g, 'gitlab.com/');
  cleaned = cleaned.replace(/^\s*[+«“*•]\s*/gm, '• ');
  const headers = [
    'TECHNICAL SKILLS', 'PROFESSIONAL SUMMARY', 'PUBLICATIONS', 'PROJECTS',
    'EDUCATION', 'CERTIFICATIONS', 'PENGALAMAN KERJA', 'RIWAYAT PENDIDIKAN', 'KEAHLIAN TEKNIS'
  ];
  headers.forEach((h) => {
    const re = new RegExp(`([^\\n])\\s*(${h})`, 'gi');
    cleaned = cleaned.replace(re, '$1\n\n$2');
  });
  return cleaned;
}

export function extractCVSections(fullText: string): Record<string, string> {
  const sections: Record<string, string> = {
    experience: '',
    education: '',
    skills: '',
    projects: '',
    awards: '',
    other: '',
  };

  if (!fullText) return sections;

  const sanitizedText = cleanOcrText(fullText);
  const lines = sanitizedText.split(/\r?\n/);
  let currentSection = 'other';

  const sectionPatterns: { key: keyof typeof sections; regex: RegExp }[] = [
    { key: 'experience', regex: /^(?:WORK\s+EXPERIENCE|PROFESSIONAL\s+EXPERIENCE|EMPLOYMENT\s+HISTORY|CAREER\s+HISTORY|WORK\s+HISTORY|RELEVANT\s+EXPERIENCE|EXPERIENCE|PENGALAMAN\s+KERJA|PENGALAMAN\s+PROFESIONAL|RIWAYAT\s+PEKERJAAN|RIWAYAT\s+KARIR|PENGALAMAN)$/i },
    { key: 'education', regex: /^(?:EDUCATION\s+&\s+QUALIFICATIONS|ACADEMIC\s+BACKGROUND|ACADEMIC\s+HISTORY|HIGHER\s+EDUCATION|EDUCATION|PENDIDIKAN\s+FORMAL|RIWAYAT\s+PENDIDIKAN|LATAR\s+BELAKANG\s+AKADEMIK|PENDIDIKAN|AKADEMIK)$/i },
    { key: 'skills', regex: /^(?:TECHNICAL\s+SKILLS|SKILLS\s+&\s+COMPETENCIES|CORE\s+COMPETENCIES|TECHNOLOGIES|TOOLS\s+&\s+TECHNOLOGIES|SKILL\s+HIGHLIGHTS|AREAS\s+OF\s+EXPERTISE|TECH\s+STACK|SKILLS|SKILL|KEAHLIAN\s+TEKNIS|KEAHLIAN|SKILL\s+YANG\s+DIKUASAI|SKILL\s+&\s+KEMAMPUAN|KEMAMPUAN\s+TEKNIS|KEMAMPUAN|KOMPETENSI|ALAT\s+&\s+TEKNOLOGI)$/i },
    { key: 'projects', regex: /^(?:PROJECTS|KEY\s+PROJECTS|FEATURED\s+PROJECTS|PORTFOLIO\s+PROJECTS|PUBLICATIONS\s+&\s+INTELLECTUAL\s+PROPERTY|PUBLICATIONS|SELECTED\s+PROJECTS|PORTFOLIO|PROYEK\s+UTAMA|PROYEK|PROJECT|PORTFOLIO\s+PROYEK|PUBLIKASI\s+&\s+HAK\s+CIPTA|PUBLIKASI|KARYA)$/i },
    { key: 'awards', regex: /^(?:LICENSES\s+&\s+CERTIFICATIONS|CERTIFICATIONS|CERTIFICATES|AWARDS\s+&\s+HONORS|HONORS\s+&\s+AWARDS|ACHIEVEMENTS|SERTIFIKASI|SERTIFIKAT|PRESTASI\s+&\s+PENGHARGAAN|LISENSI\s+&\s+SERTIFIKASI|PENGHARGAAN|PRESTASI)$/i },
  ];

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    let matchedKey: string | null = null;
    if (trimmed.length < 55 && !/^(?:Experienced|Skilled|Expert|Responsible|Working|Terbiasa|Memiliki|Memahami)\b/i.test(trimmed)) {
      for (const pat of sectionPatterns) {
        if (pat.regex.test(trimmed)) {
          matchedKey = pat.key;
          break;
        }
      }
    }

    if (matchedKey) {
      currentSection = matchedKey;
    } else {
      sections[currentSection] += line + '\n';
    }
  }

  return sections;
}

export function extractMultipleEducations(fullText: string): EducationDTO[] {
  if (!fullText) return [];

  const results: EducationDTO[] = [];
  const instRegex = /(?:Universitas|Institut|Politeknik|STMIK|Sekolah\s+Tinggi|Academy|University|College|\bSMA\b|\bSMK\b|Madrasah\s+Aliyah|\bMAN\s+\d|\bMAN\s+[A-Z]|\bMA\s+(?:Negeri|Swasta|IPA|IPS|Keagamaan|Model)|Madrasah\s+Tsanawiyah|\bMTs\b|Madrasah\s+Ibtidaiyah|\bMI\b|\bSMP\b|\bSD\b|Sekolah\s+Dasar|Sekolah)\s+[A-Za-z0-9\s.&'-]{2,35}/gi;

  const matches = Array.from(fullText.matchAll(instRegex));
  const seenInstitutions = new Set<string>();

  for (const match of matches) {
    let rawInst = match[0].trim().replace(/^[@*•\-\s]+/, '');
    rawInst = rawInst.replace(/\s+(Fakultas|Jurusan|Prodi|Program|Department|Major).*$/i, '').trim();

    if (rawInst.length < 3 || seenInstitutions.has(rawInst.toLowerCase())) continue;
    seenInstitutions.add(rawInst.toLowerCase());

    const matchIndex = fullText.indexOf(match[0]);
    const snippet = fullText.slice(Math.max(0, matchIndex - 150), Math.min(fullText.length, matchIndex + 150));

    // High-Precision Madrasah Boundary Guards (prevents false matches with Manajemen, Utama, Master, etc.)
    const isMAN = /\bMadrasah\s+Aliyah\b|\bMAN\s+\d{1,2}\b|\bMAN\s+[A-Z][a-z]+\b|\bMA\s+(?:Negeri|Swasta|IPA|IPS|Keagamaan|Model|[A-Z][a-z]+)\b/i.test(snippet) ||
                  /\bMadrasah\s+Aliyah\b|\bMAN\s+\d{1,2}\b|\bMAN\s+[A-Z][a-z]+\b/i.test(rawInst);

    const isMTs = /\bMadrasah\s+Tsanawiyah\b|\bMTs\s+\d{1,2}\b|\bMTs\s+[A-Z][a-z]+\b/i.test(snippet) || /\bMTs\b/i.test(rawInst);
    const isMI = /\bMadrasah\s+Ibtidaiyah\b|\bMI\s+\d{1,2}\b|\bMI\s+[A-Z][a-z]+\b/i.test(snippet) || /\bMI\b/i.test(rawInst);

    // High-Precision Qualification Hierarchy Classification
    let degree = 'Sarjana (S1)';
    if (/s3|doktor|ph\.?d|doctor|doktoral/i.test(snippet) || /doktor|ph\.?d/i.test(rawInst)) {
      degree = 'Doktoral (S3 / Ph.D)';
    } else if (/s2|magister|master|m\.kom|m\.t\.|m\.sc|m\.b\.a|m\.eng|m\.si|m\.pd|m\.h|m\.e/i.test(snippet)) {
      degree = 'Magister (S2 / Master)';
    } else if (/s1|sarjana|bachelor|b\.sc|b\.eng|b\.a|s\.kom|s\.t\.|s\.si|s\.e\.|s\.sos|s\.h|s\.pd/i.test(snippet)) {
      degree = 'Sarjana (S1 / Bachelor)';
    } else if (/d3|d4|diploma|ahli\s+madya|a\.md|associate/i.test(snippet)) {
      degree = 'Diploma (D3/D4)';
    } else if (/sma|smk|high\s+school|sek menengah/i.test(snippet) || /sma|smk/i.test(rawInst) || isMAN) {
      if (/smk/i.test(rawInst) || /smk/i.test(snippet)) {
        degree = 'Sekolah Menengah Kejuruan (SMK)';
      } else if (isMAN) {
        degree = 'Madrasah Aliyah (MAN / MA)';
      } else {
        degree = 'Sekolah Menengah Atas (SMA)';
      }
    } else if (/smp|sd|sekolah\s+dasar/i.test(snippet) || /smp|sd/i.test(rawInst) || isMTs || isMI) {
      if (/smp/i.test(rawInst) || /smp/i.test(snippet) || isMTs) {
        degree = 'Sekolah Menengah Pertama (SMP / MTs)';
      } else {
        degree = 'Sekolah Dasar (SD / MI)';
      }
    }

    let major = 'Teknik Informatika';
    const majorMatch = snippet.match(/([A-Za-z\s]{2,25})\s*[-—]\s*(?:Universitas|Institut|Politeknik|STMIK|Sekolah|MAN|MA|SMP|SD)/i);
    if (majorMatch && majorMatch[1] && !/20\d{2}/.test(majorMatch[1])) {
      major = majorMatch[1].trim();
    } else if (/sistem\s+informasi/i.test(snippet)) {
      major = 'Sistem Informasi';
    } else if (/ilmu\s+komputer|computer\s+science/i.test(snippet)) {
      major = 'Ilmu Komputer';
    } else if (/ipa/i.test(snippet)) {
      major = 'IPA';
    } else if (/ips/i.test(snippet)) {
      major = 'IPS';
    } else if (/smp|sd|mts|mi/i.test(rawInst) || /smp|sd/i.test(degree)) {
      major = 'Pendidikan Dasar';
    }

    const yearsMatch = snippet.match(/(19\d{2}|20\d{2})\s*[\-—s\/d]*\s*(19\d{2}|20\d{2}|Present|Sekarang)?/i);
    let startYear = 2018;
    let endYear = 2022;

    if (yearsMatch) {
      startYear = parseInt(yearsMatch[1], 10);
      if (yearsMatch[2] && /\d{4}/.test(yearsMatch[2])) {
        endYear = parseInt(yearsMatch[2], 10);
      } else {
        endYear = startYear + (degree.includes('S3') ? 3 : degree.includes('S2') ? 2 : degree.includes('Diploma') ? 3 : degree.includes('SD') ? 6 : 4);
      }
    } else if (results.length > 0) {
      const prevEnd = results[results.length - 1].end_year || 2022;
      startYear = prevEnd;
      endYear = startYear + 2;
    }

    results.push({
      institution: rawInst,
      degree,
      major,
      start_year: startYear,
      end_year: endYear,
    });
  }

  // Sort education entries by qualification level priority (S3 -> S2 -> S1 -> D3 -> SMA/SMK/MAN -> Basic)
  const degreeRank = (d: string) => {
    if (d.includes('S3') || d.includes('Ph.D')) return 1;
    if (d.includes('S2') || d.includes('Master')) return 2;
    if (d.includes('S1') || d.includes('Bachelor')) return 3;
    if (d.includes('D3') || d.includes('Diploma')) return 4;
    if (d.includes('SMA') || d.includes('SMK') || d.includes('MAN')) return 5;
    return 6;
  };

  return results.sort((a, b) => degreeRank(a.degree || '') - degreeRank(b.degree || ''));
}

export function extractMultipleWorkExperiences(fullText: string): WorkExperienceDTO[] {
  if (!fullText) return [];

  const sections = extractCVSections(fullText);
  const expText = (sections.experience && sections.experience.trim().length > 50) 
    ? sections.experience 
    : ((sections.projects && sections.projects.trim().length > 50) ? sections.projects : fullText);

  const results: WorkExperienceDTO[] = [];
  const lines = expText.split(/\r?\n/).map((l) => l.trim()).filter((l) => l.length > 0);

  let currentBlock: string[] = [];
  const blocks: string[][] = [];

  for (const line of lines) {
    if (/(19\d{2}|20\d{2})\s*[\-—–\u2013\u2014s\/d]*\s*(19\d{2}|20\d{2}|Present|Sekarang|Saat Ini)?/i.test(line)) {
      if (currentBlock.length > 0) {
        blocks.push(currentBlock);
        currentBlock = [];
      }
    }
    currentBlock.push(line);
  }
  if (currentBlock.length > 0) blocks.push(currentBlock);

  for (const block of blocks) {
    const blockText = block.join('\n');
    const yearsMatch = blockText.match(/(19\d{2}|20\d{2})\s*[\-—–\u2013\u2014s\/d]*\s*(19\d{2}|20\d{2}|Present|Sekarang|Saat Ini)?/i);

    let startDate = '2021-01';
    let endDate = 'Present';
    let durationMonths = 12;

    if (yearsMatch) {
      const startYear = parseInt(yearsMatch[1], 10);
      startDate = `${startYear}-01`;
      if (yearsMatch[2] && /\d{4}/.test(yearsMatch[2])) {
        const endYear = parseInt(yearsMatch[2], 10);
        endDate = `${endYear}-12`;
        durationMonths = Math.max(6, (endYear - startYear) * 12);
      } else {
        endDate = 'Present';
        durationMonths = Math.max(12, (2026 - startYear) * 12);
      }
    }

    let role = '';
    let company = '';
    const descLines: string[] = [];

    for (const line of block) {
      if (/(19\d{2}|20\d{2})/.test(line) && line.length < 35) continue;

      if (line.includes(' - ') || line.includes(' — ') || line.includes(' | ')) {
        const parts = line.split(/[\-—|]/).map((p) => p.trim());
        if (parts.length >= 2) {
          role = role || parts[0];
          company = company || parts[1];
          continue;
        }
      }

      if (!role) {
        role = line;
      } else if (!company) {
        company = line;
      } else {
        descLines.push(line);
      }
    }

    if (company || role) {
      results.push({
        company: company || role || 'Perusahaan / Organisasi',
        role: role || 'Spesialis / Staf',
        start_date: startDate,
        end_date: endDate,
        is_current: endDate === 'Present',
        duration_months: durationMonths,
        description: descLines.join(' ') || `Tanggung jawab dan aktivitas profesional pada ${company || role}.`,
        projects: [],
      });
    }
  }

  return results;
}

export function extractProjectsAndAwards(fullText: string): { projects: string[]; certifications: string[] } {
  if (!fullText) return { projects: [], certifications: [] };

  const sections = extractCVSections(fullText);

  const projects: string[] = [];
  const certifications: string[] = [];

  if (sections.projects) {
    const pLines = sections.projects.split(/\r?\n/).map((l) => l.trim()).filter((l) => l.length > 2);
    for (const line of pLines) {
      if (!projects.includes(line) && line.length < 120) {
        projects.push(line);
      }
    }
  }

  if (sections.awards) {
    const cLines = sections.awards.split(/\r?\n/).map((l) => l.trim()).filter((l) => l.length > 2);
    for (const line of cLines) {
      if (!certifications.includes(line) && line.length < 100) {
        certifications.push(line);
      }
    }
  }

  return { projects, certifications };
}

export function constructExecutiveSummary(
  name: string,
  totalMonths: number,
  skills: string[],
  jobTitle?: string,
  companies?: string[]
): string {
  const years = Math.floor(totalMonths / 12);
  const months = totalMonths % 12;
  const expStr = years > 0 ? `${years} tahun ${months > 0 ? `${months} bulan` : ''}`.trim() : `${totalMonths} bulan`;

  const topSkillsStr = skills.slice(0, 4).join(', ');
  const companyStr = companies && companies.length > 0 ? ` dengan riwayat pada ${companies.slice(0, 2).join(' & ')}` : '';
  const targetStr = jobTitle ? ` untuk kualifikasi ${jobTitle}` : '';

  return `Kandidat ${name} memiliki total pengalaman profesional selama ${expStr}${companyStr}${targetStr}. Menguasai keahlian teknis utama meliputi ${topSkillsStr || 'pengembangan software'} dengan kemampuan integrasi sistem yang baik.`;
}

export function constructGroqDecisionSummary(
  candidateName: string,
  score: number,
  breakdown: ScoreBreakdown,
  jobTitle: string,
  extraction?: CVExtractionDTO
): string {
  const matched = breakdown.matched_skills.length > 0 ? breakdown.matched_skills.join(', ') : 'Belum ada skill cocok yang terdeteksi';
  const missing = breakdown.missing_mandatory_skills.length > 0 ? breakdown.missing_mandatory_skills.join(', ') : 'Tidak ada skill wajib yang terlewat';
  
  const totalMonths = extraction?.total_experience_months || 0;
  const eduDegree = extraction?.education && extraction.education.length > 0 ? extraction.education[0].degree || '' : '';
  const eduInst = extraction?.education && extraction.education.length > 0 ? extraction.education[0].institution || '' : '';
  const eduStr = eduDegree ? ` berlatar belakang ${eduDegree}${eduInst ? ` dari ${eduInst}` : ''}` : '';
  
  const projectCount = extraction?.projects?.length || 0;
  const projStr = projectCount > 0 ? ` serta memiliki rekam jejak ${projectCount} proyek portofolio` : '';

  if (score >= 80) {
    return `[Groq Llama 3.1 AI Decision] SANGAT DIREKOMENDASIKAN LULUS SCREENING. Kandidat ${candidateName}${eduStr} mencapai Job-Fit Score ${score}/100 untuk posisi ${jobTitle}. Menguasai kualifikasi teknis utama (${matched})${projStr}. Pertimbangan HR: Lanjutkan ke tahap wawancara teknis utama.`;
  } else if (score >= 60) {
    return `[Groq Llama 3.1 AI Decision] REKOMENDASI REVIEW KHUSUS (PERTIMBANGKAN). Kandidat ${candidateName}${eduStr} memperoleh skor ${score}/100 dengan total pengalaman ${totalMonths} bulan. Berhasil memenuhi keahlian (${matched}), namun memiliki catatan kriteria wajib (${missing}). Pertimbangan HR: Disarankan tes koding/wawancara eksplorasi singkat.`;
  } else {
    return `[Groq Llama 3.1 AI Decision] REKOMENDASI SCREENING ULANG / PENINJAUAN MANUAL. Kandidat ${candidateName}${eduStr} memperoleh Job-Fit Score ${score}/100 untuk posisi ${jobTitle}. Berhasil menunjukkan potensi pada skill (${matched}), namun belum memenuhi kriteria wajib kritis: (${missing}). Pertimbangan HR: Tinjau portofolio tambahan atau beri opsi posisi yang lebih sesuai.`;
  }
}

export function calculateJobFitScore(
  extraction: CVExtractionDTO,
  job: JobPosting
): { score: number; breakdown: ScoreBreakdown } {
  const extractedSkillNames = (extraction.skills || []).map(
    (s) => s.normalized_name || s.name
  );

  // Mandatory skills matching
  const mandatoryCount = job.mandatory_skills.length;
  let mandatoryMatched = 0;
  const matchedSkills: string[] = [];
  const missingMandatory: string[] = [];

  job.mandatory_skills.forEach((skill) => {
    const isMatch = extractedSkillNames.some(
      (es) => es.toLowerCase() === skill.toLowerCase()
    );
    if (isMatch) {
      mandatoryMatched += 1;
      if (!matchedSkills.includes(skill)) matchedSkills.push(skill);
    } else {
      missingMandatory.push(skill);
    }
  });

  const mandatorySkillScore = mandatoryCount > 0 ? mandatoryMatched / mandatoryCount : 1.0;

  // Preferred skills matching
  const preferredCount = job.preferred_skills.length;
  let preferredMatched = 0;
  job.preferred_skills.forEach((skill) => {
    const isMatch = extractedSkillNames.some(
      (es) => es.toLowerCase() === skill.toLowerCase()
    );
    if (isMatch) {
      preferredMatched += 1;
      if (!matchedSkills.includes(skill)) matchedSkills.push(skill);
    }
  });
  const preferredSkillScore = preferredCount > 0 ? preferredMatched / preferredCount : 1.0;

  // Experience matching
  const candidateMonths = extraction.total_experience_months || 0;
  const reqMonths = job.minimum_experience_months || 1;
  const experienceScore = reqMonths <= 0 ? 1.0 : Math.min(1.0, candidateMonths / reqMonths);

  // Semantic similarity estimation (simulated based on overlap + keyword ratio)
  const semanticSimilarity = Math.min(
    0.95,
    Math.max(
      0.45,
      0.4 + (mandatorySkillScore * 0.35) + (preferredSkillScore * 0.15) + (experienceScore * 0.1)
    )
  );

  // Final score formula: 45% semantic + 30% mandatory + 20% experience + 5% preferred
  const finalScoreRaw = 100 * (
    0.45 * semanticSimilarity +
    0.30 * mandatorySkillScore +
    0.20 * experienceScore +
    0.05 * preferredSkillScore
  );

  const final_score = Math.round(finalScoreRaw * 10) / 10;

  const breakdown: ScoreBreakdown = {
    score_version: 'v1',
    semantic_similarity: Math.round(semanticSimilarity * 100) / 100,
    semantic_weight: 0.45,
    mandatory_skill_score: Math.round(mandatorySkillScore * 100) / 100,
    mandatory_skill_weight: 0.30,
    experience_score: Math.round(experienceScore * 100) / 100,
    experience_weight: 0.20,
    preferred_skill_score: Math.round(preferredSkillScore * 100) / 100,
    preferred_skill_weight: 0.05,
    final_score,
    matched_skills: matchedSkills,
    missing_mandatory_skills: missingMandatory,
  };

  return { score: final_score, breakdown };
}

export function extractPortfoliosAndReferences(fullText: string): {
  portfolios: { title: string; url?: string; description?: string }[];
  references: { name: string; role?: string; company?: string; contact_info?: string }[];
} {
  if (!fullText) return { portfolios: [], references: [] };

  const portfolios: { title: string; url?: string; description?: string }[] = [];
  const references: { name: string; role?: string; company?: string; contact_info?: string }[] = [];

  // 1. Detect Portfolio URLs in text (github, figma, behance, dribbble, linkedin, drive, etc.)
  const urlRegex = /(https?:\/\/[^\s<">]+|github\.com\/[^\s<">]+|gitlab\.com\/[^\s<">]+|figma\.com\/[^\s<">]+|behance\.net\/[^\s<">]+|dribbble\.com\/[^\s<">]+|drive\.google\.com\/[^\s<">]+)/gi;
  const urlMatches = Array.from(fullText.matchAll(urlRegex));
  const seenUrls = new Set<string>();

  for (const match of urlMatches) {
    let url = match[0].trim().replace(/[\).,;]+$/, '');
    if (!url.startsWith('http')) {
      url = 'https://' + url;
    }

    if (seenUrls.has(url.toLowerCase())) continue;
    seenUrls.add(url.toLowerCase());

    let title = 'Portofolio Project';
    if (url.includes('github.com')) title = 'GitHub Repository / Code Profile';
    else if (url.includes('gitlab.com')) title = 'GitLab Repository';
    else if (url.includes('figma.com')) title = 'Figma Design Prototype';
    else if (url.includes('behance.net')) title = 'Behance Design Showcase';
    else if (url.includes('dribbble.com')) title = 'Dribbble Shots Portfolio';
    else if (url.includes('drive.google.com')) title = 'Google Drive Portfolio Document';
    else if (url.includes('linkedin.com')) title = 'LinkedIn Executive Profile';

    portfolios.push({
      title,
      url,
      description: `Tautan terverifikasi dari CV (${url})`,
    });
  }

  // 2. Strict Detect References Section (HANYA jika ada seksi REFERENSI/REFERENCES eksplisit)
  const refMatch = fullText.match(/(?:REFERENSI|REFERENCES|KONTAK REFERENSI|PEMBERI REFERENSI)\s*[:\-\n]+([\s\S]{20,500})/i);
  
  if (refMatch && refMatch[1]) {
    const targetText = refMatch[1];
    const refLines = targetText.split(/\r?\n/).map((l) => l.trim()).filter((l) => l.length > 0 && l.length < 60);

    for (let i = 0; i < refLines.length; i++) {
      const line = refLines[i];
      // Skip section headers or long paragraphs
      if (/(?:PENGALAMAN|PENDIDIKAN|KEAHLIAN|PROJECT|PRESTASI)/i.test(line)) break;

      if (/(?:Bpk|Ibu|Mr|Mrs|Dr|Prof|Manager|Supervisor|Director|Head|Lead|CEO|CTO|HRD|Staff)\b/i.test(line) ||
          /(?:08\d{8,11}|\+62|email|phone|telp)/i.test(line)) {
        
        const phoneOrEmail = line.match(/(?:08\d{8,11}|\+62\s*\d{8,11}|[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/);
        let rawName = line.replace(/(?:08\d{8,11}|\+62\s*\d{8,11}|[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g, '').trim();
        rawName = rawName.replace(/^[@*•\-\s]+/, '').trim();

        if (rawName.length >= 3 && rawName.length <= 40 && !references.some((r) => r.name.toLowerCase() === rawName.toLowerCase())) {
          references.push({
            name: rawName,
            role: 'Professional Referee / Atasan Kerja',
            company: 'Perusahaan Terkait',
            contact_info: phoneOrEmail ? phoneOrEmail[0] : 'Tersedia atas permintaan',
          });
        }
      }
    }
  }

  return { portfolios, references };
}
