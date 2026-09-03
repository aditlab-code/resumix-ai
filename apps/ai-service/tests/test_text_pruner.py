import pytest
from app.services.text_pruner import (
    strip_boilerplate_noise,
    extract_core_qualifications_sections,
    prune_raw_text,
)


def test_strip_boilerplate_noise():
    raw_sample = """
    Home > Careers > ML Engineer
    
    ML Engineer at AME Group
    
    Technical Skills (Required)
    - Python, PyTorch, LLMs, RAG, Docker
    
    What We Offer
    - Competitive salary and central office near public transport
    
    How To Apply
    - Send CV to ame@amegroup.com
    
    Bukalapak is an equal opportunity employer. Our hiring committee considers all applicants based on race, color, religion, sex, sexual orientation. #BukalapakForAll
    """

    cleaned = strip_boilerplate_noise(raw_sample)

    assert "Home > Careers" not in cleaned
    assert "What We Offer" not in cleaned
    assert "How To Apply" not in cleaned
    assert "equal opportunity employer" not in cleaned
    assert "Python, PyTorch, LLMs, RAG, Docker" in cleaned


def test_extract_core_qualifications_sections():
    sample_text = """
    Job Description
    Software Engineer with 3-5 years working in full-stack AI environment.
    
    Technical Skills
    Strong proficiency in Python, PyTorch, LangChain, LLMs.
    
    Key Responsibilities
    Design and implement RAG architectures and document ingestion pipelines.
    """

    extracted = extract_core_qualifications_sections(sample_text)
    assert "Python, PyTorch, LangChain, LLMs" in extracted
    assert "RAG architectures" in extracted


def test_prune_raw_text_end_to_end():
    sample_text = """
    Bukalapak's mission is to provide A Fair Economy For All.
    We're looking for a Junior AI Engineer.
    
    What You'll Do
    Design, develop, and deploy AI solutions and RAG pipelines.
    
    What We're Looking For
    1-3 years of experience in AI Engineering.
    Experience with LangChain, OpenAI APIs, Claude.
    
    Why Join Us?
    Opportunity to work at intersection of AI and business.
    Bukalapak is an equal opportunity employer. #BukalapakForAll
    """

    pruned = prune_raw_text(sample_text)

    assert "equal opportunity employer" not in pruned
    assert "#BukalapakForAll" not in pruned
    assert "Junior AI Engineer" in pruned
    assert "LangChain, OpenAI APIs, Claude" in pruned
