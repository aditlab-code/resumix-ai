'use client';

import React, { useState, useEffect } from 'react';
import 'katex/dist/katex.min.css';

interface MathFormulaProps {
  math: string;
  block?: boolean;
}

export const MathFormula: React.FC<MathFormulaProps> = React.memo(({ math, block = true }) => {
  const [html, setHtml] = useState<string>('');

  useEffect(() => {
    let isMounted = true;
    import('katex').then((katexModule) => {
      const katex = katexModule.default;
      try {
        const rendered = katex.renderToString(math, {
          displayMode: block,
          throwOnError: false,
        });
        if (isMounted) {
          setHtml(rendered);
        }
      } catch (err) {
        console.error('[KaTeX Error]:', err);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [math, block]);

  if (!html) {
    return (
      <div className="my-3 p-3 font-mono text-xs text-accent bg-accent-soft border border-accent/20 rounded-lg text-center">
        {math}
      </div>
    );
  }

  if (!block) {
    return (
      <span
        className="inline-block font-mono text-accent font-semibold px-1"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    );
  }

  return (
    <div className="my-5 p-4 rounded-xl border border-accent/30 bg-accent-soft/30 text-ink shadow-xs overflow-x-auto text-center flex flex-col items-center justify-center">
      <div
        className="w-full overflow-x-auto py-2 text-ink [&_.katex]:text-sm md:[&_.katex]:text-base font-bold"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </div>
  );
});
MathFormula.displayName = 'MathFormula';
