'use client';

import React, { useEffect } from 'react';
import { Button } from '@/components/ui';

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
    <div className="flex flex-col items-center justify-center gap-3 bg-surface border border-line rounded my-8 p-8 text-center">
      <h2>Page Error</h2>
      <p className="text-xs text-ink-muted max-w-sm">
        {error.message || 'A system error occurred while processing this page.'}
      </p>
      <Button size="sm" onClick={() => reset()}>
        Try again
      </Button>
    </div>
  );
}
