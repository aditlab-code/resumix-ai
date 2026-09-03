import React from 'react';
import './globals.css';

export const metadata = {
  title: 'CV ATS Pipeline - HR Candidate Screening & AI Scoring',
  description: 'Enterprise AI-Assisted Candidate Screening & Job-Fit Scoring System',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" className="h-full">
      <body className="bg-slate-100 text-slate-900 min-h-screen font-sans antialiased selection:bg-sky-500 selection:text-white m-0 p-0">
        {children}
      </body>
    </html>
  );
}
