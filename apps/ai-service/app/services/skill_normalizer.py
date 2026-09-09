import threading
from typing import Dict, List, Set, Union

SYNONYM_DICTIONARY: Dict[str, List[str]] = {
    # Finance, Accounting & Economics Domain
    "financial analysis": ["financial modeling", "corporate finance", "financial reporting", "budgeting", "forecasting"],
    "accounting": ["bookkeeping", "general ledger", "financial statements", "psak", "ifrs", "taxation", "pajak"],
    "auditing": ["internal audit", "external audit", "compliance audit", "financial audit"],
    "excel": ["microsoft excel", "ms excel", "spreadsheet", "vlookup", "pivot table"],

    # Human Resources & Personnel Domain
    "recruitment": ["talent acquisition", "headhunting", "sourcing", "interviewing", "recruiting"],
    "human resources": ["hr", "hrbp", "hr generalist", "personnel management", "manajemen sdm", "hris"],
    "payroll": ["payroll administration", "gaji", "penggajian", "bpjs", "pph 21"],
    "employee relations": ["industrial relations", "hubungan industrial", "employee engagement"],

    # Marketing, Communication & Sales Domain
    "digital marketing": ["performance marketing", "online marketing", "growth marketing", "social media marketing"],
    "seo": ["search engine optimization", "sem", "google ads"],
    "sales": ["business development", "account executive", "lead generation", "sales strategy", "b2b sales"],
    "crm": ["customer relationship management", "salesforce", "hubspot", "zoho"],
    "copywriting": ["content writing", "content marketing", "copywriter", "content strategy"],

    # Management, Operations & Administration Domain
    "project management": ["pmp", "project manager", "project planning", "agile", "scrum", "kanban"],
    "supply chain": ["logistics", "logistik", "procurement", "inventory management", "warehouse management"],
    "administration": ["administrative support", "office administration", "secretarial", "data entry", "arsip"],
    "customer service": ["customer support", "client service", "helpdesk", "call center"],

    # Legal & Compliance Domain
    "legal": ["corporate legal", "legal compliance", "contract drafting", "legal drafting", "hukum bisnis"],

    # Design & Creative Domain
    "ui/ux": ["user interface", "user experience", "figma", "wireframing", "product design"],
    "graphic design": ["photoshop", "illustrator", "coreldraw", "visual design", "desain grafis"],

    # Software & Backend Tech Domain
    "python": ["python 3", "py", "fastapi", "django", "flask", "pydantic"],
    "node.js": ["nodejs", "node", "express", "express.js", "nestjs", "ts-node"],
    "go": ["golang", "gin", "gorm", "go lang"],
    "java": ["spring", "spring boot", "j2ee", "hibernate"],
    "c#": [".net", "dotnet", ".net core", "asp.net"],
    "php": ["laravel", "symfony", "codeigniter"],
    "ruby": ["ruby on rails", "rails"],

    # Database & Data Domain
    "postgresql": ["postgres", "pg", "postgresql 15", "psql", "sql rdbms"],
    "mongodb": ["mongo", "nosql", "mongoose"],
    "mysql": ["mariadb", "my sql"],
    "redis": ["redis cache", "in-memory database"],
    "sql": ["structured query language", "database queries", "rdbms"],

    # DevOps, Infrastructure & Cloud Domain
    "docker": ["docker compose", "containerization", "podman", "docker container"],
    "kubernetes": ["k8s", "k3s", "helm"],
    "aws": ["amazon web services", "ec2", "s3", "lambda"],
    "gcp": ["google cloud", "google cloud platform", "gke"],
    "ci/cd": ["github actions", "gitlab ci", "jenkins", "circleci"],
    "linux": ["ubuntu", "debian", "centos", "bash", "shell"],

    # Frontend & Mobile Domain
    "react": ["react.js", "reactjs", "react native"],
    "next.js": ["nextjs", "next"],
    "vue": ["vue.js", "vuejs", "nuxt", "nuxtjs"],
    "angular": ["angularjs", "angular 2+"],
    "flutter": ["dart", "flutter framework"],
    "typescript": ["ts"],
    "javascript": ["js", "es6"],
    "css": ["tailwind", "tailwindcss", "sass", "scss", "bootstrap"],

    # Data & AI Domain
    "machine learning": ["ml", "scikit-learn", "sklearn"],
    "deep learning": ["dl", "pytorch", "tensorflow", "keras"],
    "data science": ["pandas", "numpy", "matplotlib", "seaborn"],
}


def normalize_skill_name(raw_name: str) -> str:
    """Normalize skill name to lowercase stripped string."""
    if not raw_name or not isinstance(raw_name, str):
        return ""
    return raw_name.strip().lower()


DYNAMIC_TAXONOMY_REGISTRY: Dict[str, List[str]] = {}
_taxonomy_lock = threading.Lock()


def register_custom_taxonomy(canonical_name: str, synonyms: List[str]) -> Dict[str, List[str]]:
    """Register or update a custom taxonomy entry at runtime."""
    key = normalize_skill_name(canonical_name)
    if not key:
        return DYNAMIC_TAXONOMY_REGISTRY

    clean_synonyms = [normalize_skill_name(s) for s in synonyms if s and isinstance(s, str)]
    clean_synonyms = [s for s in clean_synonyms if s]

    with _taxonomy_lock:
        DYNAMIC_TAXONOMY_REGISTRY[key] = clean_synonyms
    return DYNAMIC_TAXONOMY_REGISTRY


def get_all_taxonomies() -> Dict[str, List[str]]:
    """Get merged dictionary of static SYNONYM_DICTIONARY and dynamic custom taxonomies."""
    merged = {k: list(v) for k, v in SYNONYM_DICTIONARY.items()}
    with _taxonomy_lock:
        dynamic_snapshot = {k: list(v) for k, v in DYNAMIC_TAXONOMY_REGISTRY.items()}
    for k, v in dynamic_snapshot.items():
        if k in merged:
            merged[k] = list(set(merged[k] + v))
        else:
            merged[k] = v
    return merged


def get_synonym_set(skill_name: str) -> Set[str]:
    """Retrieve all related taxonomy synonyms for a skill name (bidirectional)."""
    target = normalize_skill_name(skill_name)
    if not target:
        return set()

    all_taxonomies = get_all_taxonomies()
    synonyms: Set[str] = {target}

    for key, aliases in all_taxonomies.items():
        key_lower = key.strip().lower()
        aliases_lower = [a.strip().lower() for a in aliases]

        if target == key_lower or target in aliases_lower:
            synonyms.add(key_lower)
            synonyms.update(aliases_lower)
        else:
            for alias in aliases_lower:
                if len(target) >= 3 and len(alias) >= 3 and (target in alias or alias in target):
                    synonyms.add(key_lower)
                    synonyms.update(aliases_lower)
                    break

    return synonyms



def match_single_skill(
    candidate_skills_lower: Set[str],
    required_skill: str,
    skill_equivalents: Dict[str, List[str]] | None = None,
) -> bool:
    """Check if a required skill or any of its LLM-extracted/dictionary equivalents match the candidate's skills."""
    if not required_skill or not required_skill.strip():
        return True

    target = normalize_skill_name(required_skill)
    if not target:
        return True

    # 1. Exact or Substring Direct Match
    if target in candidate_skills_lower:
        return True

    for c_skill in candidate_skills_lower:
        if target in c_skill or c_skill in target:
            return True

    # 2. Dictionary Taxonomy Synonyms Match
    target_synonyms = get_synonym_set(target)
    for syn in target_synonyms:
        if syn in candidate_skills_lower:
            return True
        for c_skill in candidate_skills_lower:
            if len(syn) >= 3 and len(c_skill) >= 3 and (syn in c_skill or c_skill in syn):
                return True

    # 3. Dynamic LLM Equivalents Match Fallback
    if skill_equivalents and isinstance(skill_equivalents, dict):
        equivalents_list: List[str] = []
        for req_key, eq_vals in skill_equivalents.items():
            req_key_lower = req_key.strip().lower()
            if req_key_lower == target or target in req_key_lower or req_key_lower in target:
                if isinstance(eq_vals, list):
                    equivalents_list.extend(eq_vals)

        for eq in equivalents_list:
            eq_lower = eq.strip().lower()
            if eq_lower in candidate_skills_lower:
                return True
            for c_skill in candidate_skills_lower:
                if len(eq_lower) >= 3 and len(c_skill) >= 3 and (eq_lower in c_skill or c_skill in eq_lower):
                    return True

    return False


def evaluate_mandatory_and_preferred_skills(
    candidate_skills: List[str],
    mandatory_skills: List[str],
    preferred_skills: List[str] | None = None,
    skill_equivalents: Dict[str, List[str]] | None = None,
) -> Dict[str, Union[List[str], float]]:
    """Evaluate matched vs missing mandatory & preferred skills using dynamic LLM & taxonomy dictionary equivalents."""
    normalized_candidate = {
        normalize_skill_name(s) for s in candidate_skills if s and isinstance(s, str)
    }
    normalized_candidate.discard("")

    matched_mandatory: List[str] = []
    missing_mandatory: List[str] = []
    matched_preferred: List[str] = []

    clean_mandatory = [s.strip() for s in mandatory_skills if s and isinstance(s, str)]
    clean_preferred = [s.strip() for s in (preferred_skills or []) if s and isinstance(s, str)]

    for req_skill in clean_mandatory:
        if match_single_skill(normalized_candidate, req_skill, skill_equivalents):
            matched_mandatory.append(req_skill)
        else:
            missing_mandatory.append(req_skill)

    for pref_skill in clean_preferred:
        if match_single_skill(normalized_candidate, pref_skill, skill_equivalents):
            matched_preferred.append(pref_skill)

    mandatory_score = (
        len(matched_mandatory) / len(clean_mandatory) if clean_mandatory else 1.0
    )
    preferred_score = (
        len(matched_preferred) / len(clean_preferred) if clean_preferred else 1.0
    )

    return {
        "mandatory_score": round(mandatory_score, 2),
        "preferred_score": round(preferred_score, 2),
        "matched_skills": matched_mandatory + matched_preferred,
        "missing_mandatory_skills": missing_mandatory,
    }

