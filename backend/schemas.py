from datetime import datetime
from typing import Any, Dict, List, Optional

from pydantic import BaseModel, ConfigDict, field_validator, model_validator

import validation


class ORMModel(BaseModel):
    """Base for schemas read straight off SQLAlchemy rows."""

    model_config = ConfigDict(from_attributes=True)


# --- Options ---
class QuestionOptionBase(BaseModel):
    label: str
    position: Optional[int] = 0


class QuestionOptionCreate(QuestionOptionBase):
    pass


class QuestionOptionSchema(ORMModel, QuestionOptionBase):
    id: str
    question_id: str


# --- Questions ---
class QuestionBase(BaseModel):
    type: str = "short_text"
    title: str = "Untitled Question"
    description: Optional[str] = ""
    is_required: Optional[bool] = False
    position: Optional[int] = 0
    settings: Dict[str, Any] = {}

    @field_validator("type")
    @classmethod
    def _known_type(cls, value: str) -> str:
        if value not in validation.QUESTION_TYPES:
            raise ValueError(f"Unsupported question type: {value}")
        return value

    @field_validator("settings", mode="before")
    @classmethod
    def _parse_settings(cls, value: Any) -> Dict[str, Any]:
        """The column is a JSON string; the API surface is an object."""
        return validation.parse_settings(value)


class QuestionCreate(QuestionBase):
    options: Optional[List[QuestionOptionCreate]] = []


class QuestionUpdate(BaseModel):
    type: Optional[str] = None
    title: Optional[str] = None
    description: Optional[str] = None
    is_required: Optional[bool] = None
    position: Optional[int] = None
    settings: Optional[Dict[str, Any]] = None
    options: Optional[List[QuestionOptionCreate]] = None

    @field_validator("type")
    @classmethod
    def _known_type(cls, value: Optional[str]) -> Optional[str]:
        if value is not None and value not in validation.QUESTION_TYPES:
            raise ValueError(f"Unsupported question type: {value}")
        return value


class QuestionSchema(ORMModel, QuestionBase):
    id: str
    form_id: str
    options: List[QuestionOptionSchema] = []


# --- Forms ---
class FormTheme(BaseModel):
    color: str = "#7c3aed"
    background: str = "#fcfcfc"
    font: str = "sans"


class FormEnding(BaseModel):
    title: str = "Thanks for completing this typeform"
    description: str = "Now create your own — it's free, easy & beautiful"
    button_label: str = "Create a typeform"
    show_button: bool = True


class FormBase(BaseModel):
    title: str = "Untitled Form"
    description: Optional[str] = ""


class FormCreate(FormBase):
    pass


class FormUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    status: Optional[str] = None
    theme: Optional[FormTheme] = None
    ending: Optional[FormEnding] = None

    @field_validator("status")
    @classmethod
    def _known_status(cls, value: Optional[str]) -> Optional[str]:
        if value is not None and value not in ("draft", "published"):
            raise ValueError("status must be 'draft' or 'published'")
        return value


class FormSchema(ORMModel, FormBase):
    id: str
    status: str
    share_id: str
    created_at: datetime
    updated_at: datetime
    response_count: int = 0
    theme: FormTheme = FormTheme()
    ending: FormEnding = FormEnding()

    @model_validator(mode="before")
    @classmethod
    def _from_row(cls, data: Any) -> Any:
        """Fold the flat theme_*/ending_* columns into nested objects."""
        if isinstance(data, dict):
            return data
        return {
            "id": data.id,
            "title": data.title,
            "description": data.description,
            "status": data.status,
            "share_id": data.share_id,
            "created_at": data.created_at,
            "updated_at": data.updated_at,
            "response_count": len(data.responses),
            "questions": data.questions,
            "theme": {
                "color": data.theme_color,
                "background": data.theme_background,
                "font": data.theme_font,
            },
            "ending": {
                "title": data.ending_title,
                "description": data.ending_description,
                "button_label": data.ending_button_label,
                "show_button": data.ending_show_button,
            },
        }


class FormDetailSchema(FormSchema):
    questions: List[QuestionSchema] = []


# --- Responses ---
class AnswerInput(BaseModel):
    question_id: str
    value: str = ""


class SubmitResponseSchema(BaseModel):
    answers: List[AnswerInput]


class AnswerSchema(ORMModel):
    id: str
    question_id: str
    value: str
    question_title: Optional[str] = None
    question_type: Optional[str] = None


class FormResponseSchema(ORMModel):
    id: str
    form_id: str
    submitted_at: datetime
    answers: List[AnswerSchema] = []


class SubmitResultSchema(BaseModel):
    message: str
    response_id: str


class FieldError(BaseModel):
    question_id: str
    code: str
    message: str


class ValidationErrorSchema(BaseModel):
    """422 body shape so the client can pin each message to its question."""

    detail: str = "Some answers need attention."
    errors: List[FieldError]


# --- Summary / stats ---
class OptionStat(BaseModel):
    label: str
    count: int
    percentage: float


class QuestionSummary(BaseModel):
    question_id: str
    question_title: str
    question_type: str
    total_answers: int
    options_stat: Optional[List[OptionStat]] = None
    yes_count: Optional[int] = None
    no_count: Optional[int] = None
    avg_rating: Optional[float] = None
    rating_max: Optional[int] = None
    rating_distribution: Optional[Dict[int, int]] = None
    avg_number: Optional[float] = None
    min_number: Optional[float] = None
    max_number: Optional[float] = None
    text_responses: Optional[List[str]] = None


class FormSummaryResponse(BaseModel):
    form_id: str
    form_title: str
    total_responses: int
    completion_rate: float = 0.0
    questions_summary: List[QuestionSummary]
