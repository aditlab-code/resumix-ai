export type ApplicationStatus =
  | 'applied'
  | 'screening'
  | 'interview'
  | 'rejected'
  | 'hired'
  | 'withdrawn';

export type ParseStatus =
  | 'uploaded'
  | 'queued'
  | 'processing'
  | 'processed'
  | 'needs_review'
  | 'failed';

export interface ScoreBreakdown {
  score_version: string;
  semantic_similarity: number;
  semantic_weight: number;
  skill_semantic_similarity?: number;
  skill_semantic_weight?: number;
  role_semantic_similarity?: number;
  role_semantic_weight?: number;
  mandatory_skill_score: number;
  mandatory_skill_weight: number;
  experience_score: number;
  experience_weight: number;
  relevant_experience_months?: number;
  preferred_skill_score: number;
  preferred_skill_weight: number;
  mandatory_penalty_factor?: number;
  final_score: number;
  matched_skills: string[];
  missing_mandatory_skills: string[];
}

export interface CandidateSkillDTO {
  name: string;
  normalized_name: string;
  category: string;
  confidence?: number;
}

export interface WorkExperienceDTO {
  company?: string;
  role?: string;
  start_date?: string;
  end_date?: string;
  is_current: boolean;
  duration_months?: number;
  description?: string;
  projects?: string[];
  technologies?: string[];
}

export interface EducationDTO {
  institution?: string;
  degree?: string;
  major?: string;
  start_year?: number;
  end_year?: number;
}

export interface PortfolioDTO {
  title: string;
  url?: string;
  description?: string;
}

export interface ReferenceDTO {
  name: string;
  role?: string;
  company?: string;
  contact_info?: string;
}

export interface CVExtractionDTO {
  full_name?: string;
  contact: {
    email?: string;
    phone_number?: string;
    linkedin_url?: string;
    portfolio_url?: string;
    location?: string;
  };
  summary?: string;
  skills: CandidateSkillDTO[];
  work_experience: WorkExperienceDTO[];
  education: EducationDTO[];
  certifications: string[];
  projects: string[];
  portfolios?: PortfolioDTO[];
  references?: ReferenceDTO[];
  total_experience_months?: number;
  extraction_warnings: string[];
}
