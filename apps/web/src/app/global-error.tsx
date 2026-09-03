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
      <body className="bg-slate-50 text-slate-900 flex flex-col items-center justify-center min-h-screen">
        <div className="p-8 bg-white border border-slate-300 rounded-xl text-center space-y-4 max-w-md">
          <h2 className="text-xl font-bold text-slate-900">Terjadi Kesalahan Sistem</h2>
          <p className="text-xs text-slate-600 leading-relaxed">
            {error.message || 'Sistem mengalami kendala tak terduga. Silakan muat ulang halaman.'}
          </p>
          <button
            onClick={() => reset()}
            className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs rounded-lg border border-sky-600 transition"
          >
            Muat Ulang Dashboard
          </button>
        </div>
      </body>
    </html>
  );
}
