import { JobPosting, CandidateApplication, AuditLogItem } from './types';

export const INITIAL_JOBS: JobPosting[] = [
  {
    id: 'job-1',
    title: 'Backend Engineer',
    department: 'Engineering',
    location: 'Jakarta (Hybrid)',
    status: 'open',
    minimum_experience_months: 24,
    mandatory_skills: ['Python', 'PostgreSQL', 'Docker'],
    preferred_skills: ['Redis', 'FastAPI', 'Kubernetes', 'gRPC'],
    created_at: new Date().toISOString(),
    applications_count: 0,
  },
  {
    id: 'job-2',
    title: 'Frontend Specialist (React/Next.js)',
    department: 'Engineering',
    location: 'Remote',
    status: 'open',
    minimum_experience_months: 36,
    mandatory_skills: ['React', 'TypeScript', 'Next.js', 'Tailwind CSS'],
    preferred_skills: ['GraphQL', 'Zustand', 'Jest', 'Cypress'],
    created_at: new Date().toISOString(),
    applications_count: 0,
  },
  {
    id: 'job-3',
    title: 'DevOps & Platform Lead',
    department: 'Infrastructure',
    location: 'Jakarta (On-site)',
    status: 'open',
    minimum_experience_months: 48,
    mandatory_skills: ['Kubernetes', 'Terraform', 'CI/CD', 'AWS'],
    preferred_skills: ['Prometheus', 'Grafana', 'Go', 'Security Auditing'],
    created_at: new Date().toISOString(),
    applications_count: 0,
  },
];

// Empty applications list - ready for real test PDF CV uploads
export const INITIAL_APPLICATIONS: CandidateApplication[] = [];

// Empty initial audit logs
export const INITIAL_AUDIT_LOGS: AuditLogItem[] = [];
