import React from 'react';
import './globals.css';

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
    <html lang="id" className="h-full">
      <body className="bg-canvas text-ink min-h-screen antialiased m-0 p-0">
        {children}
      </body>
    </html>
  );
}
