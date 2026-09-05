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

/**
 * Extract an Indonesian phone number. Returns '' when no plausible number exists
 * (never fabricates). Guards against matching years, GPA, percentages, ID numbers.
 */
export function parseAndNormalizePhoneNumber(text: string): string {
  if (!text) return '';

  const normalize = (raw: string): string => {
    const cleaned = raw.trim();

    const digitsOnly = cleaned.replace(/\D/g, '');

    if (digitsOnly.length < 7 || digitsOnly.length > 15) return '';

    // Indonesian Landlines with area code e.g. (021) 8852574 or 021-xxxxxx
    if (cleaned.startsWith('(') || /^02\d{1,2}/.test(cleaned) || /^\+62\s*2\d/.test(cleaned)) {
      return cleaned;
    }

    // Indonesian Mobile: 08xx or +62 8xx or 628xx
    if (digitsOnly.startsWith('628')) {
      const local = digitsOnly.slice(2);
      const prov = local.slice(0, 3);
      const mid = local.slice(3, 7);
      const rest = local.slice(7);
      return rest ? `+62 ${prov}-${mid}-${rest}` : `+62 ${prov}-${mid}`;
    } else if (digitsOnly.startsWith('08')) {
      const local = digitsOnly.slice(1);
      const prov = local.slice(0, 3);
      const mid = local.slice(3, 7);
      const rest = local.slice(7);
      return rest ? `+62 ${prov}-${mid}-${rest}` : `+62 ${prov}-${mid}`;
    }

    return cleaned;
  };

  // 1. Labeled: "Phone: +62 812...", "HP 0812...", "WhatsApp: 62812...", "Hub: (021) 8852574", "Contact: 08..."
  const labeled = text.match(
    /(?:phone|telepon|telp|tel|t|hp|handphone|mobile|cell|mob|wa|whatsapp|kontak|contact|hub|hubungi|no\.?\s*(?:hp|telp|telepon|tel|wa))\s*[:.\-]?\s*(\+?\(?\d{2,4}\)?[\d\s\-.()]{5,18}\d)/i
  );
  if (labeled && labeled[1]) {
    const n = normalize(labeled[1]);
    if (n) return n;
  }

  // 2. Landline e.g. (021) 8852574 or 021-xxxxxx
  const landline = text.match(/(?:\(\d{2,4}\)|\b02\d{1,2}[-\s]?)\s*[\d\s\-]{5,10}\d/);
  if (landline && landline[0]) {
    const n = normalize(landline[0]);
    if (n) return n;
  }

  // 3. Unlabeled Mobile: +62 8.., 62 8.., 08.. (not preceded by a digit)
  const generic = text.match(/(?<![\d/.])(?:\+?62\s*|0)8[\d\s\-.()]{6,16}\d(?![\d/])/);
  if (generic && generic[0]) {
    const n = normalize(generic[0]);
    if (n) return n;
  }

  // 4. General International Format: +XX XXXXXXX...
  const intl = text.match(/(?<![\d/.])\+\d{1,4}[\s\-.()]{5,16}\d(?![\d/])/);
  if (intl && intl[0]) {
    const n = normalize(intl[0]);
    if (n) return n;
  }

  return '';
}

/** Detect an explicit "since YYYY" / "sejak YYYY" career-start year in free text. */
export function parseSinceYear(text: string): number | null {
  const m = text.match(/\b(?:since|sejak|from|mulai)\s+((?:19|20)\d{2})\b/i);
  if (m) return parseInt(m[1], 10);
  return null;
}

/**
 * Rebuild line-structured text from pdf.js text items using their x/y geometry.
 * pdf.js otherwise yields items with no reliable line breaks; sections/education/
 * experience parsers all depend on real lines. Splits multi-column rows on wide
 * horizontal gaps. `items` are pdf.js TextItem-like objects with { str, transform }.
 */
export function reconstructPdfLines(
  items: { str: string; transform: number[]; width?: number }[],
  pageWidth = 600
): string {
  const glyphs = items
    .filter((it) => it && typeof it.str === 'string' && it.str.trim().length > 0)
    .map((it) => ({
      str: it.str,
      x: it.transform[4],
      y: it.transform[5],
      w: it.width || it.str.length * 5,
    }));
  if (glyphs.length === 0) return '';

  // Bucket by y (top-to-bottom). PDF y grows upward.
  glyphs.sort((a, b) => b.y - a.y || a.x - b.x);
  const rows: (typeof glyphs)[] = [];
  const yTol = 3;
  for (const g of glyphs) {
    const row = rows[rows.length - 1];
    if (row && Math.abs(row[0].y - g.y) <= yTol) row.push(g);
    else rows.push([g]);
  }

  const colGap = Math.max(40, pageWidth * 0.12);
  const lines: string[] = [];
  for (const row of rows) {
    row.sort((a, b) => a.x - b.x);
    let segment = '';
    let prevEnd = -Infinity;
    for (const g of row) {
      if (prevEnd !== -Infinity && g.x - prevEnd > colGap) {
        if (segment.trim()) lines.push(segment.trim());
        segment = '';
      }
      const needsSpace =
        segment.length > 0 && g.x - prevEnd > 1 && !segment.endsWith(' ');
      segment += (needsSpace ? ' ' : '') + g.str;
      prevEnd = g.x + g.w;
    }
    if (segment.trim()) lines.push(segment.trim());
  }
  return lines.join('\n');
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
    summary: '',
    experience: '',
    education: '',
    skills: '',
    projects: '',
    publications: '',
    awards: '',
    other: '',
  };

  if (!fullText) return sections;

  const sanitizedText = cleanOcrText(fullText);
  const lines = sanitizedText.split(/\r?\n/);
  let currentSection = 'other';

  const sectionPatterns: { key: keyof typeof sections; regex: RegExp }[] = [
    { key: 'summary', regex: /^(?:PROFESSIONAL\s+SUMMARY|SUMMARY|PROFILE|ABOUT\s+ME|OBJECTIVE|CAREER\s+OBJECTIVE|RINGKASAN|PROFIL|TENTANG\s+SAYA|RINGKASAN\s+PROFESIONAL)$/i },
    { key: 'experience', regex: /^(?:WORK\s+EXPERIENCE|PROFESSIONAL\s+EXPERIENCE|EMPLOYMENT\s+HISTORY|CAREER\s+HISTORY|WORK\s+HISTORY|RELEVANT\s+EXPERIENCE|EXPERIENCE|PENGALAMAN\s+KERJA|PENGALAMAN\s+PROFESIONAL|RIWAYAT\s+PEKERJAAN|RIWAYAT\s+KARIR|PENGALAMAN)$/i },
    { key: 'education', regex: /^(?:EDUCATION\s*(?:&\s*QUALIFICATIONS)?|ACADEMIC\s+BACKGROUND|ACADEMIC\s+HISTORY|HIGHER\s+EDUCATION|PENDIDIKAN\s+FORMAL|RIWAYAT\s+PENDIDIKAN|LATAR\s+BELAKANG\s+AKADEMIK|PENDIDIKAN|AKADEMIK)$/i },
    { key: 'skills', regex: /^(?:TECHNICAL\s+SKILLS|SKILLS\s*(?:&\s*COMPETENCIES)?|CORE\s+COMPETENCIES|TECHNOLOGIES|TOOLS\s*&\s*TECHNOLOGIES|SKILL\s+HIGHLIGHTS|AREAS\s+OF\s+EXPERTISE|TECH\s+STACK|SKILL|KEAHLIAN\s+TEKNIS|KEAHLIAN|SKILL\s+YANG\s+DIKUASAI|KEMAMPUAN\s+TEKNIS|KEMAMPUAN|KOMPETENSI|ALAT\s*&\s*TEKNOLOGI)$/i },
    { key: 'projects', regex: /^(?:PROJECTS|KEY\s+PROJECTS|FEATURED\s+PROJECTS|PORTFOLIO\s+PROJECTS|SELECTED\s+PROJECTS|PERSONAL\s+PROJECTS|PORTFOLIO|PROYEK\s+UTAMA|PROYEK|PROJECT|PORTFOLIO\s+PROYEK|KARYA)$/i },
    { key: 'publications', regex: /^(?:PUBLICATIONS\s*(?:&\s*INTELLECTUAL\s+PROPERTY)?|RESEARCH|RESEARCH\s+&\s+PUBLICATIONS|PUBLIKASI\s*(?:&\s*HAK\s+CIPTA)?|PENELITIAN)$/i },
    { key: 'awards', regex: /^(?:LICENSES\s*&\s*CERTIFICATIONS|CERTIFICATIONS|CERTIFICATES|AWARDS\s*(?:&\s*HONORS)?|HONORS\s*&\s*AWARDS|ACHIEVEMENTS|SERTIFIKASI|SERTIFIKAT|PRESTASI\s*(?:&\s*PENGHARGAAN)?|LISENSI\s*&\s*SERTIFIKASI|PENGHARGAAN|PRESTASI)$/i },
  ];

  const looksLikeHeader = (s: string) =>
    s.length >= 3 &&
    s.length <= 45 &&
    s === s.toUpperCase() &&
    /[A-Z]/.test(s) &&
    !/[.:;•]/.test(s) &&
    !/\d{3}/.test(s);

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    let matchedKey: string | null = null;
    const headerCandidate = trimmed.replace(/[^A-Za-z\s&]/g, '').trim();
    if (
      trimmed.length < 55 &&
      !/^(?:Experienced|Skilled|Expert|Responsible|Working|Terbiasa|Memiliki|Memahami)\b/i.test(trimmed)
    ) {
      for (const pat of sectionPatterns) {
        if (pat.regex.test(headerCandidate)) {
          matchedKey = pat.key;
          break;
        }
      }
      // Unknown ALL-CAPS heading -> stop feeding the previous section (dump to other)
      if (!matchedKey && looksLikeHeader(trimmed)) matchedKey = 'other';
    }

    if (matchedKey) {
      currentSection = matchedKey;
    } else {
      sections[currentSection] += line + '\n';
    }
  }

  return sections;
}

/**
 * Parse a PROJECTS section into structured entries. Handles the common
 * two-column CV layout where a header row carries "<Name> — <subtitle>" plus a
 * tech-stack list, and the row below carries a one-line description plus a
 * date range, followed by achievement bullets.
 */
export interface ProjectEntry {
  name: string;
  subtitle: string;
  tech: string[];
  description: string;
  start_year: number | null;
  end_year: number | null;
  is_current: boolean;
}

const YEAR_RANGE = /((?:19|20)\d{2})\s*(?:[–\-—]|to|s\/d|sd|until)?\s*((?:19|20)\d{2}|Present|Sekarang|Now|Current|Saat\s+Ini)?/i;

const isBullet = (l: string) => /^\s*[•▪●○‣*·]|^\s*-\s/.test(l);

const DATE_ONLY_RE =
  /^\(?(?:19|20)\d{2}\)?\s*(?:[–—-]\s*(?:(?:19|20)\d{2}|Present|Sekarang|Now|Current|Saat\s*Ini))?\s*$/i;
const TRAILING_DATE_RE =
  /\s*\(?((?:19|20)\d{2})\)?\s*(?:[–—-]\s*((?:19|20)\d{2}|Present|Sekarang|Now|Current|Saat\s*Ini))?\s*$/i;

const looksLikeTechList = (s: string) => {
  const parts = s.split(',').map((t) => t.trim());
  return (
    parts.length >= 2 &&
    parts.every((t) => t.length > 0 && t.length < 40 && !/[.!?]$/.test(t) && !/\b(the|and|with|for|to)\b/i.test(t)) &&
    /^[A-Za-z0-9]/.test(s.trim()) &&
    !/(?:19|20)\d{2}/.test(s)
  );
};

/** Split "<subtitle> Tech, Tech, Tech" into a subtitle and a tech array. */
const splitSubtitleTech = (rest: string): { subtitle: string; tech: string[] } => {
  if (!rest.includes(',')) return { subtitle: rest.trim(), tech: [] };
  const tokens = rest.split(',').map((t) => t.trim()).filter(Boolean);
  const firstWords = tokens[0].split(/\s+/);
  if (firstWords.length >= 3) {
    // first token carries "<subtitle words> <first tech>"
    const firstTech = firstWords.pop() as string;
    return { subtitle: firstWords.join(' '), tech: [firstTech, ...tokens.slice(1)] };
  }
  if (looksLikeTechList(rest)) return { subtitle: '', tech: tokens };
  return { subtitle: rest.trim(), tech: [] };
};

export function parseProjectEntries(fullText: string): ProjectEntry[] {
  const sections = extractCVSections(fullText);
  const src = sections.projects && sections.projects.trim().length > 20 ? sections.projects : '';
  if (!src) return [];

  // Split two-column rows on wide whitespace gaps (mirrors geometry reconstruction
  // for text that arrived space-padded), then normalise each segment.
  const segments: string[] = [];
  for (const raw of src.split(/\r?\n/)) {
    const line = raw.replace(/\s+$/, '');
    if (!line.trim()) continue;
    if (isBullet(line)) {
      segments.push(line.trim());
      continue;
    }
    for (const seg of line.split(/\s{3,}/)) {
      const s = seg.trim();
      if (s) segments.push(s);
    }
  }

  const rows = segments.map((l) => {
    if (DATE_ONLY_RE.test(l)) return { text: '', date: l, bullet: false };
    const bullet = isBullet(l);
    const dm = l.match(TRAILING_DATE_RE);
    if (dm && !bullet && (dm.index ?? 0) > 6) {
      return { text: l.slice(0, dm.index).trim(), date: dm[0].trim(), bullet: false };
    }
    return { text: l, date: '', bullet };
  });

  const entries: ProjectEntry[] = [];
  let cur: ProjectEntry | null = null;
  const flush = () => {
    if (cur && cur.name) {
      cur.description = cur.description.trim();
      entries.push(cur);
    }
    cur = null;
  };

  const applyDate = (target: ProjectEntry | null, date: string) => {
    if (!target || !date) return;
    const m = date.match(YEAR_RANGE);
    if (!m) return;
    const start = parseInt(m[1], 10);
    if (!target.start_year || start < target.start_year) target.start_year = start;
    if (m[2]) {
      if (/present|sekarang|now|current|saat/i.test(m[2])) {
        target.is_current = true;
        target.end_year = new Date().getFullYear();
      } else {
        target.end_year = parseInt(m[2], 10);
      }
    } else if (!target.end_year) {
      target.end_year = start;
    }
  };

  const hasSep = (t: string) => /\S\s[–—]\s\S|\S\s-\s\S/.test(t);
  const titleCaseish = (t: string) => {
    const words = t.replace(/[(),.]/g, '').split(/\s+/).filter(Boolean);
    if (words.length === 0 || words.length > 9) return false;
    const stray = words.filter(
      (w) => /^[a-z]/.test(w) && !/^(a|an|the|of|and|or|for|to|in|on|at|with|via|&|de)$/i.test(w)
    );
    return stray.length === 0;
  };

  for (let i = 0; i < rows.length; i++) {
    const { text, date, bullet } = rows[i];

    if (!text) {
      applyDate(cur, date);
      continue;
    }

    if (bullet) {
      if (cur) cur.description += (cur.description ? ' ' : '') + text.replace(/^\s*[•▪●○‣*·-]\s*/, '');
      continue;
    }

    const lookahead = rows.slice(i + 1, i + 6);
    const followedByBullet = lookahead.some((r) => r.bullet);
    const followedByTechOrDate = lookahead.some((r) => r.date || (r.text && looksLikeTechList(r.text)));
    const isTech = looksLikeTechList(text);
    const startsUpper = /^[A-Z0-9"']/.test(text);
    const endsSentence = /[.!?]$/.test(text);

    const isHeader =
      startsUpper &&
      !isTech &&
      !endsSentence &&
      text.length >= 3 &&
      text.length <= 130 &&
      (hasSep(text) || titleCaseish(text)) &&
      (hasSep(text) || followedByBullet || followedByTechOrDate);

    if (isHeader) {
      flush();
      let name = text;
      let subtitle = '';
      let tech: string[] = [];
      if (hasSep(text)) {
        const [n, ...restParts] = text.split(/\s[–—-]\s/);
        name = n.trim();
        const st = splitSubtitleTech(restParts.join(' - ').trim());
        subtitle = st.subtitle;
        tech = st.tech;
      }
      cur = { name, subtitle, tech, description: '', start_year: null, end_year: null, is_current: false };
      applyDate(cur, date);
      continue;
    }

    if (!cur) continue;

    applyDate(cur, date);

    if (cur.tech.length === 0 && isTech) {
      cur.tech = text.split(',').map((t) => t.trim());
      continue;
    }
    if (!cur.subtitle && text.length < 90 && !/[.!?]$/.test(text)) {
      cur.subtitle = text;
      continue;
    }
    cur.description += (cur.description ? ' ' : '') + text;
  }
  flush();

  return entries;
}

const INSTITUTION_RE =
  /\b(Universitas|University|Institut(?:e)?|Politeknik|Polytechnic|STMIK|STIE|STT|Sekolah\s+Tinggi|Academy|Akademi|College|Madrasah\s+Aliyah|Madrasah\s+Tsanawiyah|Madrasah\s+Ibtidaiyah|SMA(?:\s+Negeri)?|SMK(?:\s+Negeri)?|SMP(?:\s+Negeri)?|SD(?:\s+Negeri)?|MAN|MTsN?|MIN?)\b/i;

/** Map a degree line to a normalised Indonesian qualification label. */
export function classifyDegree(text: string): string {
  const t = ` ${text.toLowerCase()} `;
  if (/\b(s-?3|doktor(al)?|ph\.?\s?d|d\.?phil|doctor(ate)?)\b|\bdr\.\s/.test(t)) return 'Doktoral (S3 / Ph.D)';
  if (/\b(s-?2|magister|master(?:'s)?|m\.kom|m\.t\b|m\.sc|m\.eng|m\.si|m\.pd|m\.ba|mba|m\.hum|m\.h\b|m\.m\b|m\.e\b)\b/.test(t))
    return 'Magister (S2 / Master)';
  if (/\b(s-?1|sarjana|bachelor(?:'s)?|b\.sc|b\.eng|b\.a\b|s\.kom|s\.t\b|s\.si|s\.e\b|s\.sos|s\.h\b|s\.pd|s\.ds|s\.ars|s\.ak|undergraduate)\b/.test(t))
    return 'Sarjana (S1 / Bachelor)';
  if (/\b(d-?4|d-?3|d-?1|d-?2|diploma|ahli\s+madya|a\.md|associate\s+degree|vocational\s+diploma)\b/.test(t))
    return 'Diploma (D1-D4)';
  if (/\b(smk|vocational\s+high\s+school|sekolah\s+menengah\s+kejuruan)\b/.test(t)) return 'SMK / Vocational';
  if (/\b(sma|man\b|madrasah\s+aliyah|senior\s+high\s+school|high\s+school|sekolah\s+menengah\s+atas)\b/.test(t))
    return 'SMA / MA';
  if (/\b(smp|mts\b|madrasah\s+tsanawiyah|junior\s+high\s+school|sekolah\s+menengah\s+pertama)\b/.test(t))
    return 'SMP / MTs';
  if (/\b(\bsd\b|min\b|mi\b|madrasah\s+ibtidaiyah|elementary\s+school|sekolah\s+dasar)\b/.test(t)) return 'SD / MI';
  return '';
}

const degreeRank = (d = ''): number => {
  if (/S3|Ph\.D|Doktor/i.test(d)) return 1;
  if (/S2|Master|Magister/i.test(d)) return 2;
  if (/S1|Bachelor|Sarjana/i.test(d)) return 3;
  if (/Diploma|D1-D4|D3|D4/i.test(d)) return 4;
  if (/SMK|SMA|MA\b/i.test(d)) return 5;
  if (/SMP|MTs/i.test(d)) return 6;
  return 7;
};

export function sortEducations(list: EducationDTO[]): EducationDTO[] {
  return [...list].sort(
    (a, b) =>
      degreeRank(a.degree || '') - degreeRank(b.degree || '') ||
      (b.end_year || 0) - (a.end_year || 0)
  );
}

const LOCATION_TAIL_RE =
  /\s*[,•|]?\s*(?:Semarang|Jakarta|Bandung|Surabaya|Yogyakarta|Malang|Medan|Depok|Bogor|Tangerang|Bekasi|Indonesia|Remote|Hybrid|On-?site|[A-Z][a-z]+,\s*Indonesia)\s*$/;

const pickMajor = (degreeLine: string): string => {
  // "Master of Computer Science (M.Kom.), Informatics Engineering — GPA: 3.96 / 4.00"
  const afterParen = degreeLine.match(/\)\s*[,-]\s*([A-Za-z][A-Za-z&/ .-]{2,50})/);
  let major = afterParen ? afterParen[1] : '';
  if (!major) {
    const afterComma = degreeLine.split(',')[1];
    if (afterComma) major = afterComma;
  }
  if (!major) {
    const inField = degreeLine.match(/(?:of|in|jurusan|prodi|program studi)\s+([A-Za-z][A-Za-z&/ .-]{2,50})/i);
    if (inField) major = inField[1];
  }
  return major
    .replace(/[—–-]\s*GPA.*/i, '')
    .replace(/\bGPA.*/i, '')
    .replace(/(?:19|20)\d{2}.*/, '')
    .replace(/[—–-]\s*$/, '')
    .trim();
};

/** Parse a clean EDUCATION section: institution line, then a degree/major line. */
function parseEducationSection(sectionText: string): EducationDTO[] {
  const lines = sectionText
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0 && !/^[•\-*·]/.test(l));

  const out: EducationDTO[] = [];
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (!INSTITUTION_RE.test(line)) continue;

    const institution = line
      .replace(LOCATION_TAIL_RE, '')
      .replace(/\s{2,}.*$/, '')
      .replace(/[,•|].*$/, '')
      .trim();

    // Look ahead for the degree line; join wrapped continuation lines up to the
    // next institution (pdftotext often wraps a long degree across 2 lines).
    const window: string[] = [];
    for (let k = i + 1; k < Math.min(lines.length, i + 6); k++) {
      if (INSTITUTION_RE.test(lines[k])) break;
      window.push(lines[k]);
    }
    let degreeLine = '';
    const degStart = window.findIndex((w) => classifyDegree(w));
    if (degStart >= 0) {
      degreeLine = window
        .slice(degStart, degStart + 3)
        .join(' ')
        .replace(/\s{2,}/g, ' ')
        .trim();
    }

    const yearHay = [line, ...window].join(' ');
    const ym = yearHay.match(/((?:19|20)\d{2})\s*[–\-—]\s*((?:19|20)\d{2}|Present|Sekarang|Now)?/i);
    let startYear: number | undefined;
    let endYear: number | undefined;
    if (ym) {
      startYear = parseInt(ym[1], 10);
      if (ym[2] && /\d{4}/.test(ym[2])) endYear = parseInt(ym[2], 10);
      else if (ym[2]) endYear = new Date().getFullYear();
    } else {
      const single = yearHay.match(/\b((?:19|20)\d{2})\b/);
      if (single) endYear = parseInt(single[1], 10);
    }

    const degree = classifyDegree(degreeLine || line) || 'Sarjana (S1 / Bachelor)';
    const major = pickMajor(degreeLine) || '';

    if (institution.length >= 3) {
      out.push({
        institution,
        degree,
        major: major || 'Not specified',
        start_year: startYear,
        end_year: endYear,
      });
    }
  }
  return out;
}

export function extractMultipleEducations(fullText: string): EducationDTO[] {
  if (!fullText) return [];

  // --- Preferred path: parse the EDUCATION section line by line ---
  const sections = extractCVSections(fullText);
  const eduSrc = sections.education && sections.education.trim().length > 10 ? sections.education : '';
  if (eduSrc) {
    const parsed = parseEducationSection(eduSrc);
    if (parsed.length > 0) return sortEducations(parsed);
  }

  // --- Fallback: scan whole text with institution regex + local snippet ---
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

  return sortEducations(results);
}

const monthsBetween = (start: number | null, end: number | null, current: boolean): number => {
  const now = new Date().getFullYear();
  const s = start || (end ? end - 1 : now - 1);
  const e = current ? now : end || s;
  return Math.max(3, Math.round((e - s) * 12) || 12);
};

const projectEntryToExperience = (p: ProjectEntry): WorkExperienceDTO => ({
  company: p.name,
  role: p.subtitle || 'Project / Research',
  start_date: p.start_year ? `${p.start_year}-01` : '',
  end_date: p.is_current ? 'Present' : p.end_year ? `${p.end_year}-12` : '',
  is_current: p.is_current,
  duration_months: monthsBetween(p.start_year, p.end_year, p.is_current),
  description: p.description || p.subtitle || `Project: ${p.name}.`,
  projects: p.tech.length > 0 ? p.tech : [p.name],
  technologies: p.tech,
});

/**
 * Structured work-experience list. Uses a real WORK EXPERIENCE section when
 * present; otherwise derives entries from the PROJECTS section so a
 * project-centric CV still yields a proper list (never a single blob entry).
 */
export function extractMultipleWorkExperiences(fullText: string): WorkExperienceDTO[] {
  if (!fullText) return [];

  const sections = extractCVSections(fullText);
  const expText =
    sections.experience && sections.experience.trim().length > 50 ? sections.experience : '';

  if (!expText) {
    const projectEntries = parseProjectEntries(fullText);
    return projectEntries.map(projectEntryToExperience);
  }

  const results: WorkExperienceDTO[] = [];
  const lines = expText
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  const isDateLine = (l: string) =>
    /((?:19|20)\d{2})\s*[–—\-s/d]+\s*((?:19|20)\d{2}|Present|Sekarang|Saat\s*Ini|Now)/i.test(l) ||
    /\b(?:Jan|Feb|Mar|Apr|Mei|May|Jun|Jul|Aug(?:ust)?|Agu|Sep|Okt|Oct|Nov|Des|Dec)[a-z]*\.?\s*(?:19|20)\d{2}/i.test(l);

  const blocks: string[][] = [];
  let block: string[] = [];
  for (const line of lines) {
    if (isDateLine(line) && block.some((b) => !isDateLine(b))) {
      block.push(line);
      blocks.push(block);
      block = [];
      continue;
    }
    block.push(line);
  }
  if (block.length) blocks.push(block);

  for (const b of blocks) {
    const text = b.join('\n');
    const ym = text.match(
      /((?:19|20)\d{2})\s*[–—\-s/d]*\s*((?:19|20)\d{2}|Present|Sekarang|Saat\s*Ini|Now)?/i
    );
    let startDate = '';
    let endDate = '';
    let isCurrent = false;
    let months = 12;
    if (ym) {
      const sy = parseInt(ym[1], 10);
      startDate = `${sy}-01`;
      if (ym[2] && /\d{4}/.test(ym[2])) {
        const ey = parseInt(ym[2], 10);
        endDate = `${ey}-12`;
        months = Math.max(3, (ey - sy) * 12);
      } else if (ym[2]) {
        isCurrent = true;
        endDate = 'Present';
        months = Math.max(6, (new Date().getFullYear() - sy) * 12);
      } else {
        endDate = `${sy}-12`;
        months = 12;
      }
    }

    const headerLines = b.filter((l) => !isDateLine(l) && !/^[•\-*·]/.test(l));
    const bulletLines = b
      .filter((l) => /^[•\-*·]/.test(l))
      .map((l) => l.replace(/^[•\-*·]\s*/, ''));

    let role = '';
    let company = '';
    const header = headerLines[0] || '';
    if (/\s[–—|]\s|\sat\s|\s@\s|,\s/.test(header)) {
      const parts = header.split(/\s[–—|@]\s|\sat\s|,\s/).map((p) => p.trim());
      role = parts[0] || '';
      company = parts[1] || '';
    } else {
      role = header;
      company = headerLines[1] || '';
    }

    const descText = [...headerLines.slice(company ? 2 : 1), ...bulletLines].join(' ').trim();

    if (role || company) {
      results.push({
        company: company || role,
        role: role || 'Staff',
        start_date: startDate,
        end_date: endDate,
        is_current: isCurrent,
        duration_months: months,
        description: descText || `Professional activity at ${company || role}.`,
        projects: [],
      });
    }
  }

  return results;
}

export function extractProjectsAndAwards(fullText: string): {
  projects: string[];
  certifications: string[];
} {
  if (!fullText) return { projects: [], certifications: [] };

  const sections = extractCVSections(fullText);
  const projects = parseProjectEntries(fullText)
    .map((p) => (p.subtitle ? `${p.name} — ${p.subtitle}` : p.name))
    .filter((v, i, a) => v.length > 2 && a.indexOf(v) === i);

  const certifications: string[] = [];
  const certSrc = [sections.awards, sections.publications].filter(Boolean).join('\n');
  if (certSrc) {
    for (const raw of certSrc.split(/\r?\n/)) {
      const line = raw.replace(/^[•\-*·▪]\s*/, '').trim();
      if (line.length > 4 && line.length < 200 && !certifications.includes(line)) {
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
  const expStr = years > 0 ? `${years} years ${months > 0 ? `${months} months` : ''}`.trim() : `${totalMonths} months`;

  const topSkillsStr = skills.slice(0, 4).join(', ');
  const companyStr = companies && companies.length > 0 ? ` with work history at ${companies.slice(0, 2).join(' & ')}` : '';
  const targetStr = jobTitle ? ` for the ${jobTitle} role` : '';

  return `Candidate ${name} has a total of ${expStr} of professional experience${companyStr}${targetStr}. Possesses core technical skills including ${topSkillsStr || 'software development'} with strong system integration abilities.`;
}

export function constructGroqDecisionSummary(
  candidateName: string,
  score: number,
  breakdown: ScoreBreakdown,
  jobTitle: string,
  extraction?: CVExtractionDTO
): string {
  const matched = breakdown.matched_skills.length > 0 ? breakdown.matched_skills.join(', ') : 'No matching skills detected';
  const missing = breakdown.missing_mandatory_skills.length > 0 ? breakdown.missing_mandatory_skills.join(', ') : 'No mandatory skills missing';

  const totalMonths = extraction?.total_experience_months || 0;
  const eduDegree = extraction?.education && extraction.education.length > 0 ? extraction.education[0].degree || '' : '';
  const eduInst = extraction?.education && extraction.education.length > 0 ? extraction.education[0].institution || '' : '';
  const eduStr = eduDegree ? ` with background in ${eduDegree}${eduInst ? ` from ${eduInst}` : ''}` : '';

  const projectCount = extraction?.projects?.length || 0;
  const projStr = projectCount > 0 ? ` and a track record of ${projectCount} portfolio projects` : '';

  if (score >= 80) {
    return `[AI Decision] HIGHLY RECOMMENDED - PASSED SCREENING. Candidate ${candidateName}${eduStr} achieved a Job-Fit Score of ${score}/100 for the ${jobTitle} position. Possesses core technical qualifications (${matched})${projStr}. HR Recommendation: Proceed to primary technical interview.`;
  } else if (score >= 60) {
    return `[AI Decision] CONDITIONAL RECOMMENDATION - NEEDS SPECIAL REVIEW. Candidate ${candidateName}${eduStr} scored ${score}/100 with ${totalMonths} months of total experience. Successfully matched skills (${matched}), but has missing mandatory criteria (${missing}). HR Recommendation: Short exploratory interview or coding assessment suggested.`;
  } else {
    return `[AI Decision] RE-SCREENING RECOMMENDED / MANUAL REVIEW. Candidate ${candidateName}${eduStr} achieved a Job-Fit Score of ${score}/100 for the ${jobTitle} position. Demonstrated potential in skills (${matched}), but has not met critical mandatory criteria: (${missing}). HR Recommendation: Review additional portfolio or consider alternative suitable positions.`;
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

  // Skill Semantic & Role Semantic Similarity estimations
  const skillSemanticSimilarity = Math.min(
    0.98,
    Math.max(0.45, 0.4 + (mandatorySkillScore * 0.45) + (preferredSkillScore * 0.15))
  );

  const roleSemanticSimilarity = Math.min(
    0.95,
    Math.max(0.40, 0.35 + (experienceScore * 0.35) + (mandatorySkillScore * 0.25))
  );

  const combinedSemanticSim = Math.round((0.55 * skillSemanticSimilarity + 0.45 * roleSemanticSimilarity) * 100) / 100;

  // Final score formula: 25% skill_sem + 20% role_sem + 30% mandatory + 20% exp + 5% preferred
  const finalScoreRaw = 100 * (
    0.25 * skillSemanticSimilarity +
    0.20 * roleSemanticSimilarity +
    0.30 * mandatorySkillScore +
    0.20 * experienceScore +
    0.05 * preferredSkillScore
  );

  const final_score = Math.round(finalScoreRaw * 10) / 10;

  const breakdown: ScoreBreakdown = {
    score_version: 'v2',
    semantic_similarity: combinedSemanticSim,
    semantic_weight: 0.45,
    skill_semantic_similarity: Math.round(skillSemanticSimilarity * 100) / 100,
    skill_semantic_weight: 0.25,
    role_semantic_similarity: Math.round(roleSemanticSimilarity * 100) / 100,
    role_semantic_weight: 0.20,
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

  // 1. Detect portfolio / profile / live-demo URLs (with or without protocol).
  const urlRegex =
    /(https?:\/\/[^\s<">)]+|(?:www\.)?(?:github|gitlab|linkedin|figma|behance|dribbble|medium|kaggle|huggingface|colab\.research\.google|drive\.google|notion|dev\.to|hashnode|gitbook)\.[a-z]+\/[^\s<">)]+|[a-z0-9][a-z0-9-]*\.(?:vercel\.app|netlify\.app|web\.app|fly\.dev|pages\.dev|github\.io|herokuapp\.com|streamlit\.app|onrender\.com)(?:\/[^\s<">)]*)?|[a-z0-9][a-z0-9-]{2,}\.(?:com|dev|io|ai|id|net|app|tech|me)\/[^\s<">)]+)/gi;
  const urlMatches = Array.from(fullText.matchAll(urlRegex));
  const seenUrls = new Set<string>();

  for (const match of urlMatches) {
    let url = match[0].trim().replace(/[).,;:]+$/, '');
    if (!/^https?:\/\//i.test(url)) url = 'https://' + url;

    const key = url.toLowerCase().replace(/\/$/, '');
    if (seenUrls.has(key)) continue;
    seenUrls.add(key);

    let title = 'Portfolio / Link';
    if (/github\.com/i.test(url)) title = 'GitHub';
    else if (/gitlab\.com/i.test(url)) title = 'GitLab';
    else if (/linkedin\.com/i.test(url)) title = 'LinkedIn';
    else if (/figma\.com/i.test(url)) title = 'Figma';
    else if (/behance\.net/i.test(url)) title = 'Behance';
    else if (/dribbble\.com/i.test(url)) title = 'Dribbble';
    else if (/kaggle\.com/i.test(url)) title = 'Kaggle';
    else if (/huggingface\.co/i.test(url)) title = 'Hugging Face';
    else if (/medium\.com|dev\.to|hashnode|hashnode\.dev/i.test(url)) title = 'Article / Blog';
    else if (/drive\.google|colab\.research/i.test(url)) title = 'Google Drive / Colab';
    else if (/(vercel|netlify|web|fly|pages|github\.io|herokuapp|streamlit|onrender)\.(app|dev|io|com)/i.test(url))
      title = 'Live Demo';
    else if (/github\.io/i.test(url)) title = 'Live Demo';

    portfolios.push({ title, url, description: `Link from resume: ${url}` });
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
            role: 'Professional Referee / Workplace Manager',
            company: 'Related Company',
            contact_info: phoneOrEmail ? phoneOrEmail[0] : 'Available upon request',
          });
        }
      }
    }
  }

  return { portfolios, references };
}
