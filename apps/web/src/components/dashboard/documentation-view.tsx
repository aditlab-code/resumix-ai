import React, { useState, useEffect } from 'react';
import { Button, Card, Toolbar, SearchInput } from '@/components/ui';
import { RefreshCw, FileText, Check, Copy, Layers, BarChart3, ShieldCheck, Scale, BookOpen, ChevronRight } from 'lucide-react';
import { MermaidDiagram } from './mermaid-diagram';
import { MathFormula } from './math-formula';
import { cn } from '@/lib/utils';

type DocKey = 'readme' | 'architecture' | 'evaluation' | 'license' | 'licenseDocs';

interface DocItem {
  key: DocKey;
  label: string;
  icon: typeof FileText;
  description: string;
  badge?: string;
}

interface DocCategory {
  title: string;
  items: DocItem[];
}

const DOC_CATEGORIES: DocCategory[] = [
  {
    title: 'Spesifikasi & Arsitektur',
    items: [
      {
        key: 'readme',
        label: 'README Master',
        icon: FileText,
        description: 'Spesifikasi produk umum, panduan instalasi, dan arsitektur produk Resumix AI.',
        badge: 'Core',
      },
      {
        key: 'architecture',
        label: 'Spesifikasi Arsitektur',
        icon: Layers,
        description: 'Spesifikasi mikroservis, batas layanan (boundaries), dan skema pgvector.',
        badge: 'Technical',
      },
      {
        key: 'evaluation',
        label: 'Laporan Evaluasi & Metrik',
        icon: BarChart3,
        description: 'Hasil pengujian 200 PDF CV sintetis, latensi ingestion, dan akurasi AI.',
        badge: 'Metrics',
      },
    ],
  },
  {
    title: 'Lisensi & Legal',
    items: [
      {
        key: 'license',
        label: 'Lisensi Kode (AGPL-3.0)',
        icon: ShieldCheck,
        description: 'Ketentuan lisensi GNU AGPLv3 untuk perlindungan source code dan larangan komersial tertutup.',
        badge: 'AGPL-3.0',
      },
      {
        key: 'licenseDocs',
        label: 'Lisensi Dokumen (CC BY-NC-SA)',
        icon: Scale,
        description: 'Ketentuan lisensi Creative Commons Attribution-NonCommercial-ShareAlike 4.0 untuk dokumentasi & arsitektur.',
        badge: 'CC BY-NC-SA',
      },
    ],
  },
];

const ALL_DOCS = DOC_CATEGORIES.flatMap((cat) => cat.items);

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

  // Helper to parse inline math $...$ and markdown images ![alt](url) / color swatches inside text
  const renderInlineContent = (text: string): React.ReactNode => {
    if (!text) return null;

    const tokenRegex = /(!\[[^\]]*\]\([^\)]+\)|\$[^\$]+\$)/g;
    const parts = text.split(tokenRegex);

    return parts.map((part, i) => {
      if (!part) return null;

      // Handle Markdown Image: ![alt](url)
      if (part.startsWith('![') && part.includes('](') && part.endsWith(')')) {
        const match = part.match(/^!\[([^\]]*)\]\(([^\)]+)\)$/);
        if (match) {
          const alt = match[1];
          const url = match[2];
          // Check for hex color code in alt or url
          const hexMatch = (alt + ' ' + url).match(/#([0-9A-Fa-f]{6}|[0-9A-Fa-f]{3})\b/);
          if (hexMatch) {
            const hexColor = hexMatch[0];
            return (
              <span key={i} className="inline-flex items-center gap-1.5 align-middle my-0.5">
                <span
                  className="inline-block w-4 h-4 rounded border border-surface-border shadow-2xs shrink-0"
                  style={{ backgroundColor: hexColor }}
                  title={hexColor}
                />
                <span className="font-mono text-[11px] font-semibold text-ink-default">{hexColor}</span>
              </span>
            );
          }
          return (
            <img key={i} src={url} alt={alt} className="inline-block max-h-6 rounded align-middle" />
          );
        }
      }

      // Handle Math: $math$
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
        <div key={`table-${keyIndex}`} className="my-6 overflow-x-auto rounded-md border border-surface-border bg-white shadow-2xs">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-surface-sunken border-b border-surface-border text-ink-default font-bold uppercase tracking-wider text-[11px]">
              <tr>
                {headers.map((h, i) => (
                  <th key={i} className="px-4 py-3 border-r border-surface-border last:border-r-0">
                    {renderInlineContent(h)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-border text-ink-muted">
              {dataRows.map((r, ri) => {
                const cells = parseCells(r);
                return (
                  <tr key={ri} className="hover:bg-surface-hover transition-colors">
                    {cells.map((c, ci) => (
                      <td key={ci} className="px-4 py-2.5 border-r border-surface-border last:border-r-0 leading-relaxed font-mono text-[11px]">
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
              <div key={`code-${idx}`} className="my-5 rounded-md bg-ink-default text-white overflow-hidden border border-slate-800 shadow-2xs font-mono text-xs">
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
          <h4 key={idx} className="text-body font-bold text-ink-default mt-5 mb-2 flex items-center gap-2">
            {renderInlineContent(headerTitle)}
          </h4>
        );
      } else if (line.startsWith('### ')) {
        const headerTitle = cleanLineText.replace('### ', '');
        elements.push(
          <h3 key={idx} className="text-h3 font-bold text-ink-default tracking-tight mt-6 mb-2">
            {renderInlineContent(headerTitle)}
          </h3>
        );
      } else if (line.startsWith('## ')) {
        const headerTitle = cleanLineText.replace('## ', '');
        elements.push(
          <h2 key={idx} className="text-h2 font-bold text-ink-default tracking-tight mt-8 mb-3 border-b border-surface-border pb-2">
            {renderInlineContent(headerTitle)}
          </h2>
        );
      } else if (line.startsWith('# ')) {
        const headerTitle = cleanLineText.replace('# ', '');
        elements.push(
          <h1 key={idx} className="text-h1 font-extrabold text-ink-default tracking-tight mt-8 mb-4 border-b-2 border-brand-accent pb-2">
            {renderInlineContent(headerTitle)}
          </h1>
        );
      } else if (line.startsWith('> ')) {
        const quoteText = cleanLineText.replace('> ', '');
        elements.push(
          <blockquote key={idx} className="my-4 p-4 border-l-4 border-brand-accent bg-brand-accent_soft/40 text-ink-default text-body font-medium rounded-r-md">
            {renderInlineContent(quoteText)}
          </blockquote>
        );
      } else if (line.startsWith('- ') || line.startsWith('* ')) {
        const listItemText = stripMarkdownAsterisks(line.substring(2));
        elements.push(
          <li key={idx} className="ml-5 list-disc text-body text-ink-muted leading-relaxed my-1 font-medium">
            {renderInlineContent(listItemText)}
          </li>
        );
      } else if (line.trim() === '---') {
        elements.push(<hr key={idx} className="my-6 border-surface-border" />);
      } else if (line.trim() !== '') {
        elements.push(
          <p key={idx} className="text-body text-ink-muted leading-relaxed my-2.5 font-medium">
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

  return (
    <div className="space-y-4 w-full min-w-0 max-w-[1440px] mx-auto">
      {/* Filter Toolbar */}
      <Toolbar>
        <SearchInput
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Cari kata kunci dalam dokumen..."
          className="w-full sm:max-w-md"
        />
        <div className="sm:ml-auto">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => fetchDocContent(activeDoc)}
            disabled={isLoading}
            iconLeft={<RefreshCw className={`w-3.5 h-3.5 text-ink-subtle ${isLoading ? 'animate-spin' : ''}`} />}
          >
            Refresh Dokumentasi
          </Button>
        </div>
      </Toolbar>

      {/* Wiki 2-Column Layout */}
      <div className="flex flex-col lg:flex-row items-start gap-6">
        {/* Wiki Sidebar (Left - 280px) */}
        <Card className="w-full lg:w-72 shrink-0 p-4 space-y-5 sticky top-24">
          <div className="px-1 border-b border-surface-border pb-3">
            <h3 className="text-h3 font-bold text-ink-default tracking-tight">Dokumentasi</h3>
          </div>

          <nav className="space-y-5">
            {DOC_CATEGORIES.map((cat) => (
              <div key={cat.title} className="space-y-2">
                <span className="text-[11px] font-bold text-ink-subtle uppercase tracking-wider px-2 block">
                  {cat.title}
                </span>
                <div className="space-y-1">
                  {cat.items.map((doc) => {
                    const isActive = activeDoc === doc.key;
                    return (
                      <button
                        key={doc.key}
                        onClick={() => setActiveDoc(doc.key)}
                        className={cn(
                          'w-full text-left p-2.5 rounded-md flex items-center justify-between gap-2 transition-all duration-fast focus-ring group',
                          isActive
                            ? 'bg-brand-accent text-white shadow-e1 font-bold'
                            : 'text-ink-muted hover:bg-surface-sunken hover:text-ink-default font-medium'
                        )}
                      >
                        <span className="text-caption truncate">{doc.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>
        </Card>

        {/* Wiki Reading Canvas (Right - Flex 1) */}
        <Card className="flex-1 min-w-0 p-8 min-h-[600px] bg-white border-surface-border shadow-e1">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-28 text-center space-y-3">
              <RefreshCw className="w-8 h-8 text-brand-accent animate-spin" />
              <p className="text-caption font-bold text-ink-subtle font-mono">Memuat dokumen wiki...</p>
            </div>
          ) : error ? (
            <div className="p-8 text-center bg-semantic-danger_soft border border-semantic-danger/30 rounded-md space-y-3">
              <FileText className="w-10 h-10 text-semantic-danger mx-auto" />
              <p className="text-body font-bold text-semantic-danger">{error}</p>
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
    </div>
  );
};


