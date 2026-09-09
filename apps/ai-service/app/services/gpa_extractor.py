import re
from typing import Optional, Union, Any

# Patterns to find IPK / GPA in Indonesian & English CV text
GPA_KEYWORD_PATTERNS = [
    # IPK 3.85 / 4.00 or IPK 3,85 / 4,00 or IPK: 3.85
    r'\b(?:IPK|GPA|Grade\s*Point\s*Average|Indeks\s*Prestasi\s*Kumulatif)\s*[:\-\s]*([0-4][.,]\d{1,2})\s*(?:\/\s*4[.,]00)?\b',
    # 3.85 / 4.00 or 3,85 / 4,00
    r'\b([0-4][.,]\d{1,2})\s*\/\s*4[.,]00\b',
    # IPK 3.8 or IPK 3,8
    r'\b(?:IPK|GPA)\s*[:\-\s]*([0-4][.,]\d{1,2})\b',
]


def normalize_gpa_value(val: Any) -> Optional[str]:
    """Normalize GPA/IPK input (float, int, or str) to a clean string representation.
    Converts decimal commas ',' to dots '.', extracts base score from scale (e.g. '3.85 / 4.00' -> '3.85'),
    and ensures valid 0.0 - 4.0 or 0 - 100 range.
    """
    if val is None:
        return None

    if isinstance(val, (int, float)):
        num = float(val)
        if 0.0 <= num <= 4.0:
            return f"{num:.2f}".rstrip('0').rstrip('.') if num % 1 != 0 else f"{num:.1f}"
        elif 0.0 <= num <= 100.0:
            return f"{num:.1f}"
        return str(val)

    s_val = str(val).strip()
    if not s_val:
        return None

    # Replace Indonesian decimal comma with dot (e.g. '3,85' -> '3.85', '3,75 / 4,00' -> '3.75 / 4.00')
    s_val_dot = re.sub(r'(\d),(\d)', r'\1.\2', s_val)

    # Check if string matches scale pattern like '3.85 / 4.00' or '3.85/4.00'
    scale_match = re.search(r'([0-4]\.\d{1,2})\s*\/\s*4(?:\.00)?', s_val_dot)
    if scale_match:
        return scale_match.group(1)

    # Search for numeric decimal value in string
    num_match = re.search(r'\b([0-4]\.\d{1,2}|[0-3]\.\d|4\.0)\b', s_val_dot)
    if num_match:
        num_str = num_match.group(1)
        try:
            num = float(num_str)
            if 0.0 <= num <= 4.0:
                return num_str
        except ValueError:
            pass

    # If it's a numeric percentage score like 85.5 or 85
    pct_match = re.search(r'\b([5-9]\d(?:\.\d{1,2})?|100(?:\.00)?)\b', s_val_dot)
    if pct_match:
        return pct_match.group(1)

    return s_val_dot


def extract_gpa_from_text(text: str) -> Optional[str]:
    """Extract GPA/IPK value from raw text using deterministic regex patterns."""
    if not text or not text.strip():
        return None

    for pattern in GPA_KEYWORD_PATTERNS:
        match = re.search(pattern, text, re.IGNORECASE)
        if match:
            raw_gpa = match.group(1)
            normalized = normalize_gpa_value(raw_gpa)
            if normalized:
                return normalized

    return None
