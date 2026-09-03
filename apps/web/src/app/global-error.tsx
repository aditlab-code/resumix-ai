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
    <html lang="id">
      <body className="bg-canvas text-ink flex flex-col items-center justify-center min-h-screen">
        <div className="p-8 bg-surface border border-line rounded text-center space-y-3 max-w-md">
          <h2>Terjadi kesalahan sistem</h2>
          <p className="text-xs text-ink-muted leading-relaxed">
            {error.message || 'Sistem mengalami kendala tak terduga. Silakan muat ulang halaman.'}
          </p>
          <button
            onClick={() => reset()}
            className="inline-flex items-center justify-center h-9 px-4 text-xs font-bold rounded bg-accent text-accent-fg hover:bg-accent/90 transition-colors"
          >
            Muat ulang
          </button>
        </div>
      </body>
    </html>
  );
}
