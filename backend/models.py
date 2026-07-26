import datetime
import uuid

from sqlalchemy import Boolean, Column, DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.orm import relationship

from database import Base

DEFAULT_CREATOR_ID = "creator-default"


def generate_uuid():
    return str(uuid.uuid4())


def generate_share_id():
    return str(uuid.uuid4())[:8]


class User(Base):
    """Form creator. Auth is out of scope, so every form belongs to one seeded creator."""

    __tablename__ = "users"

    id = Column(String, primary_key=True, default=generate_uuid)
    name = Column(String, nullable=False, default="Srishti Singh")
    email = Column(String, unique=True, nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    forms = relationship("Form", back_populates="creator")


class Form(Base):
    __tablename__ = "forms"

    id = Column(String, primary_key=True, default=generate_uuid)
    creator_id = Column(
        String,
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        default=DEFAULT_CREATOR_ID,
        index=True,
    )
    title = Column(String, nullable=False, default="Untitled Form")
    description = Column(Text, nullable=True, default="")
    status = Column(String, nullable=False, default="draft")  # draft | published
    share_id = Column(String, unique=True, index=True, default=generate_share_id)

    # Welcome screen copy. Blank title/description fall back to the form's own.
    welcome_show = Column(Boolean, nullable=False, default=True)
    welcome_title = Column(String, nullable=False, default="")
    welcome_description = Column(Text, nullable=False, default="")
    welcome_button_label = Column(String, nullable=False, default="Start")
    welcome_show_time = Column(Boolean, nullable=False, default=True)
    welcome_show_submissions = Column(Boolean, nullable=False, default=False)

    # Theme applied to the respondent flow; defaults match Typeform's basic theme.
    theme_color = Column(String, nullable=False, default="#262627")
    theme_background = Column(String, nullable=False, default="#f9f9f9")
    theme_font = Column(String, nullable=False, default="sans")  # sans | serif | mono

    # Thank-you screen copy.
    ending_title = Column(String, nullable=False, default="Thanks for completing this typeform")
    ending_description = Column(
        Text, nullable=False, default="Now create your own — it's free, easy & beautiful"
    )
    ending_button_label = Column(String, nullable=False, default="Create a typeform")
    ending_show_button = Column(Boolean, nullable=False, default=True)
    ending_show_social = Column(Boolean, nullable=False, default=True)

    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    creator = relationship("User", back_populates="forms")
    questions = relationship(
        "Question",
        back_populates="form",
        cascade="all, delete-orphan",
        order_by="Question.position",
    )
    responses = relationship("FormResponse", back_populates="form", cascade="all, delete-orphan")


class Question(Base):
    __tablename__ = "questions"

    id = Column(String, primary_key=True, default=generate_uuid)
    form_id = Column(String, ForeignKey("forms.id", ondelete="CASCADE"), nullable=False, index=True)
    type = Column(String, nullable=False, default="short_text")
    title = Column(String, nullable=False, default="Untitled Question")
    description = Column(Text, nullable=True, default="")
    is_required = Column(Boolean, default=False)
    position = Column(Integer, default=0)
    settings = Column(Text, nullable=True, default="{}")  # JSON per-type extras, e.g. {"rating_max": 5}

    form = relationship("Form", back_populates="questions")
    options = relationship(
        "QuestionOption",
        back_populates="question",
        cascade="all, delete-orphan",
        order_by="QuestionOption.position",
    )
    answers = relationship("Answer", back_populates="question", cascade="all, delete-orphan")


class QuestionOption(Base):
    __tablename__ = "question_options"

    id = Column(String, primary_key=True, default=generate_uuid)
    question_id = Column(
        String, ForeignKey("questions.id", ondelete="CASCADE"), nullable=False, index=True
    )
    label = Column(String, nullable=False, default="Option")
    position = Column(Integer, default=0)

    question = relationship("Question", back_populates="options")


class FormResponse(Base):
    __tablename__ = "form_responses"

    id = Column(String, primary_key=True, default=generate_uuid)
    form_id = Column(String, ForeignKey("forms.id", ondelete="CASCADE"), nullable=False, index=True)
    submitted_at = Column(DateTime, default=datetime.datetime.utcnow)

    form = relationship("Form", back_populates="responses")
    answers = relationship("Answer", back_populates="response", cascade="all, delete-orphan")


class Answer(Base):
    __tablename__ = "answers"

    id = Column(String, primary_key=True, default=generate_uuid)
    response_id = Column(
        String, ForeignKey("form_responses.id", ondelete="CASCADE"), nullable=False, index=True
    )
    question_id = Column(
        String, ForeignKey("questions.id", ondelete="CASCADE"), nullable=False, index=True
    )
    value = Column(Text, nullable=True, default="")

    response = relationship("FormResponse", back_populates="answers")
    question = relationship("Question", back_populates="answers")
