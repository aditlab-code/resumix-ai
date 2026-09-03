import pytest
from app.services.job_extractor import extract_job_qualifications_via_groq


def test_job_extraction_empty_text():
    with pytest.raises(ValueError, match="Teks deskripsi lowongan kerja tidak boleh kosong."):
        import asyncio
        asyncio.run(extract_job_qualifications_via_groq(""))
