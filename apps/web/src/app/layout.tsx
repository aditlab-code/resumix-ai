import React from 'react';
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

export const metadata = {
  title: 'Resumix AI | Enterprise Recruitment Intelligence',
  description: 'AI-Assisted Candidate Screening & Recruitment ATS System',
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


