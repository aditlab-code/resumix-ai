from datetime import date
from typing import Literal
from pydantic import BaseModel, Field


class ExtractionEvidence(BaseModel):
    source_text: str | None = None
    confidence: float | None = Field(default=None, ge=0, le=1)


class Contact(BaseModel):
    email: str | None = Field(
        default=None,
        description="Candidate email address",
    )
    phone_number: str | None = None
    linkedin_url: str | None = None
    portfolio_url: str | None = None
    location: str | None = None


class Skill(BaseModel):
    name: str
    normalized_name: str | None = None
    category: str = "other"
    confidence: float | None = Field(default=1.0, ge=0, le=1)
    evidence: ExtractionEvidence | None = None


class WorkExperience(BaseModel):
    company: str | None = None
    role: str | None = None
    start_date: date | None = None
    end_date: date | None = None
    is_current: bool = False
    duration_months: int | None = Field(default=None, ge=0)
    description: str | None = None
    skills_used: list[str] = Field(default_factory=list)


class Education(BaseModel):
    institution: str | None = None
    degree: str | None = None
    major: str | None = None
    start_year: int | None = None
    end_year: int | None = None
    gpa: float | str | None = None



class Portfolio(BaseModel):
    title: str
    url: str | None = None
    description: str | None = None


class Reference(BaseModel):
    name: str
    role: str | None = None
    company: str | None = None
    contact_info: str | None = None


class CVExtraction(BaseModel):
    full_name: str | None = None
    contact: Contact = Field(default_factory=Contact)
    summary: str | None = None
    skills: list[Skill] = Field(default_factory=list)
    work_experience: list[WorkExperience] = Field(default_factory=list)
    education: list[Education] = Field(default_factory=list)
    certifications: list[str] = Field(default_factory=list)
    projects: list[str] = Field(default_factory=list)
    portfolios: list[Portfolio] = Field(default_factory=list)
    references: list[Reference] = Field(default_factory=list)
    total_experience_months: int | None = Field(default=None, ge=0)
    extraction_warnings: list[str] = Field(default_factory=list)


class ExtractionMetadata(BaseModel):
    parser: str = "pymupdf"
    ocr_used: bool = False
    page_count: int = 1
    extracted_characters: int = 0
    processing_time_ms: int = 0
    quality_score: float = 1.0


class ProcessCVRequest(BaseModel):
    document_id: str
    file_bytes_base64: str | None = None
    file_path: str | None = None


class JobFitScoreBreakdown(BaseModel):
    score_version: str = "v2"
    semantic_similarity: float
    semantic_weight: float = 0.45
    skill_semantic_similarity: float = 0.80
    skill_semantic_weight: float = 0.25
    role_semantic_similarity: float = 0.80
    role_semantic_weight: float = 0.20
    mandatory_skill_score: float
    mandatory_skill_weight: float = 0.30
    experience_score: float
    experience_weight: float = 0.20
    relevant_experience_months: int = 0
    preferred_skill_score: float
    preferred_skill_weight: float = 0.05
    mandatory_penalty_factor: float = 1.0
    final_score: float
    matched_skills: list[str]
    missing_mandatory_skills: list[str]
