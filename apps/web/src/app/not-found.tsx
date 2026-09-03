'use client';

import React from 'react';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3 bg-surface rounded my-8 p-8 text-center">
      <h1 className="text-4xl font-extrabold text-ink">404</h1>
      <p className="text-xs text-ink-muted">Halaman yang Anda cari tidak ditemukan.</p>
      <a
        href="/"
        className="inline-flex items-center justify-center h-7 px-2.5 text-xs font-bold rounded bg-accent text-accent-fg hover:bg-accent/90 transition-colors"
      >
        Kembali ke Dashboard
      </a>
    </div>
  );
}
