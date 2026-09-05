'use client';

import React, { useState, useEffect } from 'react';


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
      <div className="my-3 p-3 font-mono text-xs font-semibold text-blue-900 bg-blue-50 border border-blue-200 rounded-lg text-center">
        {math}
      </div>
    );
  }

  if (!block) {
    return (
      <span
        className="inline-block font-mono text-brand-accent font-bold bg-blue-50/90 text-blue-900 border border-blue-200/80 px-1.5 py-0.5 rounded shadow-2xs mx-0.5"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    );
  }

  return (
    <div className="my-5 p-4 rounded-xl border border-blue-200 bg-blue-50/40 text-ink-default shadow-e1 overflow-x-auto text-center flex flex-col items-center justify-center">
      <div
        className="w-full overflow-x-auto py-2 text-ink-default [&_.katex]:text-sm md:[&_.katex]:text-base font-bold"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </div>
  );
});
MathFormula.displayName = 'MathFormula';
