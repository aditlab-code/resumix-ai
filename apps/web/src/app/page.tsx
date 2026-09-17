'use client';

import React from 'react';
import Link from 'next/link';
import './globals.css';
import { useAppData } from '@/context/app-data-context';
import { StatsOverview } from '@/components/dashboard/stats-overview';
import { Card, Button } from '@/components/ui';
import { FileText, Plus, ArrowRight, Briefcase } from 'lucide-react';

export default function DashboardPage() {
  const {
    jobs,
    applications,
    setIsUploadModalOpen,
    setIsCreateJobModalOpen,
  } = useAppData();

  const totalApplications = applications.length;
  const statusCounts = {
    applied: applications.filter((a) => a.status === 'applied').length,
    screening: applications.filter((a) => a.status === 'screening').length,
    interview: applications.filter((a) => a.status === 'interview').length,
    hired: applications.filter((a) => a.status === 'hired').length,
    rejected: applications.filter((a) => a.status === 'rejected').length,
  };

  return (
    <div className="space-y-6">
      {/* 1. KPI Cards Overview */}
      <StatsOverview
        jobs={jobs}
        applications={applications}
      />

      {/* 2. Grid Container: Pipeline Status Breakdown & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recruitment Pipeline Status Distribution */}
        <Card className="lg:col-span-2 space-y-4 p-5">
          <div className="flex items-center justify-between border-b border-surface-border pb-3">
            <div>
              <h2 className="text-h2 font-bold text-ink-default">
                Recruitment Status
              </h2>
            </div>
            <Link href="/candidates">
              <Button variant="ghost" size="sm" iconRight={<ArrowRight className="w-4 h-4" />}>
                View Candidates
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            <div className="bg-surface-sunken border border-surface-border p-3.5 rounded-md text-center">
              <div className="text-caption font-semibold text-ink-subtle">Applied</div>
              <div className="text-h1 font-bold text-ink-default mt-1">{statusCounts.applied}</div>
            </div>
            <div className="bg-surface-sunken border border-surface-border p-3.5 rounded-md text-center">
              <div className="text-caption font-semibold text-blue-600">Screening</div>
              <div className="text-h1 font-bold text-blue-600 mt-1">{statusCounts.screening}</div>
            </div>
            <div className="bg-surface-sunken border border-surface-border p-3.5 rounded-md text-center">
              <div className="text-caption font-semibold text-purple-600">Interview</div>
              <div className="text-h1 font-bold text-purple-600 mt-1">{statusCounts.interview}</div>
            </div>
            <div className="bg-surface-sunken border border-surface-border p-3.5 rounded-md text-center">
              <div className="text-caption font-semibold text-emerald-600">Hired</div>
              <div className="text-h1 font-bold text-emerald-600 mt-1">{statusCounts.hired}</div>
            </div>
            <div className="bg-surface-sunken border border-surface-border p-3.5 rounded-md text-center">
              <div className="text-caption font-semibold text-rose-600">Rejected</div>
              <div className="text-h1 font-bold text-rose-600 mt-1">{statusCounts.rejected}</div>
            </div>
          </div>

          {totalApplications > 0 && (
            <div className="space-y-1.5 pt-2">
              <div className="flex justify-between text-xs font-semibold text-ink-subtle">
                <span>Selection Progress (Total: {totalApplications} Applicants)</span>
                <span>
                  {Math.round(((statusCounts.interview + statusCounts.hired) / totalApplications) * 100)}% Shortlisted
                </span>
              </div>
              <div className="w-full bg-surface-sunken h-2.5 rounded-pill overflow-hidden flex">
                <div
                  className="bg-slate-400 h-full w-[var(--width)]"
                  style={{ '--width': `${(statusCounts.applied / totalApplications) * 100}%` } as React.CSSProperties}
                />
                <div
                  className="bg-blue-500 h-full w-[var(--width)]"
                  style={{ '--width': `${(statusCounts.screening / totalApplications) * 100}%` } as React.CSSProperties}
                />
                <div
                  className="bg-purple-500 h-full w-[var(--width)]"
                  style={{ '--width': `${(statusCounts.interview / totalApplications) * 100}%` } as React.CSSProperties}
                />
                <div
                  className="bg-emerald-500 h-full w-[var(--width)]"
                  style={{ '--width': `${(statusCounts.hired / totalApplications) * 100}%` } as React.CSSProperties}
                />
                <div
                  className="bg-rose-500 h-full w-[var(--width)]"
                  style={{ '--width': `${(statusCounts.rejected / totalApplications) * 100}%` } as React.CSSProperties}
                />
              </div>
            </div>
          )}
        </Card>

        {/* Quick Action Hub */}
        <Card className="space-y-4 p-5 flex flex-col justify-between">
          <div>
            <h2 className="text-h2 font-bold text-ink-default border-b border-surface-border pb-3">
              Quick Actions
            </h2>
            <div className="space-y-3 mt-4">
              <button
                onClick={() => setIsUploadModalOpen(true)}
                className="w-full p-3.5 rounded-md border border-surface-border bg-surface-raised hover:bg-surface-hover hover:border-slate-300 flex items-center justify-between text-left transition-colors duration-120 active:scale-[0.98] group focus-ring"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-md bg-blue-50 text-blue-600">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div className="text-body font-bold text-ink-default group-hover:text-brand-accent transition-colors duration-120">
                    Upload Resume CV
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-ink-subtle group-hover:text-brand-accent transition-colors duration-120" />
              </button>

              <button
                onClick={() => setIsCreateJobModalOpen(true)}
                className="w-full p-3.5 rounded-md border border-surface-border bg-surface-raised hover:bg-surface-hover hover:border-slate-300 flex items-center justify-between text-left transition-colors duration-120 active:scale-[0.98] group focus-ring"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-md bg-emerald-50 text-emerald-600">
                    <Plus className="w-5 h-5" />
                  </div>
                  <div className="text-body font-bold text-ink-default group-hover:text-brand-accent transition-colors duration-120">
                    Post Available Job
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-ink-subtle group-hover:text-brand-accent transition-colors duration-120" />
              </button>

              <Link
                href="/jobs"
                className="w-full p-3.5 rounded-md border border-surface-border bg-surface-raised hover:bg-surface-hover hover:border-slate-300 flex items-center justify-between text-left transition-colors duration-120 active:scale-[0.98] group focus-ring"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-md bg-purple-50 text-purple-600">
                    <Briefcase className="w-5 h-5" />
                  </div>
                  <div className="text-body font-bold text-ink-default group-hover:text-brand-accent transition-colors duration-120">
                    Manage Jobs
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-ink-subtle group-hover:text-brand-accent transition-colors duration-120" />
              </Link>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
