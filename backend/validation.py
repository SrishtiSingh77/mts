"""Answer validation rules. Authoritative source; mirrored by frontend/src/lib/validation.ts.

Served at GET /api/meta/validation-rules so the two sides can be diffed, not just trusted.
"""

import json
import re
from typing import Any, Dict, List, Optional, Tuple

EMAIL_PATTERN = r"^[^\s@]+@[^\s@]+\.[^\s@]+$"
EMAIL_RE = re.compile(EMAIL_PATTERN)

MAX_SHORT_TEXT_LENGTH = 500
MAX_LONG_TEXT_LENGTH = 5000

DEFAULT_RATING_MAX = 5
MIN_RATING_MAX = 3
MAX_RATING_MAX = 10

CHOICE_TYPES = ("multiple_choice", "dropdown")
TEXT_TYPES = ("short_text", "long_text", "email")

QUESTION_TYPES = (
    "short_text",
    "long_text",
    "multiple_choice",
    "dropdown",
    "email",
    "number",
    "yes_no",
    "rating",
)

# Error code -> str.format message template.
MESSAGES: Dict[str, str] = {
    "required": "Please answer this required question before continuing.",
    "email": "Please enter a valid email address (e.g. name@example.com).",
    "number": "Please enter a valid numeric value.",
    "choice": "Please pick one of the available options.",
    "yes_no": 'Please answer "Yes" or "No".',
    "rating": "Please pick a rating between {min} and {max}.",
    "too_long": "Answer is too long (maximum {max} characters).",
    "unknown_question": "This answer does not belong to the form being submitted.",
    "duplicate": "This question was answered more than once.",
}


def message(code: str, **params: Any) -> str:
    return MESSAGES[code].format(**params)


def parse_settings(raw: Optional[str]) -> Dict[str, Any]:
    """Decode the settings TEXT column into a dict; bad JSON degrades to {}."""
    if not raw:
        return {}
    if isinstance(raw, dict):
        return raw
    try:
        parsed = json.loads(raw)
    except (TypeError, ValueError):
        return {}
    return parsed if isinstance(parsed, dict) else {}


def serialize_settings(settings: Optional[Dict[str, Any]]) -> str:
    return json.dumps(settings or {})


def rating_max(settings: Dict[str, Any]) -> int:
    """Rating scale upper bound, clamped to [MIN_RATING_MAX, MAX_RATING_MAX]."""
    try:
        value = int(settings.get("rating_max", DEFAULT_RATING_MAX))
    except (TypeError, ValueError):
        return DEFAULT_RATING_MAX
    return max(MIN_RATING_MAX, min(MAX_RATING_MAX, value))


def max_text_length(question_type: str) -> int:
    return MAX_SHORT_TEXT_LENGTH if question_type == "short_text" else MAX_LONG_TEXT_LENGTH


def _error(question_id: str, code: str, **params: Any) -> Dict[str, str]:
    return {"question_id": question_id, "code": code, "message": message(code, **params)}


def validate_answer(question, value: str) -> Tuple[Optional[Dict[str, str]], str]:
    """Validate one answer; returns (error_or_none, normalized_value)."""
    value = (value or "").strip()
    settings = parse_settings(question.settings)

    if not value:
        if question.is_required:
            return _error(question.id, "required"), value
        return None, ""

    q_type = question.type

    if q_type in TEXT_TYPES or q_type == "number":
        limit = max_text_length(q_type)
        if len(value) > limit:
            return _error(question.id, "too_long", max=limit), value

    if q_type == "email":
        if not EMAIL_RE.match(value):
            return _error(question.id, "email"), value
        return None, value.lower()

    if q_type == "number":
        try:
            number = float(value)
        except ValueError:
            return _error(question.id, "number"), value
        # Store "42" rather than "42.0" so the results table reads cleanly.
        return None, str(int(number)) if number.is_integer() else str(number)

    if q_type in CHOICE_TYPES:
        labels = [opt.label for opt in question.options]
        if labels and value not in labels:
            return _error(question.id, "choice"), value
        return None, value

    if q_type == "yes_no":
        lowered = value.lower()
        if lowered not in ("yes", "no"):
            return _error(question.id, "yes_no"), value
        return None, "Yes" if lowered == "yes" else "No"

    if q_type == "rating":
        upper = rating_max(settings)
        try:
            rating = int(float(value))
        except ValueError:
            return _error(question.id, "rating", min=1, max=upper), value
        if rating < 1 or rating > upper:
            return _error(question.id, "rating", min=1, max=upper), value
        return None, str(rating)

    return None, value


def validate_submission(form, answers) -> Tuple[List[Dict[str, str]], List[Dict[str, str]]]:
    """Validate a submission; returns (errors, normalized_answers).

    Normalized answers only cover questions owned by this form, so a client cannot
    smuggle in answers belonging to another form.
    """
    questions_by_id = {q.id: q for q in form.questions}
    errors: List[Dict[str, str]] = []
    submitted: Dict[str, str] = {}

    for answer in answers:
        if answer.question_id not in questions_by_id:
            errors.append(_error(answer.question_id, "unknown_question"))
            continue
        if answer.question_id in submitted:
            errors.append(_error(answer.question_id, "duplicate"))
            continue
        submitted[answer.question_id] = answer.value

    normalized: List[Dict[str, str]] = []
    for question in form.questions:
        error, value = validate_answer(question, submitted.get(question.id, ""))
        if error:
            errors.append(error)
            continue
        normalized.append({"question_id": question.id, "value": value})

    return errors, normalized


def rules_spec() -> Dict[str, Any]:
    """Machine-readable rule table, served over the API for parity checks."""
    return {
        "question_types": list(QUESTION_TYPES),
        "messages": MESSAGES,
        "email_pattern": EMAIL_PATTERN,
        "max_short_text_length": MAX_SHORT_TEXT_LENGTH,
        "max_long_text_length": MAX_LONG_TEXT_LENGTH,
        "rating": {
            "default_max": DEFAULT_RATING_MAX,
            "min_max": MIN_RATING_MAX,
            "max_max": MAX_RATING_MAX,
        },
    }
