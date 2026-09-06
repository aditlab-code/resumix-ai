import re

# Phone digit length bounds
MIN_PHONE_DIGITS = 7
MAX_PHONE_DIGITS = 15


def normalize_phone_number(raw: str) -> str:
    """Normalize extracted phone string into standard format.
    Supports Indonesian Mobile (+62 8xx-xxxx-xxxx / 08xx), Landlines ((021) 8852574 / 021-xxxx), and International formats.
    """
    if not raw or not raw.strip():
        return ""

    cleaned = raw.strip()
    cleaned = re.sub(r"[^\d+()\- ]", "", cleaned).strip()
    digits_only = re.sub(r"\D", "", cleaned)

    if len(digits_only) < MIN_PHONE_DIGITS or len(digits_only) > MAX_PHONE_DIGITS:
        return ""

    # Indonesian Landline with area code e.g. (021) 8852574 or 021-8852574
    if (
        cleaned.startswith("(")
        or re.match(r"^02\d{1,2}\b", cleaned)
        or re.match(r"^\+62\s*2\d", cleaned)
    ):
        return cleaned

    # Indonesian Mobile: 08xx or +62 8xx or 628xx
    if digits_only.startswith("628"):
        d = digits_only[2:]
        return f"+62 {d[:3]}-{d[3:7]}-{d[7:]}" if len(d) > 7 else f"+62 {d[:3]}-{d[3:]}"
    elif digits_only.startswith("08"):
        d = digits_only[1:]
        return f"+62 {d[:3]}-{d[3:7]}-{d[7:]}" if len(d) > 7 else f"+62 {d[:3]}-{d[3:]}"

    return cleaned


def extract_phone_number(text: str) -> str:
    """Extract phone number (mobile or landline) from raw text using multi-pattern deterministic regex matching."""
    if not text or not text.strip():
        return ""

    # 1. Labeled patterns (e.g. Phone:, Hub:, Kontak:, HP:, Telp:)
    labeled_pattern = r"(?:phone|telepon|telp|tel|hp|handphone|mobile|cell|wa|whatsapp|kontak|hub:?)\s*[:.\-]?\s*(\+?\(?\d{2,4}\)?[\d\s\-.()]{5,18}\d)"
    m = re.search(labeled_pattern, text, re.IGNORECASE)
    if m:
        norm = normalize_phone_number(m.group(1))
        if norm:
            return norm

    # 2. Landline with area code e.g. (021) 8852574 or 021-xxxxxx
    landline_pattern = r"(?:\(\d{2,4}\)|\b02\d{1,2}[-\s]?)\s*[\d\s\-]{5,10}\d"
    m2 = re.search(landline_pattern, text)
    if m2:
        norm = normalize_phone_number(m2.group(0))
        if norm:
            return norm

    # 3. Mobile +62 8xx or +628xx or 08xx
    mobile_pattern = r"(?<![\d/.])(?:\+?62\s*|0)8[\d\s\-.()]{6,16}\d(?![\d/])"
    m3 = re.search(mobile_pattern, text)
    if m3:
        norm = normalize_phone_number(m3.group(0))
        if norm:
            return norm

    return ""
