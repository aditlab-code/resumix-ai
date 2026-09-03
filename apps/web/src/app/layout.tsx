import React from 'react';
import { Inter, JetBrains_Mono } from 'next/font/google';
import './globals.css';

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
  title: 'Resumix AI | Enterprise Candidate Intelligence',
  description: 'AI-Assisted Candidate Screening & Dual-Vector ATS',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" className={`h-full ${inter.variable} ${jetbrainsMono.variable}`}>
      <body className="bg-surface-canvas text-ink-default min-h-screen antialiased m-0 p-0 font-sans">
        {children}
      </body>
    </html>
  );
}

