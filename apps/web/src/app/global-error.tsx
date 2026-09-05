'use client';

import React from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body className="bg-canvas text-ink flex flex-col items-center justify-center min-h-screen">
        <div className="p-8 bg-surface border border-line rounded text-center space-y-3 max-w-md">
          <h2>System Error Occurred</h2>
          <p className="text-xs text-ink-muted leading-relaxed">
            {error.message || 'An unexpected system error occurred. Please reload the page.'}
          </p>
          <button
            onClick={() => reset()}
            className="inline-flex items-center justify-center h-9 px-4 text-xs font-bold rounded bg-accent text-accent-fg hover:bg-accent/90 transition-colors"
          >
            Reload Page
          </button>
        </div>
      </body>
    </html>
  );
}
