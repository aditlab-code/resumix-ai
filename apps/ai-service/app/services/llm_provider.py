import os
import json
import httpx
from typing import Any, Dict, Optional

GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions"
DEFAULT_GROQ_API_KEY = os.getenv("GROQ_API_KEY") or os.getenv("LLM_API_KEY", "")
DEFAULT_GROQ_MODEL = os.getenv("LLM_MODEL", "llama-3.1-8b-instant")

SYSTEM_PROMPT = """You are an expert AI ATS System parser. Analyze the provided CV raw text and extract ALL structured facts without skipping any entry.
OUTPUT ONLY VALID UNWRAPPED JSON matching this exact schema:
{
  "full_name": "Candidate Full Name",
  "contact": {
    "email": "user@example.com",
    "phone_number": "+62 8xx-xxxx-xxxx",
    "location": "City, Country or Full Address"
  },
  "summary": "Concise 2-3 sentence executive profile summary created from CV profile text",
  "skills": [
    {"name": "Skill Name", "normalized_name": "Normalized Skill", "category": "Technical or Administrative"}
  ],
  "work_experience": [
    {
      "company": "Company Name / School / Institution",
      "role": "Job Title / Position",
      "start_date": "YYYY or YYYY-MM",
      "end_date": "YYYY or YYYY-MM or Present",
      "is_current": false,
      "duration_months": 24,
      "description": "Responsibilities and bullet points summary",
      "projects": ["Project Name 1"]
    }
  ],
  "education": [
    {
      "institution": "Full University, Institute, Polytechnic, or High School Name (e.g. Universitas Indonesia, Institut Teknologi Bandung, SMA Negeri 1 Bandung, SMK Telkom)",
      "degree": "Degree or Qualification (e.g. S1, S2, S3, D3, D4, SMA, SMK, High School)",
      "major": "Major or Field of Study (e.g. Computer Science, Teknik Informatika, IPA, IPS)",
      "start_year": 2018,
      "end_year": 2022,
      "gpa": "3.85 / 4.00 or 3.85 or 85.0"
    }
  ],
  "projects": ["Project or Work Title 1"],
  "certifications": ["Award or Certificate Title 1"],
  "portfolios": [
    {
      "title": "Portfolio or Work Project Name",
      "url": "https://github.com/username/project or Figma/Behance/Drive link",
      "description": "Short summary"
    }
  ],
  "references": [
    {
      "name": "Reference Person Name",
      "role": "Job Title",
      "company": "Company Name",
      "contact_info": "Phone or Email"
    }
  ]
}
RULES:
1. Extract ALL facts written in the text accurately.
2. Extract ALL work experiences listed in the CV. Do NOT limit or skip any company or job.
3. Parse education history with maximum precision. Extract full exact institution names for universities, institutes, polytechnics, and high schools (SMA/SMK/MAN/MA). Do NOT truncate institution names or merge them with city/location strings or job roles. Extract IPK/GPA values (e.g. "3.85", "3.42", "3.75 / 4.00") accurately into the "gpa" field. Classify degrees accurately into standard ATS terminology (Doktoral/S3, Magister/S2, Sarjana/S1, Diploma/D3/D4, SMA/SMK).
4. Extract ALL skills mentioned (technical, software, tools, competencies, administration).
5. Extract ALL projects, portfolio links (GitHub, Figma, Behance, Drive, Dribbble, personal websites), achievements, awards, and certifications.
6. Extract ALL work references/referees (name, job title, company, contact details).
7. Format phone numbers accurately into clean standard international format (e.g. "+62 815-8619-5333").
8. Do not hallucinate non-existent details. Output ONLY JSON without markdown wrappers.
"""

async def function_extract_via_groq(
  raw_text: str,
  api_key: Optional[str] = None,
  model: Optional[str] = None
) -> Dict[str, Any]:
  from app.services.text_pruner import prune_raw_text
  pruned_text = prune_raw_text(raw_text)

  key = api_key or DEFAULT_GROQ_API_KEY or os.getenv("GROQ_API_KEY") or os.getenv("LLM_API_KEY", "")
  if not key or not key.strip():
    raise ValueError("GROQ_API_KEY atau LLM_API_KEY belum dikonfigurasi di environment variables.")
  selected_model = model or DEFAULT_GROQ_MODEL

  headers = {
    "Authorization": f"Bearer {key}",
    "Content-Type": "application/json",
  }

  payload = {
    "model": selected_model,
    "messages": [
      {"role": "system", "content": SYSTEM_PROMPT},
      {"role": "user", "content": f"Extract candidate profile from this CV text:\n\n{pruned_text[:6000]}"}
    ],
    "temperature": 0.1,
    "response_format": {"type": "json_object"}
  }

  async with httpx.AsyncClient(timeout=30.0) as client:
    response = await client.post(GROQ_API_URL, headers=headers, json=payload)
    if response.status_code != 200:
      raise Exception(f"Groq API Error ({response.status_code}): {response.text}")

    data = response.json()
    content = data["choices"][0]["message"]["content"]
    
    # Parse JSON content
    parsed_json = json.loads(content)
    return parsed_json
