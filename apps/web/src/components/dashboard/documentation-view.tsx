'use client';

import React, { useState, useEffect } from 'react';
import { Card, Button } from '@/components/ui';
import { BookOpen, RefreshCw, FileText, Check, Copy, Search, ShieldCheck } from 'lucide-react';
import { MermaidDiagram } from './mermaid-diagram';
import { MathFormula } from './math-formula';

const Badge: React.FC<{ variant?: 'accent' | 'neutral'; children: React.ReactNode; className?: string }> = ({
  variant = 'neutral',
  children,
  className = '',
}) => {
  const bgClass = variant === 'accent' ? 'bg-semantic-info_soft text-semantic-info border border-semantic-info/20' : 'bg-surface-sunken text-ink-subtle border border-surface-border';
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-pill text-caption font-semibold uppercase tracking-wider ${bgClass} ${className}`}>
      {children}
    </span>
  );
};

type DocKey = 'readme' | 'architecture' | 'evaluation';

interface DocItem {
  key: DocKey;
  label: string;
  badge: string;
  description: string;
}

const DOCS: DocItem[] = [
  {
    key: 'readme',
    label: 'README Master',
    badge: 'DOC-REF-01',
    description: 'Dokumen spesifikasi umum, panduan instalasi, dan arsitektur produk Resumix AI.',
  },
  {
    key: 'architecture',
    label: 'Spesifikasi Arsitektur',
    badge: 'DOC-REF-02',
    description: 'Spesifikasi mikroservis, batas layanan (boundaries), dan skema pgvector.',
  },
  {
    key: 'evaluation',
    label: 'Laporan Evaluasi & Metrik',
    badge: 'DOC-REF-03',
    description: 'Hasil pengujian 200 PDF CV sintetis, latensi ingestion, dan akurasi AI.',
  },
];

export const DocumentationView: React.FC = () => {
  const [activeDoc, setActiveDoc] = useState<DocKey>('readme');
  const [content, setContent] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const fetchDocContent = async (docKey: DocKey) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/docs?doc=${docKey}`);
      const data = await res.json();
      if (data.success) {
        setContent(data.content);
      } else {
        setError(data.error || 'Gagal memuat dokumen');
      }
    } catch (err) {
      console.error('Error fetching doc:', err);
      setError('Gagal menghubungkan ke endpoint dokumentasi.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDocContent(activeDoc);
  }, [activeDoc]);

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const stripMarkdownAsterisks = (str: string) => {
    return str.replace(/\*\*/g, '').replace(/\*/g, '').trim();
  };

  // Helper to parse inline math $...$ inside text
  const renderInlineContent = (text: string): React.ReactNode => {
    if (!text) return null;

    const parts = text.split(/(\$[^\$]+\$)/g);

    return parts.map((part, i) => {
      if (part.startsWith('$') && part.endsWith('$') && part.length > 2) {
        const rawMath = part.slice(1, -1);
        return <MathFormula key={i} math={rawMath} block={false} />;
      }
      return part;
    });
  };

  // Corporate ISO Document Template Markdown Renderer
  const renderFormattedMarkdown = (rawText: string) => {
    if (!rawText) return null;

    const lines = rawText.split('\n');
    const elements: React.ReactNode[] = [];
    let inCodeBlock = false;
    let codeBlockLang = '';
    let codeBlockBuffer: string[] = [];
    let inTable = false;
    let tableBuffer: string[] = [];

    const flushTable = (keyIndex: number) => {
      if (tableBuffer.length < 2) {
        tableBuffer = [];
        inTable = false;
        return;
      }
      const headerRow = tableBuffer[0];
      const dataRows = tableBuffer.slice(2);

      const parseCells = (row: string) =>
        row
          .split('|')
          .slice(1, -1)
          .map((c) => stripMarkdownAsterisks(c.trim()));

      const headers = parseCells(headerRow);

      elements.push(
        <div key={`table-${keyIndex}`} className="my-6 overflow-x-auto rounded-md border border-slate-300 bg-surface shadow-2xs">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-100 border-b border-slate-300 text-slate-900 font-bold uppercase tracking-wider text-[11px]">
              <tr>
                {headers.map((h, i) => (
                  <th key={i} className="px-4 py-3 border-r border-slate-300 last:border-r-0">
                    {renderInlineContent(h)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-slate-800">
              {dataRows.map((r, ri) => {
                const cells = parseCells(r);
                return (
                  <tr key={ri} className="hover:bg-slate-50 transition-colors">
                    {cells.map((c, ci) => (
                      <td key={ci} className="px-4 py-2.5 border-r border-slate-200 last:border-r-0 leading-relaxed font-mono text-[11px]">
                        {renderInlineContent(c)}
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      );
      tableBuffer = [];
      inTable = false;
    };

    lines.forEach((line, idx) => {
      if (searchQuery && !line.toLowerCase().includes(searchQuery.toLowerCase()) && !inCodeBlock && !inTable) {
        return;
      }

      // Code block handler
      if (line.startsWith('```')) {
        if (inCodeBlock) {
          const codeString = codeBlockBuffer.join('\n');
          const isCopied = copiedCode === codeString;
          const isMermaid = codeBlockLang === 'mermaid';

          if (isMermaid) {
            elements.push(<MermaidDiagram key={`mermaid-${idx}`} chart={codeString} />);
          } else {
            elements.push(
              <div key={`code-${idx}`} className="my-5 rounded-md bg-slate-900 text-slate-100 overflow-hidden border border-slate-800 shadow-2xs font-mono text-xs">
                <div className="flex items-center justify-between px-4 py-2 bg-slate-950 border-b border-slate-800 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                  <span>{codeBlockLang || 'code'}</span>
                  <button
                    onClick={() => handleCopy(codeString)}
                    className="flex items-center gap-1 text-slate-300 hover:text-white transition-colors"
                  >
                    {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{isCopied ? 'Tersalin' : 'Salin'}</span>
                  </button>
                </div>
                <pre className="p-4 overflow-x-auto leading-relaxed text-slate-200">
                  <code>{codeString}</code>
                </pre>
              </div>
            );
          }
          codeBlockBuffer = [];
          inCodeBlock = false;
          codeBlockLang = '';
        } else {
          inCodeBlock = true;
          codeBlockLang = line.replace('```', '').trim();
        }
        return;
      }

      if (inCodeBlock) {
        codeBlockBuffer.push(line);
        return;
      }

      // Check Table
      if (line.trim().startsWith('|') && line.trim().endsWith('|')) {
        inTable = true;
        tableBuffer.push(line.trim());
        return;
      } else if (inTable) {
        flushTable(idx);
      }

      // Check Math Block $$ ... $$
      const trimmedLine = line.trim();
      if (trimmedLine.startsWith('$$')) {
        const rawMath = trimmedLine.replace(/^\$\$/, '').replace(/\$\$$/, '').trim();
        elements.push(<MathFormula key={`math-${idx}`} math={rawMath} block={true} />);
        return;
      }

      const cleanLineText = stripMarkdownAsterisks(line);

      // Corporate Document Headings
      if (line.startsWith('#### ')) {
        const headerTitle = cleanLineText.replace('#### ', '');
        elements.push(
          <h4 key={idx} className="text-xs font-black text-slate-900 uppercase tracking-wider mt-5 mb-2 flex items-center gap-2 border-l-2 border-accent pl-2">
            {renderInlineContent(headerTitle)}
          </h4>
        );
      } else if (line.startsWith('### ')) {
        const headerTitle = cleanLineText.replace('### ', '');
        elements.push(
          <h3 key={idx} className="text-sm font-black text-accent tracking-tight mt-6 mb-2">
            {renderInlineContent(headerTitle)}
          </h3>
        );
      } else if (line.startsWith('## ')) {
        const headerTitle = cleanLineText.replace('## ', '');
        elements.push(
          <h2 key={idx} className="text-base font-black text-slate-900 tracking-tight mt-8 mb-3 border-b-2 border-slate-300 pb-1.5 uppercase font-mono">
            {renderInlineContent(headerTitle)}
          </h2>
        );
      } else if (line.startsWith('# ')) {
        const headerTitle = cleanLineText.replace('# ', '');
        elements.push(
          <h1 key={idx} className="text-xl font-black text-slate-950 tracking-tight mt-8 mb-4 border-b-2 border-slate-900 pb-2 uppercase font-mono flex items-center justify-between">
            <span>{renderInlineContent(headerTitle)}</span>
            <span className="text-[10px] font-mono text-slate-600 font-normal normal-case border border-slate-300 px-2 py-0.5 rounded bg-slate-50">
              OFFICIAL TECH SPEC
            </span>
          </h1>
        );
      } else if (line.startsWith('> ')) {
        const quoteText = cleanLineText.replace('> ', '');
        elements.push(
          <blockquote key={idx} className="my-4 pl-4 py-2.5 border-l-4 border-accent bg-blue-50/70 text-slate-900 text-xs font-medium rounded-r-md">
            {renderInlineContent(quoteText)}
          </blockquote>
        );
      } else if (line.startsWith('- ') || line.startsWith('* ')) {
        const listItemText = stripMarkdownAsterisks(line.substring(2));
        elements.push(
          <li key={idx} className="ml-5 list-disc text-xs text-slate-800 leading-relaxed my-1 font-medium">
            {renderInlineContent(listItemText)}
          </li>
        );
      } else if (line.trim() === '---') {
        elements.push(<hr key={idx} className="my-6 border-slate-300" />);
      } else if (line.trim() !== '') {
        elements.push(
          <p key={idx} className="text-xs text-slate-800 leading-relaxed my-2.5 font-medium">
            {renderInlineContent(cleanLineText)}
          </p>
        );
      }
    });

    if (inTable) {
      flushTable(lines.length);
    }

    return elements;
  };

  const currentDocInfo = DOCS.find((d) => d.key === activeDoc) || DOCS[0];

  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto">
      {/* ISO Corporate Document Control Header */}
      <div className="bg-surface border border-slate-300 rounded-lg shadow-2xs overflow-hidden">
        <div className="bg-slate-900 text-slate-200 px-5 py-2.5 flex flex-wrap items-center justify-between gap-3 text-[10px] font-mono border-b border-slate-800">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 font-bold text-accent">
              <ShieldCheck className="w-3.5 h-3.5" />
              CORPORATE DOCUMENT CONTROL
            </span>
            <span className="hidden sm:inline text-slate-400">REF: RESUMIX-SPEC-2026</span>
          </div>
          <div className="flex items-center gap-3 text-slate-400">
            <span>CLASSIFICATION: ENTERPRISE INTERNAL</span>
            <span>REV: v2.4</span>
          </div>
        </div>

        <div className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-accent" />
              <h2 className="text-lg font-black text-slate-900 tracking-tight">Dokumentasi System Resumix AI</h2>
              <Badge variant="accent" className="text-[9px]">
                {currentDocInfo.badge}
              </Badge>
            </div>
            <p className="text-xs text-slate-600 font-medium">
              Standar dokumentasi resmi. Berkas disinkronkan secara langsung dari repositori monorepo.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-600 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Cari dalam dokumentasi..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-md text-slate-900 placeholder:text-slate-600 focus:outline-none focus:border-accent w-48 font-medium"
              />
            </div>

            <Button
              variant="secondary"
              size="sm"
              onClick={() => fetchDocContent(activeDoc)}
              disabled={isLoading}
              className="flex items-center gap-1.5 text-xs"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>
      </div>

      {/* Document Selector Pills */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {DOCS.map((doc) => {
          const isActive = activeDoc === doc.key;
          return (
            <button
              key={doc.key}
              onClick={() => setActiveDoc(doc.key)}
              className={`p-4 rounded-lg border text-left transition-all ${
                isActive
                  ? 'bg-surface border-accent shadow-xs ring-1 ring-accent/20 border-l-4 border-l-accent'
                  : 'bg-slate-50/80 border-slate-300 hover:border-slate-400 hover:bg-surface'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className={`font-black text-xs ${isActive ? 'text-accent' : 'text-slate-900'}`}>{doc.label}</span>
                <Badge variant={isActive ? 'accent' : 'neutral'} className="text-[9px]">
                  {doc.badge}
                </Badge>
              </div>
              <p className="text-[11px] text-slate-600 line-clamp-2 leading-tight font-medium">{doc.description}</p>
            </button>
          );
        })}
      </div>

      {/* Main Document Content Frame */}
      <Card className="p-8 min-h-[500px] border-slate-300 shadow-xs relative">
        <div className="w-full h-1 bg-accent absolute top-0 left-0 right-0"></div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 text-center space-y-3">
            <RefreshCw className="w-8 h-8 text-accent animate-spin" />
            <p className="text-xs text-slate-600 font-bold font-mono">MEMUAT DOKUMEN REGISTRASI ({currentDocInfo.badge})...</p>
          </div>
        ) : error ? (
          <div className="p-8 text-center bg-red-50 border border-red-200 rounded-lg space-y-3">
            <FileText className="w-10 h-10 text-red-600 mx-auto" />
            <p className="text-sm font-bold text-red-800">{error}</p>
            <Button variant="secondary" size="sm" onClick={() => fetchDocContent(activeDoc)}>
              Coba Lagi
            </Button>
          </div>
        ) : (
          <article className="prose prose-slate max-w-none text-xs leading-relaxed">
            {renderFormattedMarkdown(content)}
          </article>
        )}
      </Card>
    </div>
  );
};
