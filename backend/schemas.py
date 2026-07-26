from pydantic import BaseModel, Field
from typing import List, Optional, Any, Dict
from datetime import datetime

# --- Option Schemas ---
class QuestionOptionBase(BaseModel):
    label: str
    position: Optional[int] = 0

class QuestionOptionCreate(QuestionOptionBase):
    pass

class QuestionOptionSchema(QuestionOptionBase):
    id: str
    question_id: str

    class Config:
        orm_mode = True
        from_attributes = True


# --- Question Schemas ---
class QuestionBase(BaseModel):
    type: str = "short_text"
    title: str = "Untitled Question"
    description: Optional[str] = ""
    is_required: Optional[bool] = False
    position: Optional[int] = 0
    settings: Optional[str] = "{}"

class QuestionCreate(QuestionBase):
    options: Optional[List[QuestionOptionCreate]] = []

class QuestionUpdate(BaseModel):
    type: Optional[str] = None
    title: Optional[str] = None
    description: Optional[str] = None
    is_required: Optional[bool] = None
    position: Optional[int] = None
    settings: Optional[str] = None
    options: Optional[List[QuestionOptionCreate]] = None

class QuestionSchema(QuestionBase):
    id: str
    form_id: str
    options: List[QuestionOptionSchema] = []

    class Config:
        orm_mode = True
        from_attributes = True


# --- Form Schemas ---
class FormBase(BaseModel):
    title: str = "Untitled Form"
    description: Optional[str] = ""

class FormCreate(FormBase):
    pass

class FormUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    status: Optional[str] = None

class FormSchema(FormBase):
    id: str
    status: str
    share_id: str
    created_at: datetime
    updated_at: datetime
    response_count: Optional[int] = 0

    class Config:
        orm_mode = True
        from_attributes = True

class FormDetailSchema(FormSchema):
    questions: List[QuestionSchema] = []

    class Config:
        orm_mode = True
        from_attributes = True


# --- Response Schemas ---
class AnswerInput(BaseModel):
    question_id: str
    value: str

class SubmitResponseSchema(BaseModel):
    answers: List[AnswerInput]

class AnswerSchema(BaseModel):
    id: str
    question_id: str
    value: str
    question_title: Optional[str] = None
    question_type: Optional[str] = None

    class Config:
        orm_mode = True
        from_attributes = True

class FormResponseSchema(BaseModel):
    id: str
    form_id: str
    submitted_at: datetime
    answers: List[AnswerSchema] = []

    class Config:
        orm_mode = True
        from_attributes = True


# --- Summary / Stats Schemas ---
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
    rating_distribution: Optional[Dict[int, int]] = None
    avg_number: Optional[float] = None
    min_number: Optional[float] = None
    max_number: Optional[float] = None
    text_responses: Optional[List[str]] = None

class FormSummaryResponse(BaseModel):
    form_id: str
    form_title: str
    total_responses: int
    questions_summary: List[QuestionSummary]
