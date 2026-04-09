import html
import re


DEFAULT_MAX_INPUT_CHARS = 2000
DEFAULT_MAX_OUTPUT_CHARS = 8000

BLOCKED_PROMPT_PATTERNS = (
    "ignore previous",
    "ignore all previous",
    "system:",
    "assistant:",
    "developer:",
    "you are chatgpt",
)


def validate_user_input_for_prompt(raw_text: str, max_chars: int = DEFAULT_MAX_INPUT_CHARS) -> str:
    """Normalize and validate untrusted user text before prompt insertion."""
    text = (raw_text or "").strip()

    if not text:
        raise ValueError("Input text is empty")

    if len(text) > max_chars:
        raise ValueError("Input too long")

    lowered = text.lower()
    if any(pattern in lowered for pattern in BLOCKED_PROMPT_PATTERNS):
        raise ValueError("Invalid input detected")

    # Keep input as data, not executable content.
    normalized = re.sub(r"\s+", " ", text)
    return html.escape(normalized)


def sanitize_text_for_display(raw_text: str, max_chars: int = DEFAULT_MAX_OUTPUT_CHARS) -> str:
    """Constrain and escape model output before returning to clients."""
    text = (raw_text or "").strip()
    if not text:
        raise ValueError("Invalid AI output")

    if len(text) > max_chars:
        text = text[:max_chars]

    return html.escape(text)