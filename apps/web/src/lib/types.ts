import { ApplicationStatus, ParseStatus, ScoreBreakdown, CVExtractionDTO } from '@cv-ats/contracts';

export interface JobPosting {
  id: string;
  title: string;
  department: string;
  location: string;
  status: 'open' | 'closed' | 'draft';
  minimum_experience_months: number;
  mandatory_skills: string[];
  preferred_skills: string[];
  created_at: string;
  applications_count: number;
}

export interface CandidateApplication {
  id: string;
  job_id: string;
  candidate_id: string;
  document_id: string;
  candidate_name: string;
  email: string;
  phone_number?: string;
  applied_at: string;
  status: ApplicationStatus;
  parse_status: ParseStatus;
  job_fit_score: number;
  score_breakdown: ScoreBreakdown;
  cv_extraction: CVExtractionDTO;
  storage_path: string;
  original_filename: string;
  file_size_bytes: number;
  pdf_url?: string;
  parse_error?: string;
}

export interface AuditLogItem {
  id: string;
  timestamp: string;
  actor: string;
  action: string;
  target_entity: string;
  entity_id: string;
  details: string;
}
