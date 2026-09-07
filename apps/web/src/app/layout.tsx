import React from 'react';
import type { Metadata } from 'next';
import './globals.css';
import { Inter, JetBrains_Mono } from 'next/font/google';
import { AppDataProvider } from '@/context/app-data-context';
import { AppLayoutShell } from '@/components/dashboard/app-layout-shell';
import { Toaster } from '@/components/ui/sonner';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
  title: {
    default: 'Resumix AI | Enterprise Recruitment Intelligence',
    template: '%s | Resumix AI',
  },
  description:
    'Enterprise Recruitment Intelligence & Next-Gen ATS Resume Screening System. Automate candidate evaluation, job-fit scoring, and skill taxonomy matching.',
  applicationName: 'Resumix AI',
  authors: [{ name: 'Resumix AI Engineering Team' }],
  generator: 'Next.js 14',
  keywords: [
    'Resumix AI',
    'Recruitment Intelligence',
    'ATS System',
    'AI Resume Parser',
    'Job-Fit Scoring',
    'Candidate Screening',
    'pgvector',
    'FastAPI',
    'BullMQ',
    'Skill Matching',
  ],
  referrer: 'origin-when-cross-origin',
  creator: 'Resumix AI Team',
  publisher: 'Resumix AI',
  openGraph: {
    title: 'Resumix AI | Enterprise Recruitment Intelligence',
    description:
      'Enterprise Recruitment Intelligence & Next-Gen ATS Resume Screening System.',
    siteName: 'Resumix AI',
    locale: 'id_ID',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Resumix AI | Enterprise Recruitment Intelligence',
    description:
      'Enterprise Recruitment Intelligence & Next-Gen ATS Resume Screening System.',
    creator: '@resumix_ai',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" className={`h-full ${inter.variable} ${jetbrainsMono.variable}`}>
      <head>
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/npm/katex@0.16.8/dist/katex.min.css"
        />
      </head>
      <body className="bg-surface-canvas text-ink-default min-h-screen antialiased m-0 p-0 font-sans">
        <AppDataProvider>
          <AppLayoutShell>{children}</AppLayoutShell>
          <Toaster />
        </AppDataProvider>
      </body>
    </html>
  );
}


