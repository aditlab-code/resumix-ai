import json
import httpx
from typing import Any, Dict, Optional
from app.services.llm_provider import GROQ_API_URL, DEFAULT_GROQ_API_KEY, DEFAULT_GROQ_MODEL

JOB_EXTRACTION_SYSTEM_PROMPT = """You are an expert AI HR ATS Job Description Parser. Analyze the provided raw job posting text (from LinkedIn, Glints, or Job Street across ANY tech/engineering domain) and extract structured job requirements.
OUTPUT ONLY VALID UNWRAPPED JSON matching this exact schema:
{
  "title": "Clean Professional Job Title (e.g. Senior Backend Engineer, DevOps Engineer, QA Automation)",
  "company_name": "Company or Organization Name (e.g. AME Group, Beca, SPX Express, Bukalapak)",
  "department": "Department or Function (e.g. Engineering, Digital Development, Operations)",
  "location": "Location (e.g. Jakarta, Hybrid, Remote)",
  "minimum_experience_months": 36,
  "mandatory_skills": ["Python", "PostgreSQL", "Docker"],
  "preferred_skills": ["Kubernetes", "Redis"],
  "skill_equivalents": {
    "Python": ["FastAPI", "Django", "Flask", "Python 3"],
    "PostgreSQL": ["Postgres", "Relational Database", "SQL"],
    "Docker": ["Containerization", "Docker Compose", "Podman"]
  },
  "summary": "Concise 2-3 sentence summary of the job role and core responsibilities"
}
RULES:
1. Extract the clean job title accurately.
2. Extract company_name, department, and location if mentioned in the text (or set to null if not specified).
3. Convert required years of experience into total months (e.g. 3 years = 36, 1-3 years = 12, 6 months = 6). Default to 0 if not specified.
4. Extract ALL explicit required/mandatory technical and domain skills into mandatory_skills list.
5. Extract ALL optional or preferred skills (nice to have) into preferred_skills list.
6. For each mandatory_skill, map a dictionary of skill_equivalents containing 2-5 acceptable aliases, related frameworks, or child tools in that domain (e.g. React -> [Next.js, React.js, TypeScript]; Java -> [Spring Boot, Java 17]).
7. Do not hallucinate non-existent requirements.
8. Output ONLY JSON without markdown wrappers.
"""


async def extract_job_qualifications_via_groq(
    raw_job_text: str,
    api_key: Optional[str] = None,
    model: Optional[str] = None,
) -> Dict[str, Any]:
    """Parse raw job posting text (from LinkedIn/Glints) into structured job qualifications using Groq LLM."""
    if not raw_job_text or not raw_job_text.strip():
        raise ValueError("Teks deskripsi lowongan kerja tidak boleh kosong.")

    from app.services.text_pruner import prune_raw_text
    pruned_text = prune_raw_text(raw_job_text)

    key = api_key or DEFAULT_GROQ_API_KEY
    selected_model = model or DEFAULT_GROQ_MODEL

    headers = {
        "Authorization": f"Bearer {key}",
        "Content-Type": "application/json",
    }

    payload = {
        "model": selected_model,
        "messages": [
            {"role": "system", "content": JOB_EXTRACTION_SYSTEM_PROMPT},
            {"role": "user", "content": f"Extract job requirements from this job description text:\n\n{pruned_text[:6000]}"},
        ],
        "temperature": 0.1,
        "response_format": {"type": "json_object"},
    }

    async with httpx.AsyncClient(timeout=30.0) as client:
        response = await client.post(GROQ_API_URL, headers=headers, json=payload)
        if response.status_code != 200:
            raise Exception(f"Groq API Error ({response.status_code}): {response.text}")

        data = response.json()
        content = data["choices"][0]["message"]["content"]
        parsed_json = json.loads(content)

        # Sanitize defaults
        parsed_json.setdefault("title", "Job Posting")
        parsed_json.setdefault("minimum_experience_months", 0)
        parsed_json.setdefault("mandatory_skills", [])
        parsed_json.setdefault("preferred_skills", [])
        parsed_json.setdefault("skill_equivalents", {})
        parsed_json.setdefault("summary", "")

        return parsed_json
