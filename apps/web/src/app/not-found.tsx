'use client';

import React from 'react';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-4 bg-white p-8 rounded-xl border border-slate-300 my-8">
      <h1 className="text-4xl font-extrabold text-slate-900">404</h1>
      <p className="text-xs text-slate-600">Halaman yang Anda cari tidak ditemukan.</p>
      <a
        href="/"
        className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white font-bold rounded-lg border border-sky-600 text-xs transition"
      >
        Kembali ke Dashboard HR
      </a>
    </div>
  );
}
