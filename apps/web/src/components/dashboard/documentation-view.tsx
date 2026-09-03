'use client';

import React, { useState, useEffect } from 'react';
import { Button, Card } from '@/components/ui';
import { RefreshCw, FileText, Check, Copy, Search, BookOpen, Layers, BarChart3, ShieldCheck, Scale } from 'lucide-react';
import { MermaidDiagram } from './mermaid-diagram';
import { MathFormula } from './math-formula';
import { cn } from '@/lib/utils';

type DocKey = 'readme' | 'architecture' | 'evaluation' | 'license' | 'licenseDocs';

interface DocItem {
  key: DocKey;
  label: string;
  icon: typeof FileText;
  description: string;
}

const DOCS: DocItem[] = [
  {
    key: 'readme',
    label: 'README Master',
    icon: FileText,
    description: 'Spesifikasi produk umum, panduan instalasi, dan arsitektur produk Resumix AI.',
  },
  {
    key: 'architecture',
    label: 'Spesifikasi Arsitektur',
    icon: Layers,
    description: 'Spesifikasi mikroservis, batas layanan (boundaries), dan skema pgvector.',
  },
  {
    key: 'evaluation',
    label: 'Laporan Evaluasi & Metrik',
    icon: BarChart3,
    description: 'Hasil pengujian 200 PDF CV sintetis, latensi ingestion, dan akurasi AI.',
  },
  {
    key: 'license',
    label: 'Lisensi Kode (AGPL-3.0)',
    icon: ShieldCheck,
    description: 'Ketentuan lisensi GNU AGPLv3 untuk perlindungan source code dan larangan komersial tertutup.',
  },
  {
    key: 'licenseDocs',
    label: 'Lisensi Dokumen (CC BY-NC-SA)',
    icon: Scale,
    description: 'Ketentuan lisensi Creative Commons Attribution-NonCommercial-ShareAlike 4.0 untuk dokumentasi & arsitektur.',
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

  // Clean 1-Column Markdown Renderer
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
        <div key={`table-${keyIndex}`} className="my-6 overflow-x-auto rounded-md border border-slate-200 bg-white shadow-2xs">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-100 border-b border-slate-200 text-slate-900 font-bold uppercase tracking-wider text-[11px]">
              <tr>
                {headers.map((h, i) => (
                  <th key={i} className="px-4 py-3 border-r border-slate-200 last:border-r-0">
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

      // Clean Headings
      if (line.startsWith('#### ')) {
        const headerTitle = cleanLineText.replace('#### ', '');
        elements.push(
          <h4 key={idx} className="text-body font-bold text-slate-900 mt-5 mb-2 flex items-center gap-2">
            {renderInlineContent(headerTitle)}
          </h4>
        );
      } else if (line.startsWith('### ')) {
        const headerTitle = cleanLineText.replace('### ', '');
        elements.push(
          <h3 key={idx} className="text-h3 font-bold text-slate-900 tracking-tight mt-6 mb-2">
            {renderInlineContent(headerTitle)}
          </h3>
        );
      } else if (line.startsWith('## ')) {
        const headerTitle = cleanLineText.replace('## ', '');
        elements.push(
          <h2 key={idx} className="text-h2 font-bold text-slate-900 tracking-tight mt-8 mb-3 border-b border-slate-200 pb-2">
            {renderInlineContent(headerTitle)}
          </h2>
        );
      } else if (line.startsWith('# ')) {
        const headerTitle = cleanLineText.replace('# ', '');
        elements.push(
          <h1 key={idx} className="text-h1 font-extrabold text-slate-900 tracking-tight mt-8 mb-4 border-b-2 border-slate-900 pb-2">
            {renderInlineContent(headerTitle)}
          </h1>
        );
      } else if (line.startsWith('> ')) {
        const quoteText = cleanLineText.replace('> ', '');
        elements.push(
          <blockquote key={idx} className="my-4 p-4 border-l-4 border-blue-600 bg-blue-50/70 text-slate-900 text-body font-medium rounded-r-md">
            {renderInlineContent(quoteText)}
          </blockquote>
        );
      } else if (line.startsWith('- ') || line.startsWith('* ')) {
        const listItemText = stripMarkdownAsterisks(line.substring(2));
        elements.push(
          <li key={idx} className="ml-5 list-disc text-body text-slate-800 leading-relaxed my-1 font-medium">
            {renderInlineContent(listItemText)}
          </li>
        );
      } else if (line.trim() === '---') {
        elements.push(<hr key={idx} className="my-6 border-slate-200" />);
      } else if (line.trim() !== '') {
        elements.push(
          <p key={idx} className="text-body text-slate-800 leading-relaxed my-2.5 font-medium">
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
  const CurrentIcon = currentDocInfo.icon;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Top Header Card */}
      <Card className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-surface-border pb-4">
          <div className="space-y-1">
            <h2 className="text-h2 font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-blue-600" />
              Dokumentasi Sistem Resumix AI
            </h2>
            <p className="text-caption text-slate-600 font-medium">
              Spesifikasi resmi monorepo, batas mikroservis, dan metrik pengujian sistem.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <div className="relative min-w-[200px]">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Cari dalam dokumen..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-caption bg-surface-sunken border border-surface-border rounded-md text-slate-900 focus-ring font-medium"
              />
            </div>

            <Button
              variant="secondary"
              size="sm"
              onClick={() => fetchDocContent(activeDoc)}
              disabled={isLoading}
              iconLeft={<RefreshCw className={`w-3.5 h-3.5 text-slate-700 ${isLoading ? 'animate-spin' : ''}`} />}
            >
              Refresh
            </Button>
          </div>
        </div>

        {/* Horizontal Segmented Document Selector */}
        <div className="flex items-center gap-2 bg-surface-sunken border border-surface-border p-1.5 rounded-md shadow-e1 overflow-x-auto">
          {DOCS.map((doc) => {
            const isActive = activeDoc === doc.key;
            const DocIcon = doc.icon;
            return (
              <button
                key={doc.key}
                type="button"
                onClick={() => setActiveDoc(doc.key)}
                className={cn(
                  'flex items-center gap-2 px-4 py-2 rounded-md text-caption font-bold shrink-0 focus-ring transition-all',
                  isActive
                    ? 'bg-blue-600 text-white shadow-e1'
                    : 'text-slate-700 hover:bg-slate-200 hover:text-slate-900'
                )}
              >
                <DocIcon className={cn('w-4 h-4', isActive ? 'text-white' : 'text-slate-500')} />
                <span>{doc.label}</span>
              </button>
            );
          })}
        </div>
      </Card>

      {/* Main Single Column Reading Canvas */}
      <Card className="p-8 min-h-[500px] bg-white border-surface-border shadow-e1">
        <div className="mb-6 pb-4 border-b border-surface-border space-y-1">
          <h1 className="text-h1 font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
            <CurrentIcon className="w-6 h-6 text-blue-600" />
            {currentDocInfo.label}
          </h1>
          <p className="text-caption text-slate-600 font-medium">{currentDocInfo.description}</p>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 text-center space-y-3">
            <RefreshCw className="w-8 h-8 text-blue-600 animate-spin" />
            <p className="text-caption font-bold text-slate-600 font-mono">Memuat konten dokumen...</p>
          </div>
        ) : error ? (
          <div className="p-8 text-center bg-red-50 border border-red-200 rounded-md space-y-3">
            <FileText className="w-10 h-10 text-red-600 mx-auto" />
            <p className="text-body font-bold text-red-800">{error}</p>
            <Button variant="secondary" size="sm" onClick={() => fetchDocContent(activeDoc)}>
              Coba Lagi
            </Button>
          </div>
        ) : (
          <article className="prose prose-slate max-w-none text-body leading-relaxed space-y-2">
            {renderFormattedMarkdown(content)}
          </article>
        )}
      </Card>
    </div>
  );
};
