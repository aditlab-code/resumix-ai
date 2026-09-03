'use client';

import React, { useEffect, useRef, useState } from 'react';
import { ZoomIn, ZoomOut, RotateCcw, Maximize2, Move } from 'lucide-react';

interface MermaidDiagramProps {
  chart: string;
}

export const MermaidDiagram: React.FC<MermaidDiagramProps> = ({ chart }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [svgContent, setSvgContent] = useState<string>('');
  const [hasError, setHasError] = useState<boolean>(false);
  const [isRendering, setIsRendering] = useState<boolean>(true);

  // Zoom & Pan state
  const [zoom, setZoom] = useState<number>(1);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  useEffect(() => {
    let isMounted = true;

    async function renderDiagram() {
      try {
        const mermaidModule = await import('mermaid');
        const mermaid = mermaidModule.default;

        mermaid.initialize({
          startOnLoad: false,
          theme: 'neutral',
          securityLevel: 'loose',
          fontFamily: 'Inter, system-ui, sans-serif',
        });

        const uniqueId = `mermaid-${Math.random().toString(36).substring(2, 9)}`;
        const res = await mermaid.render(uniqueId, chart);

        if (isMounted) {
          setSvgContent(res.svg);
          setHasError(false);
          setIsRendering(false);
        }
      } catch (err) {
        console.error('[Mermaid Dynamic Import / Render Error]:', err);
        if (isMounted) {
          setHasError(true);
          setIsRendering(false);
        }
      }
    }

    renderDiagram();

    return () => {
      isMounted = false;
    };
  }, [chart]);

  const handleZoomIn = () => setZoom((prev) => Math.min(prev + 0.25, 3.0));
  const handleZoomOut = () => setZoom((prev) => Math.max(prev - 0.25, 0.4));
  const handleReset = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPan({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => setIsDragging(false);

  if (isRendering) {
    return (
      <div className="my-6 p-6 bg-surface border border-line rounded-xl shadow-xs flex justify-center items-center text-xs text-ink-muted">
        Memuat diagram alur Mermaid...
      </div>
    );
  }

  if (hasError) {
    return (
      <div className="my-4 rounded-lg bg-ink text-canvas overflow-hidden border border-line shadow-xs font-mono text-xs">
        <div className="px-4 py-2 bg-slate-900 border-b border-slate-800 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
          Diagram Alur Mermaid (Code Mode)
        </div>
        <pre className="p-4 overflow-x-auto leading-relaxed text-slate-200">
          <code>{chart}</code>
        </pre>
      </div>
    );
  }

  return (
    <div className="my-6 border border-line bg-surface rounded-xl overflow-hidden shadow-xs select-none">
      {/* Interactive Controls Bar */}
      <div className="px-4 py-2 bg-canvas/80 border-b border-line flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 text-xs text-ink font-bold">
          <Move className="w-3.5 h-3.5 text-accent" />
          <span>Diagram Alur (Klik & Geser untuk Navigasi)</span>
        </div>

        <div className="flex items-center gap-1.5">
          <div className="flex items-center gap-0.5 bg-surface border border-line rounded-lg p-0.5 shadow-xs">
            <button
              onClick={handleZoomOut}
              className="p-1 hover:bg-canvas rounded text-ink transition-colors"
              title="Perkecil (Zoom Out)"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="text-[10px] font-mono text-ink-muted px-2 font-bold select-none min-w-[36px] text-center">
              {Math.round(zoom * 100)}%
            </span>
            <button
              onClick={handleZoomIn}
              className="p-1 hover:bg-canvas rounded text-ink transition-colors"
              title="Perbesar (Zoom In)"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
          </div>

          <button
            onClick={handleReset}
            className="flex items-center gap-1 px-2 py-1 bg-surface border border-line rounded-lg text-[10px] font-bold text-ink hover:bg-canvas transition-colors"
            title="Reset Tampilan"
          >
            <RotateCcw className="w-3 h-3" />
            Reset
          </button>
        </div>
      </div>

      {/* Interactive Drag & Zoom Viewport */}
      <div
        className={`relative min-h-[320px] max-h-[600px] overflow-hidden flex justify-center items-center p-6 bg-surface ${
          isDragging ? 'cursor-grabbing' : 'cursor-grab'
        }`}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <div
          ref={containerRef}
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            transformOrigin: 'center center',
            transition: isDragging ? 'none' : 'transform 0.15s ease-out',
          }}
          className="w-full flex justify-center [&_svg]:max-w-full [&_svg]:h-auto select-none pointer-events-none"
          dangerouslySetInnerHTML={{ __html: svgContent }}
        />
      </div>
    </div>
  );
};
