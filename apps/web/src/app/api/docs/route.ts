import { NextRequest, NextResponse } from 'next/server';
import { STATIC_DOCS } from '@/content/docs/static-docs';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const docKey = searchParams.get('doc') || 'readme';

  const content = STATIC_DOCS[docKey] || STATIC_DOCS.readme;

  return NextResponse.json({
    success: true,
    docKey,
    content,
  });
}
