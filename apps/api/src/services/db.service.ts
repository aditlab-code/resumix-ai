import { Pool } from 'pg';
import { env } from '../config/env';

export class DBService {
  private pool: Pool;

  constructor() {
    this.pool = new Pool({
      connectionString: env.DATABASE_URL,
    });
  }

  /**
   * Helper to format a float array into pgvector literal syntax string: '[0.1, 0.2, ...]'
   */
  public formatVector(vec: number[]): string {
    if (!vec || !Array.isArray(vec)) return '[]';
    return `[${vec.join(',')}]`;
  }

  /**
   * Save extracted candidate profile & pgvector embedding into PostgreSQL
   */
  async saveCandidate(data: {
    full_name?: string;
    email?: string;
    phone_number?: string;
    location?: string;
    total_experience_months?: number;
    parsed_cv_json: Record<string, any>;
    profile_embedding: number[];
  }): Promise<string> {
    const vectorString = this.formatVector(data.profile_embedding);

    const query = `
      INSERT INTO candidates (
        full_name, email, phone_number, location,
        total_experience_months, parsed_cv_json, profile_embedding
      ) VALUES ($1, $2, $3, $4, $5, $6, $7::vector)
      RETURNING id;
    `;

    const values = [
      data.full_name || null,
      data.email || null,
      data.phone_number || null,
      data.location || null,
      data.total_experience_months || 0,
      JSON.stringify(data.parsed_cv_json),
      vectorString,
    ];

    const result = await this.pool.query(query, values);
    return result.rows[0].id;
  }

  /**
   * Perform pgvector cosine similarity search using match_candidates_for_job function
   */
  async matchCandidatesForJob(
    jobId: string,
    threshold: number = 0.5,
    limit: number = 20
  ): Promise<
    Array<{
      candidate_id: string;
      full_name: string;
      email: string;
      total_experience_months: number;
      semantic_similarity: number;
    }>
  > {
    const query = `
      SELECT * FROM match_candidates_for_job($1, $2, $3);
    `;

    const result = await this.pool.query(query, [jobId, threshold, limit]);
    return result.rows;
  }

  async close(): Promise<void> {
    await this.pool.end();
  }
}

export const dbService = new DBService();
