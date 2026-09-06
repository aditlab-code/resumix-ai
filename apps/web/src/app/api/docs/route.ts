import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const DOC_FILENAMES: Record<string, { bundled: string; relative: string }> = {
  readme: { bundled: 'README.md', relative: 'README.md' },
  architecture: { bundled: 'ARCHITECTURE.md', relative: 'ARCHITECTURE.md' },
  evaluation: { bundled: 'evaluation.md', relative: 'docs/evaluation.md' },
  license: { bundled: 'LICENSE', relative: 'LICENSE' },
  licenseDocs: { bundled: 'LICENSE-DOCS.md', relative: 'LICENSE-DOCS.md' },
};

function getCandidateFilePaths(docKey: string): string[] {
  const cwd = process.cwd();
  const info = DOC_FILENAMES[docKey] || DOC_FILENAMES.readme;

  return [
    // 1. Direct path inside apps/web/src/content/docs (bundled natively by Vercel)
    path.join(cwd, 'src', 'content', 'docs', info.bundled),
    path.join(cwd, 'apps', 'web', 'src', 'content', 'docs', info.bundled),
    // 2. Relative root paths for local dev & monorepo setups
    path.join(cwd, info.relative),
    path.resolve(cwd, '../../', info.relative),
    path.resolve(cwd, '../', info.relative),
  ];
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const docKey = searchParams.get('doc') || 'readme';

  const candidatePaths = getCandidateFilePaths(docKey);

  for (const filePath of candidatePaths) {
    try {
      const content = await fs.readFile(filePath, 'utf-8');
      return NextResponse.json({
        success: true,
        docKey,
        content,
      });
    } catch {
      // Continue to next candidate path
    }
  }

  console.error(`[API Docs] Failed to read doc '${docKey}' across candidates:`, candidatePaths);
  return NextResponse.json(
    {
      success: false,
      error: `Gagal membaca berkas dokumentasi (${docKey})`,
    },
    { status: 404 }
  );
}
