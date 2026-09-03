# Job-Fit Scoring Formula Specification

## 1. Formula Baseline (Version v1)

Skor akhir kandidat ($S$) berada dalam rentang **0 hingga 100** dan dihitung dengan formula berikut:

$$
S = 100 \times \left(
0.45 S_{\text{semantic}} +
0.30 S_{\text{mandatory}} +
0.20 S_{\text{experience}} +
0.05 S_{\text{preferred}}
\right)
$$

Dimana:
- $S_{\text{semantic}}$: Cosine similarity antara profile vector dan job vector (0.0 - 1.0).
- $S_{\text{mandatory}}$: Rasio skill wajib kandidat yang terpenuhi.
- $S_{\text{experience}} = \min\left(1.0, \frac{\text{Candidate Experience Months}}{\text{Required Minimum Months}}\right)$.
- $S_{\text{preferred}}$: Rasio skill tambahan kandidat yang terpenuhi.

---

## 2. Format Output Breakdown

Setiap aplikasi menyimpan `score_breakdown` JSONB untuk auditability HR:

```json
{
  "score_version": "v1",
  "semantic_similarity": 0.82,
  "semantic_weight": 0.45,
  "mandatory_skill_score": 0.75,
  "mandatory_skill_weight": 0.30,
  "experience_score": 1.00,
  "experience_weight": 0.20,
  "preferred_skill_score": 0.60,
  "preferred_skill_weight": 0.05,
  "final_score": 84.4,
  "matched_skills": ["Python", "PostgreSQL", "Docker"],
  "missing_mandatory_skills": ["Kubernetes"]
}
```
