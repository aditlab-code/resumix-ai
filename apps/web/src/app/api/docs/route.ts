import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

function getProjectRoot(): string {
  const cwd = process.cwd();
  // If running inside apps/web
  if (cwd.endsWith('apps/web')) {
    return path.resolve(cwd, '../../');
  }
  return cwd;
}

const DOC_PATHS: Record<string, string> = {
  readme: 'README.md',
  architecture: 'ARCHITECTURE.md',
  evaluation: 'docs/evaluation.md',
  license: 'LICENSE',
  licenseDocs: 'LICENSE-DOCS.md',
};

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const docKey = searchParams.get('doc') || 'readme';

  const relativePath = DOC_PATHS[docKey] || DOC_PATHS.readme;
  const projectRoot = getProjectRoot();
  const filePath = path.join(projectRoot, relativePath);

  try {
    const content = await fs.readFile(filePath, 'utf-8');
    return NextResponse.json({
      success: true,
      docKey,
      relativePath,
      content,
    });
  } catch (error) {
    console.error(`[API Docs] Failed to read ${filePath}:`, error);
    return NextResponse.json(
      {
        success: false,
        error: `Gagal membaca berkas dokumentasi (${relativePath})`,
      },
      { status: 404 }
    );
  }
}
