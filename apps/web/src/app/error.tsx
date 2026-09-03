'use client';

import React, { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center py-16 text-center space-y-4 bg-white border border-slate-300 rounded-xl my-8 p-6">
      <h2 className="text-xl font-bold text-slate-900">Kendala pada Halaman ATS</h2>
      <p className="text-xs text-slate-600 max-w-sm">
        {error.message || 'Terjadi kesalahan sistem saat memproses halaman ini.'}
      </p>
      <button
        onClick={() => reset()}
        className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs rounded-lg border border-sky-600 transition"
      >
        Coba Lagi
      </button>
    </div>
  );
}
