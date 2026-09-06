import { env } from '../config/env';

const AI_ENDPOINTS = {
  HEALTH: '/health',
  EXTRACT_TEXT: '/v1/cv/extract-text',
  LLM_EXTRACT: '/v1/cv/llm-extract',
  NORMALIZE_SKILLS: '/v1/cv/normalize-skills',
  GENERATE_EMBEDDING: '/v1/cv/generate-embedding',
  CALCULATE_SCORE: '/v1/cv/calculate-score',
  EXTRACT_QUALIFICATIONS: '/v1/job/extract-qualifications',
} as const;

export interface AIServiceHealth {
  status: string;
  service: string;
  provider: string;
  model: string;
  embedding_model: string;
}

export interface EmbeddingResponse {
  model: string;
  dimensions: number;
  embedding: number[];
  skill_embedding?: number[];
  role_embedding?: number[];
}

export interface JobFitScoreBreakdown {
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
  preferred_skill_score: number;
  preferred_skill_weight: number;
  final_score: number;
  matched_skills: string[];
  missing_mandatory_skills: string[];
}

export interface ProcessFullCVResult {
  raw_text: string;
  metadata: Record<string, any>;
  extraction: Record<string, any>;
  normalized_skills: string[];
  profile_embedding: number[];
  skill_embedding?: number[];
  role_embedding?: number[];
  score_breakdown?: JobFitScoreBreakdown;
}

export class AIClientService {
  private baseUrl: string;

  constructor(baseUrl?: string) {
    this.baseUrl = baseUrl || env.AI_SERVICE_URL;
  }

  async checkHealth(): Promise<AIServiceHealth> {
    const res = await fetch(`${this.baseUrl}${AI_ENDPOINTS.HEALTH}`);
    if (!res.ok) {
      throw new Error(`AI Service Health Check Failed: ${res.statusText}`);
    }
    return (await res.json()) as AIServiceHealth;
  }

  async extractText(fileBuffer: Buffer, filename: string): Promise<{ raw_text: string; metadata: any }> {
    const blob = new Blob([fileBuffer], { type: 'application/pdf' });
    const formData = new FormData();
    formData.append('file', blob, filename);

    const res = await fetch(`${this.baseUrl}${AI_ENDPOINTS.EXTRACT_TEXT}`, {
      method: 'POST',
      body: formData,
    });

    if (!res.ok) {
      const errJson = (await res.json().catch(() => ({ detail: res.statusText }))) as { detail?: any };
      throw new Error(`AI Service extract-text error (${res.status}): ${JSON.stringify(errJson.detail)}`);
    }

    return (await res.json()) as { raw_text: string; metadata: any };
  }

  async extractViaLLM(rawText: string): Promise<{ provider: string; model: string; extraction: any }> {
    const res = await fetch(`${this.baseUrl}${AI_ENDPOINTS.LLM_EXTRACT}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ raw_text: rawText }),
    });

    if (!res.ok) {
      const errJson = (await res.json().catch(() => ({ detail: res.statusText }))) as { detail?: any };
      throw new Error(`AI Service llm-extract error (${res.status}): ${JSON.stringify(errJson.detail)}`);
    }

    return (await res.json()) as { provider: string; model: string; extraction: any };
  }

  async normalizeSkills(skills: string[]): Promise<{ skills: string[]; normalized_skills: string[] }> {
    const res = await fetch(`${this.baseUrl}${AI_ENDPOINTS.NORMALIZE_SKILLS}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(skills),
    });

    if (!res.ok) {
      const errJson = (await res.json().catch(() => ({ detail: res.statusText }))) as { detail?: any };
      throw new Error(`AI Service normalize-skills error (${res.status}): ${JSON.stringify(errJson.detail)}`);
    }

    return (await res.json()) as { skills: string[]; normalized_skills: string[] };
  }

  async generateEmbedding(params: { text?: string; cv_extraction?: any }): Promise<EmbeddingResponse> {
    const res = await fetch(`${this.baseUrl}${AI_ENDPOINTS.GENERATE_EMBEDDING}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });

    if (!res.ok) {
      const errJson = (await res.json().catch(() => ({ detail: res.statusText }))) as { detail?: any };
      throw new Error(`AI Service generate-embedding error (${res.status}): ${JSON.stringify(errJson.detail)}`);
    }

    return (await res.json()) as EmbeddingResponse;
  }

  async calculateScore(params: {
    candidate_skills: string[];
    candidate_experience_months?: number;
    mandatory_skills: string[];
    preferred_skills?: string[];
    required_experience_months?: number;
    semantic_similarity?: number;
    candidate_embedding?: number[];
    job_embedding?: number[];
    candidate_skill_embedding?: number[];
    job_skill_embedding?: number[];
    candidate_role_embedding?: number[];
    job_role_embedding?: number[];
  }): Promise<JobFitScoreBreakdown> {
    const res = await fetch(`${this.baseUrl}${AI_ENDPOINTS.CALCULATE_SCORE}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });

    if (!res.ok) {
      const errJson = (await res.json().catch(() => ({ detail: res.statusText }))) as { detail?: any };
      throw new Error(`AI Service calculate-score error (${res.status}): ${JSON.stringify(errJson.detail)}`);
    }

    return (await res.json()) as JobFitScoreBreakdown;
  }

  async extractJobQualifications(rawJobText: string): Promise<{
    qualifications: {
      title: string;
      company_name?: string;
      department?: string;
      location?: string;
      minimum_experience_months: number;
      mandatory_skills: string[];
      preferred_skills: string[];
      summary: string;
    };
    job_embedding: number[];
    job_skill_embedding?: number[];
    job_role_embedding?: number[];
    dimensions: number;
  }> {
    const res = await fetch(`${this.baseUrl}${AI_ENDPOINTS.EXTRACT_QUALIFICATIONS}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ raw_text: rawJobText }),
    });

    if (!res.ok) {
      const errJson = (await res.json().catch(() => ({ detail: res.statusText }))) as { detail?: any };
      throw new Error(`AI Service extract-qualifications error (${res.status}): ${JSON.stringify(errJson.detail)}`);
    }

    return (await res.json()) as {
      qualifications: {
        title: string;
        company_name?: string;
        department?: string;
        location?: string;
        minimum_experience_months: number;
        mandatory_skills: string[];
        preferred_skills: string[];
        summary: string;
      };
      job_embedding: number[];
      job_skill_embedding?: number[];
      job_role_embedding?: number[];
      dimensions: number;
    };
  }

  /**
   * Complete End-to-End Orchestrated Pipeline Integration
   * Runs Extraction -> LLM Parsing -> Skill Normalization -> Multilingual Embedding -> Scoring
   */
  async processFullCVPipeline(
    fileBuffer: Buffer,
    filename: string,
    jobCriteria?: {
      mandatory_skills: string[];
      preferred_skills?: string[];
      required_experience_months?: number;
      job_embedding?: number[];
      job_skill_embedding?: number[];
      job_role_embedding?: number[];
    }
  ): Promise<ProcessFullCVResult> {
    // 1. Text Extraction (PyMuPDF with Zero-Text Rejection Rule)
    const { raw_text, metadata } = await this.extractText(fileBuffer, filename);

    // 2. Structured Fact Extraction via Groq LLM
    const llmRes = await this.extractViaLLM(raw_text);
    const extraction = llmRes.extraction;

    // 3. Extract and Normalize Candidate Skills
    const rawSkills: string[] = (extraction.skills || []).map((s: any) =>
      typeof s === 'string' ? s : s.name
    );
    const normRes = await this.normalizeSkills(rawSkills);
    const normalizedSkills = normRes.normalized_skills;

    // 4. Generate 384-dim Dual Vector Embeddings (Skill & Role Vectors)
    const embeddingRes = await this.generateEmbedding({ cv_extraction: extraction });

    // 5. Calculate Job-Fit Score if Job Criteria Provided
    let scoreBreakdown: JobFitScoreBreakdown | undefined;
    if (jobCriteria) {
      scoreBreakdown = await this.calculateScore({
        candidate_skills: normalizedSkills,
        candidate_experience_months: extraction.total_experience_months || 0,
        mandatory_skills: jobCriteria.mandatory_skills,
        preferred_skills: jobCriteria.preferred_skills,
        required_experience_months: jobCriteria.required_experience_months || 24,
        candidate_embedding: embeddingRes.embedding,
        job_embedding: jobCriteria.job_embedding,
        candidate_skill_embedding: embeddingRes.skill_embedding,
        job_skill_embedding: jobCriteria.job_skill_embedding,
        candidate_role_embedding: embeddingRes.role_embedding,
        job_role_embedding: jobCriteria.job_role_embedding,
      });
    }

    return {
      raw_text,
      metadata,
      extraction,
      normalized_skills: normalizedSkills,
      profile_embedding: embeddingRes.embedding,
      skill_embedding: embeddingRes.skill_embedding,
      role_embedding: embeddingRes.role_embedding,
      score_breakdown: scoreBreakdown,
    };
  }
}

export const aiClient = new AIClientService();
