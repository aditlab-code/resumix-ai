SYNONYM_DICTIONARY: dict[str, str] = {
    "reactjs": "React",
    "react.js": "React",
    "react": "React",
    "node": "Node.js",
    "nodejs": "Node.js",
    "node.js": "Node.js",
    "postgres": "PostgreSQL",
    "postgre": "PostgreSQL",
    "postgresql": "PostgreSQL",
    "py": "Python",
    "python3": "Python",
    "ts": "TypeScript",
    "typescript": "TypeScript",
    "js": "JavaScript",
    "javascript": "JavaScript",
    "golang": "Go",
    "k8s": "Kubernetes",
    "docker": "Docker",
    "aws": "Amazon Web Services",
}


def normalize_skill_name(skill_name: str) -> str:
    """Deterministically normalize skill synonyms while preserving unknown explicit skills."""
    cleaned = skill_name.strip().lower()
    return SYNONYM_DICTIONARY.get(cleaned, skill_name.strip())
