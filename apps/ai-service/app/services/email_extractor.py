import re
from typing import Optional, List

# Patterns matching placeholder or dummy email addresses to ignore
DUMMY_EMAIL_DOMAINS = {
    "example.com",
    "example.org",
    "example.net",
    "domain.com",
    "email.com",
    "yourdomain.com",
}

DUMMY_EMAIL_PREFIXES = {
    "user",
    "email",
    "name",
    "yourname",
    "username",
    "sample",
    "test",
    "john.doe",
}

# Regex to match standard email addresses in text
EMAIL_REGEX = re.compile(
    r'\b[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}\b',
    re.IGNORECASE
)


def is_valid_candidate_email(email: str) -> bool:
    """Check if an extracted email string is valid and not a placeholder/dummy email."""
    if not email or not isinstance(email, str):
        return False

    cleaned = email.strip().lower().rstrip('.')
    if '@' not in cleaned:
        return False

    local_part, domain = cleaned.split('@', 1)

    if domain in DUMMY_EMAIL_DOMAINS:
        return False

    if local_part in DUMMY_EMAIL_PREFIXES and domain in DUMMY_EMAIL_DOMAINS:
        return False

    # Check for suspicious placeholder prefix patterns like email@... or user@... with generic domains
    if local_part in {"user", "email", "name", "your.name", "yourname"} and ("example" in domain or "domain" in domain):
        return False

    return True


def extract_email(text: str) -> Optional[str]:
    """Extract the first valid, non-placeholder email address from raw text using deterministic regex."""
    if not text or not text.strip():
        return None

    # Replace obfuscations like ' [at] ' or ' (at) ' with '@'
    normalized_text = re.sub(r'\s*[\(\[]\s*at\s*[\)\]]\s*', '@', text, flags=re.IGNORECASE)
    normalized_text = re.sub(r'\s*[\(\[]\s*dot\s*[\)\]]\s*', '.', normalized_text, flags=re.IGNORECASE)

    matches: List[str] = EMAIL_REGEX.findall(normalized_text)
    for match in matches:
        cleaned = match.strip().rstrip('.')
        if is_valid_candidate_email(cleaned):
            return cleaned

    return None
