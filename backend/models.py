import uuid
import datetime
from sqlalchemy import Column, String, Boolean, Integer, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from database import Base

def generate_uuid():
    return str(uuid.uuid4())

def generate_share_id():
    return str(uuid.uuid4())[:8]

class Form(Base):
    __tablename__ = "forms"

    id = Column(String, primary_key=True, default=generate_uuid)
    title = Column(String, nullable=False, default="Untitled Form")
    description = Column(Text, nullable=True, default="")
    status = Column(String, nullable=False, default="draft")  # draft | published
    share_id = Column(String, unique=True, index=True, default=generate_share_id)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    questions = relationship("Question", back_populates="form", cascade="all, delete-orphan", order_by="Question.position")
    responses = relationship("FormResponse", back_populates="form", cascade="all, delete-orphan")


class Question(Base):
    __tablename__ = "questions"

    id = Column(String, primary_key=True, default=generate_uuid)
    form_id = Column(String, ForeignKey("forms.id", ondelete="CASCADE"), nullable=False)
    type = Column(String, nullable=False, default="short_text")
    title = Column(String, nullable=False, default="Untitled Question")
    description = Column(Text, nullable=True, default="")
    is_required = Column(Boolean, default=False)
    position = Column(Integer, default=0)
    settings = Column(Text, nullable=True, default="{}")  # Extra metadata (e.g. min/max rating, placeholder)

    form = relationship("Form", back_populates="questions")
    options = relationship("QuestionOption", back_populates="question", cascade="all, delete-orphan", order_by="QuestionOption.position")
    answers = relationship("Answer", back_populates="question", cascade="all, delete-orphan")


class QuestionOption(Base):
    __tablename__ = "question_options"

    id = Column(String, primary_key=True, default=generate_uuid)
    question_id = Column(String, ForeignKey("questions.id", ondelete="CASCADE"), nullable=False)
    label = Column(String, nullable=False, default="Option")
    position = Column(Integer, default=0)

    question = relationship("Question", back_populates="options")


class FormResponse(Base):
    __tablename__ = "form_responses"

    id = Column(String, primary_key=True, default=generate_uuid)
    form_id = Column(String, ForeignKey("forms.id", ondelete="CASCADE"), nullable=False)
    submitted_at = Column(DateTime, default=datetime.datetime.utcnow)

    form = relationship("Form", back_populates="responses")
    answers = relationship("Answer", back_populates="response", cascade="all, delete-orphan")


class Answer(Base):
    __tablename__ = "answers"

    id = Column(String, primary_key=True, default=generate_uuid)
    response_id = Column(String, ForeignKey("form_responses.id", ondelete="CASCADE"), nullable=False)
    question_id = Column(String, ForeignKey("questions.id", ondelete="CASCADE"), nullable=False)
    value = Column(Text, nullable=True, default="")

    response = relationship("FormResponse", back_populates="answers")
    question = relationship("Question", back_populates="answers")
