'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Button, Card, Toolbar, SearchInput } from '@/components/ui';
import { RefreshCw, FileText, Check, Copy, Layers, BarChart3, ShieldCheck, Scale, Info, AlertTriangle, Lightbulb, AlertCircle } from 'lucide-react';
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
    title: 'Specifications & Architecture',
    items: [
      {
        key: 'readme',
        label: 'Executive Summary',
        icon: FileText,
        description: 'General product specification, installation guide, and Resumix AI product architecture.',
        badge: 'Core',
      },
      {
        key: 'architecture',
        label: 'Architecture & Service Design',
        icon: Layers,
        description: 'Microservice specifications, service boundaries, and pgvector schema.',
        badge: 'Technical',
      },
      {
        key: 'evaluation',
        label: 'Evaluation & Metrics Report',
        icon: BarChart3,
        description: 'Test results of 200 synthetic resume PDFs, ingestion latency, and AI accuracy.',
        badge: 'Metrics',
      },
    ],
  },
  {
    title: 'Licensing & Legal',
    items: [
      {
        key: 'license',
        label: 'Code License (AGPL-3.0)',
        icon: ShieldCheck,
        description: 'GNU AGPLv3 license terms for source code protection and proprietary commercial restrictions.',
        badge: 'AGPL-3.0',
      },
      {
        key: 'licenseDocs',
        label: 'Documentation License (CC BY-NC-SA)',
        icon: Scale,
        description: 'Creative Commons Attribution-NonCommercial-ShareAlike 4.0 license terms for documentation & architecture.',
        badge: 'CC BY-NC-SA',
      },
    ],
  },
];

const stripMarkdownAsterisks = (str: string) => {
  return str.replace(/\*\*/g, '').replace(/\*/g, '').trim();
};

const renderInlineContent = (text: string): React.ReactNode => {
  if (!text) return null;

  // Split by: images ![], math $...$, backtick code `...`, links [...]()
  const tokenRegex = /(!\[[^\]]*\]\([^\)]+\)|\$[^\$]+\$|`[^`]+`|\[[^\]]+\]\([^\)]+\))/g;
  const parts = text.split(tokenRegex);

  return parts.map((part, i) => {
    if (!part) return null;

    // Image / Color swatch: ![alt](url)
    if (part.startsWith('![') && part.includes('](') && part.endsWith(')')) {
      const match = part.match(/^!\[([^\]]*)\]\(([^\)]+)\)$/);
      if (match) {
        const alt = match[1];
        const url = match[2];
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
              <span className="font-mono text-[11px] font-bold text-ink-default">{hexColor}</span>
            </span>
          );
        }
        return (
          <img key={i} src={url} alt={alt} className="inline-block max-h-6 rounded align-middle" />
        );
      }
    }

    // Inline KaTeX math: $...$
    if (part.startsWith('$') && part.endsWith('$') && part.length > 2) {
      const rawMath = part.slice(1, -1);
      return <MathFormula key={i} math={rawMath} block={false} />;
    }

    // Inline code backticks: `...`
    if (part.startsWith('`') && part.endsWith('`') && part.length >= 2) {
      const codeContent = part.slice(1, -1);
      return (
        <code
          key={i}
          className="font-mono text-[12px] font-bold text-brand-accent bg-blue-50/90 text-blue-900 border border-blue-200/80 px-1.5 py-0.5 rounded shadow-2xs mx-0.5"
        >
          {codeContent}
        </code>
      );
    }

    // Inline link: [text](url)
    if (part.startsWith('[') && part.includes('](') && part.endsWith(')')) {
      const linkMatch = part.match(/^\[([^\]]+)\]\(([^\)]+)\)$/);
      if (linkMatch) {
        const label = linkMatch[1];
        const targetUrl = linkMatch[2];
        return (
          <a
            key={i}
            href={targetUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-brand-accent font-bold underline underline-offset-2 hover:text-brand-accent_hover transition-colors"
          >
            {label}
          </a>
        );
      }
    }

    return part;
  });
};

export const DocumentationView: React.FC = () => {
  const [activeDoc, setActiveDoc] = useState<DocKey>('readme');
  const [content, setContent] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const fetchDocContent = useCallback(async (docKey: DocKey) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/docs?doc=${docKey}`);
      const data = await res.json();
      if (data.success) {
        setContent(data.content);
      } else {
        setError(data.error || 'Failed to load document');
      }
    } catch (err) {
      console.error('Error fetching doc:', err);
      setError('Failed to connect to documentation endpoint.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDocContent(activeDoc);
  }, [activeDoc, fetchDocContent]);

  const handleCopy = useCallback((code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  }, []);

  const parsedMarkdown = useMemo(() => {
    if (!content) return null;

    const lines = content.split('\n');
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
            <thead className="bg-slate-100 border-b border-surface-border text-ink-default font-bold uppercase tracking-wider text-[11px]">
              <tr>
                {headers.map((h, i) => (
                  <th key={i} className="px-4 py-3 border-r border-surface-border last:border-r-0">
                    {renderInlineContent(h)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-border text-ink-default">
              {dataRows.map((r, ri) => {
                const cells = parseCells(r);
                return (
                  <tr key={ri} className="hover:bg-surface-hover transition-colors">
                    {cells.map((c, ci) => (
                      <td key={ci} className="px-4 py-2.5 border-r border-surface-border last:border-r-0 leading-relaxed font-mono text-[11px] text-ink-default font-medium">
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

    const term = searchQuery.toLowerCase().trim();

    lines.forEach((line, idx) => {
      if (term && !line.toLowerCase().includes(term) && !inCodeBlock && !inTable) {
        return;
      }

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
                <div className="flex items-center justify-between px-4 py-2 bg-slate-950 border-b border-slate-800 text-slate-200 font-bold uppercase tracking-wider text-[10px]">
                  <span>{codeBlockLang || 'code'}</span>
                  <button
                    type="button"
                    onClick={() => handleCopy(codeString)}
                    className="flex items-center gap-1 text-slate-300 hover:text-white transition-colors"
                  >
                    {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{isCopied ? 'Copied' : 'Copy'}</span>
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

      if (line.trim().startsWith('|') && line.trim().endsWith('|')) {
        inTable = true;
        tableBuffer.push(line.trim());
        return;
      } else if (inTable) {
        flushTable(idx);
      }

      const trimmedLine = line.trim();
      if (trimmedLine.startsWith('$$')) {
        const rawMath = trimmedLine.replace(/^\$\$/, '').replace(/\$\$$/, '').trim();
        elements.push(<MathFormula key={`math-${idx}`} math={rawMath} block={true} />);
        return;
      }

      const cleanLineText = stripMarkdownAsterisks(line);

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
        const rawQuoteText = cleanLineText.replace('> ', '');
        const alertMatch = rawQuoteText.match(/^\[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\]/i);

        if (alertMatch) {
          const type = alertMatch[1].toUpperCase();
          const bodyText = rawQuoteText.replace(/^\[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\]/i, '').trim();

          const alertStyles: Record<string, { bg: string; border: string; text: string; label: string; icon: React.ReactNode }> = {
            NOTE: {
              bg: 'bg-blue-50/90',
              border: 'border-blue-400',
              text: 'text-blue-950',
              label: 'Note',
              icon: <Info className="w-4 h-4 text-blue-600 shrink-0" />,
            },
            TIP: {
              bg: 'bg-emerald-50/90',
              border: 'border-emerald-400',
              text: 'text-emerald-950',
              label: 'Tip',
              icon: <Lightbulb className="w-4 h-4 text-emerald-600 shrink-0" />,
            },
            IMPORTANT: {
              bg: 'bg-indigo-50/90',
              border: 'border-indigo-400',
              text: 'text-indigo-950',
              label: 'Important',
              icon: <AlertCircle className="w-4 h-4 text-indigo-600 shrink-0" />,
            },
            WARNING: {
              bg: 'bg-amber-50/90',
              border: 'border-amber-400',
              text: 'text-amber-950',
              label: 'Warning',
              icon: <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />,
            },
            CAUTION: {
              bg: 'bg-rose-50/90',
              border: 'border-rose-400',
              text: 'text-rose-950',
              label: 'Caution',
              icon: <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />,
            },
          };

          const style = alertStyles[type] || alertStyles.NOTE;

          elements.push(
            <div
              key={`alert-${idx}`}
              className={cn(
                'my-4 p-4 border-l-4 rounded-r-md shadow-2xs flex flex-col gap-1.5',
                style.bg,
                style.border,
                style.text
              )}
            >
              <div className="flex items-center gap-2 font-bold text-xs uppercase tracking-wider">
                {style.icon}
                <span>{style.label}</span>
              </div>
              {bodyText && <div className="text-body font-medium leading-relaxed">{renderInlineContent(bodyText)}</div>}
            </div>
          );
        } else {
          elements.push(
            <blockquote key={idx} className="my-4 p-4 border-l-4 border-brand-accent bg-blue-50/50 text-ink-default text-body font-medium rounded-r-md">
              {renderInlineContent(rawQuoteText)}
            </blockquote>
          );
        }
      } else if (line.startsWith('- ') || line.startsWith('* ')) {
        const listItemText = stripMarkdownAsterisks(line.substring(2));
        elements.push(
          <li key={idx} className="ml-5 list-disc text-body text-ink-default leading-relaxed my-1 font-medium">
            {renderInlineContent(listItemText)}
          </li>
        );
      } else if (line.trim() === '---') {
        elements.push(<hr key={idx} className="my-6 border-surface-border" />);
      } else if (line.trim() !== '') {
        elements.push(
          <p key={idx} className="text-body text-ink-default leading-relaxed my-2.5 font-medium">
            {renderInlineContent(cleanLineText)}
          </p>
        );
      }
    });

    if (inTable) {
      flushTable(lines.length);
    }

    return elements;
  }, [content, searchQuery, copiedCode, handleCopy]);

  return (
    <div className="space-y-6 w-full min-w-0">
      {/* Filter Toolbar */}
      <Toolbar>
        <SearchInput
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search keywords in document..."
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
            Refresh Documentation
          </Button>
        </div>
      </Toolbar>

      {/* Wiki 2-Column Layout */}
      <div className="flex flex-col lg:flex-row items-start gap-6">
        {/* Wiki Sidebar */}
        <Card className="w-full lg:w-72 shrink-0 p-4 space-y-5 sticky top-24">
          <div className="px-1 border-b border-surface-border pb-3">
            <h3 className="text-h3 font-bold text-ink-default tracking-tight">Documentation</h3>
          </div>

          <nav className="space-y-5">
            {DOC_CATEGORIES.map((cat) => (
              <div key={cat.title} className="space-y-2">
                <span className="text-xs font-extrabold text-foreground uppercase tracking-wider px-2 block">
                  {cat.title}
                </span>
                <div className="space-y-1">
                  {cat.items.map((doc) => {
                    const isActive = activeDoc === doc.key;
                    return (
                      <button
                        key={doc.key}
                        type="button"
                        onClick={() => setActiveDoc(doc.key)}
                        className={cn(
                          'w-full text-left p-2.5 rounded-md flex items-center justify-between gap-2 transition-all duration-fast focus-ring group',
                          isActive
                            ? 'bg-blue-600 text-white shadow-e1 font-bold'
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

        {/* Wiki Reading Canvas */}
        <Card className="flex-1 min-w-0 p-4 sm:p-8 min-h-[600px] bg-white border-surface-border shadow-e1">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-28 text-center space-y-3">
              <RefreshCw className="w-8 h-8 text-blue-600 animate-spin" />
              <p className="text-caption font-bold text-ink-subtle font-mono">Loading wiki document...</p>
            </div>
          ) : error ? (
            <div className="p-8 text-center bg-rose-50 border border-rose-200 rounded-md space-y-3">
              <FileText className="w-10 h-10 text-rose-600 mx-auto" />
              <p className="text-body font-bold text-rose-600">{error}</p>
              <Button variant="secondary" size="sm" onClick={() => fetchDocContent(activeDoc)}>
                Retry
              </Button>
            </div>
          ) : (
            <article className="prose prose-slate max-w-none text-body leading-relaxed space-y-2">
              {parsedMarkdown}
            </article>
          )}
        </Card>
      </div>
    </div>
  );
};
