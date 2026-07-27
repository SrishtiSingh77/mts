import csv
import io
from datetime import datetime
from typing import List, Optional

from sqlalchemy import func, or_
from sqlalchemy.orm import Session

import models
import schemas
import validation

# --- Forms ---


def get_forms(db: Session) -> List[models.Form]:
    return db.query(models.Form).order_by(models.Form.updated_at.desc()).all()


def get_form(db: Session, form_id: str) -> Optional[models.Form]:
    """Creator-side lookup: tolerates either the internal id or the share id."""
    return (
        db.query(models.Form)
        .filter(or_(models.Form.id == form_id, models.Form.share_id == form_id))
        .first()
    )


def get_published_form_by_share_id(db: Session, share_id: str) -> Optional[models.Form]:
    """Public lookup: share id only, and only while the form is published."""
    return (
        db.query(models.Form)
        .filter(models.Form.share_id == share_id, models.Form.status == "published")
        .first()
    )


def create_form(db: Session, form: schemas.FormCreate) -> models.Form:
    db_form = models.Form(
        title=form.title,
        description=form.description,
        creator_id=models.DEFAULT_CREATOR_ID,
    )
    db.add(db_form)
    db.commit()
    db.refresh(db_form)

    # One blank question so the builder never opens empty; the editor shows its
    # own placeholder rather than text the creator has to delete.
    db.add(
        models.Question(
            form_id=db_form.id,
            type="short_text",
            title="",
            description="",
            is_required=False,
            position=0,
        )
    )
    db.commit()
    db.refresh(db_form)
    return db_form


def update_form(db: Session, form_id: str, form_data: schemas.FormUpdate) -> Optional[models.Form]:
    db_form = get_form(db, form_id)
    if not db_form:
        return None

    if form_data.title is not None:
        db_form.title = form_data.title
    if form_data.description is not None:
        db_form.description = form_data.description
    if form_data.status is not None:
        db_form.status = form_data.status
    if form_data.theme is not None:
        db_form.theme_color = form_data.theme.color
        db_form.theme_background = form_data.theme.background
        db_form.theme_font = form_data.theme.font
    if form_data.welcome is not None:
        db_form.welcome_show = form_data.welcome.show
        db_form.welcome_title = form_data.welcome.title
        db_form.welcome_description = form_data.welcome.description
        db_form.welcome_button_label = form_data.welcome.button_label
        db_form.welcome_show_time = form_data.welcome.show_time
        db_form.welcome_show_submissions = form_data.welcome.show_submissions
    if form_data.ending is not None:
        db_form.ending_title = form_data.ending.title
        db_form.ending_description = form_data.ending.description
        db_form.ending_button_label = form_data.ending.button_label
        db_form.ending_show_button = form_data.ending.show_button
        db_form.ending_show_social = form_data.ending.show_social

    db.commit()
    db.refresh(db_form)
    return db_form


def duplicate_form(db: Session, form_id: str) -> Optional[models.Form]:
    db_form = get_form(db, form_id)
    if not db_form:
        return None

    # Copies always start as drafts and get their own share id.
    new_form = models.Form(
        creator_id=db_form.creator_id,
        title=f"{db_form.title} (Copy)",
        description=db_form.description,
        status="draft",
        theme_color=db_form.theme_color,
        theme_background=db_form.theme_background,
        theme_font=db_form.theme_font,
        welcome_show=db_form.welcome_show,
        welcome_title=db_form.welcome_title,
        welcome_description=db_form.welcome_description,
        welcome_button_label=db_form.welcome_button_label,
        welcome_show_time=db_form.welcome_show_time,
        welcome_show_submissions=db_form.welcome_show_submissions,
        ending_title=db_form.ending_title,
        ending_description=db_form.ending_description,
        ending_button_label=db_form.ending_button_label,
        ending_show_button=db_form.ending_show_button,
        ending_show_social=db_form.ending_show_social,
    )
    db.add(new_form)
    db.flush()

    id_map = {}
    for question in db_form.questions:
        new_question = models.Question(
            form_id=new_form.id,
            type=question.type,
            title=question.title,
            description=question.description,
            is_required=question.is_required,
            position=question.position,
            settings=question.settings,
        )
        db.add(new_question)
        db.flush()
        id_map[question.id] = new_question.id
        for option in question.options:
            db.add(
                models.QuestionOption(
                    question_id=new_question.id, label=option.label, position=option.position
                )
            )

    # Branching rules are copied last so every target can be remapped onto the
    # copy's own questions — otherwise they would point at the original form.
    for question in db_form.questions:
        for rule in question.logic:
            db.add(
                models.QuestionLogic(
                    question_id=id_map[question.id],
                    position=rule.position,
                    operator=rule.operator,
                    value=rule.value,
                    target_question_id=id_map.get(rule.target_question_id),
                )
            )

    db.commit()
    db.refresh(new_form)
    return new_form


def delete_form(db: Session, form_id: str) -> bool:
    db_form = get_form(db, form_id)
    if not db_form:
        return False
    db.delete(db_form)
    db.commit()
    return True


# --- Questions ---


def _replace_options(db: Session, question_id: str, options) -> None:
    db.query(models.QuestionOption).filter(
        models.QuestionOption.question_id == question_id
    ).delete(synchronize_session=False)
    for index, option in enumerate(options):
        db.add(models.QuestionOption(question_id=question_id, label=option.label, position=index))


def create_question(
    db: Session, form_id: str, q_data: schemas.QuestionCreate
) -> Optional[models.Question]:
    db_form = get_form(db, form_id)
    if not db_form:
        return None

    max_position = (
        db.query(func.max(models.Question.position))
        .filter(models.Question.form_id == db_form.id)
        .scalar()
    )
    next_position = 0 if max_position is None else max_position + 1

    new_question = models.Question(
        form_id=db_form.id,
        type=q_data.type,
        title=q_data.title,
        description=q_data.description or "",
        is_required=bool(q_data.is_required),
        position=next_position,
        settings=validation.serialize_settings(q_data.settings),
    )
    db.add(new_question)
    db.flush()

    if q_data.options:
        _replace_options(db, new_question.id, q_data.options)
    elif q_data.type in validation.CHOICE_TYPES:
        for index, label in enumerate(["Option 1", "Option 2", "Option 3"]):
            db.add(models.QuestionOption(question_id=new_question.id, label=label, position=index))

    db.commit()
    db.refresh(new_question)
    return new_question


def update_question(
    db: Session, question_id: str, q_data: schemas.QuestionUpdate
) -> Optional[models.Question]:
    db_question = db.query(models.Question).filter(models.Question.id == question_id).first()
    if not db_question:
        return None

    if q_data.type is not None:
        db_question.type = q_data.type
    if q_data.title is not None:
        db_question.title = q_data.title
    if q_data.description is not None:
        db_question.description = q_data.description
    if q_data.is_required is not None:
        db_question.is_required = q_data.is_required
    if q_data.position is not None:
        db_question.position = q_data.position
    if q_data.settings is not None:
        db_question.settings = validation.serialize_settings(q_data.settings)
    if q_data.options is not None:
        _replace_options(db, question_id, q_data.options)

    db.commit()
    db.refresh(db_question)
    return db_question


def replace_question_logic(
    db: Session, question_id: str, rules: List[schemas.LogicRuleCreate]
) -> Optional[models.Question]:
    """Swap a question's branching rules for a new set."""
    db_question = db.query(models.Question).filter(models.Question.id == question_id).first()
    if not db_question:
        return None

    # A target must be a question on the same form, or None (jump to ending).
    sibling_ids = {
        q.id
        for q in db.query(models.Question)
        .filter(models.Question.form_id == db_question.form_id)
        .all()
    }

    db.query(models.QuestionLogic).filter(
        models.QuestionLogic.question_id == question_id
    ).delete(synchronize_session=False)

    for index, rule in enumerate(rules):
        target = rule.target_question_id
        if target is not None and (target not in sibling_ids or target == question_id):
            target = None
        db.add(
            models.QuestionLogic(
                question_id=question_id,
                position=index,
                operator=rule.operator,
                value=rule.value,
                target_question_id=target,
            )
        )

    db.commit()
    db.refresh(db_question)
    return db_question


def duplicate_question(db: Session, question_id: str) -> Optional[models.Question]:
    db_question = db.query(models.Question).filter(models.Question.id == question_id).first()
    if not db_question:
        return None

    # Push everything after the source down one slot so the copy sits beside it.
    for later in (
        db.query(models.Question)
        .filter(
            models.Question.form_id == db_question.form_id,
            models.Question.position > db_question.position,
        )
        .all()
    ):
        later.position += 1

    new_question = models.Question(
        form_id=db_question.form_id,
        type=db_question.type,
        title=f"{db_question.title} (Copy)",
        description=db_question.description,
        is_required=db_question.is_required,
        position=db_question.position + 1,
        settings=db_question.settings,
    )
    db.add(new_question)
    db.flush()

    for option in db_question.options:
        db.add(
            models.QuestionOption(
                question_id=new_question.id, label=option.label, position=option.position
            )
        )

    for rule in db_question.logic:
        db.add(
            models.QuestionLogic(
                question_id=new_question.id,
                position=rule.position,
                operator=rule.operator,
                value=rule.value,
                target_question_id=rule.target_question_id,
            )
        )

    db.commit()
    db.refresh(new_question)
    return new_question


def delete_question(db: Session, question_id: str) -> bool:
    db_question = db.query(models.Question).filter(models.Question.id == question_id).first()
    if not db_question:
        return False

    form_id, position = db_question.form_id, db_question.position
    db.delete(db_question)
    db.flush()

    # Close the gap left behind so positions stay contiguous.
    for later in (
        db.query(models.Question)
        .filter(models.Question.form_id == form_id, models.Question.position > position)
        .all()
    ):
        later.position -= 1

    db.commit()
    return True


def reorder_questions(db: Session, form_id: str, ordered_question_ids: List[str]) -> bool:
    db_form = get_form(db, form_id)
    if not db_form:
        return False
    for index, question_id in enumerate(ordered_question_ids):
        db.query(models.Question).filter(
            models.Question.id == question_id, models.Question.form_id == db_form.id
        ).update({"position": index}, synchronize_session=False)
    db.commit()
    return True


# --- Responses ---


def record_view(db: Session, form: models.Form) -> None:
    """One row per public load, so Insights can separate views from starts."""
    db.add(models.FormView(form_id=form.id))
    db.commit()


def _replace_answers(db: Session, response: models.FormResponse, answers: List[dict]) -> None:
    db.query(models.Answer).filter(models.Answer.response_id == response.id).delete(
        synchronize_session=False
    )
    for answer in answers:
        db.add(
            models.Answer(
                response_id=response.id,
                question_id=answer["question_id"],
                value=answer["value"],
            )
        )


def _owned_response(
    db: Session, form: models.Form, response_id: Optional[str]
) -> Optional[models.FormResponse]:
    """Look up a response, refusing ids that belong to a different form."""
    if not response_id:
        return None
    return (
        db.query(models.FormResponse)
        .filter(models.FormResponse.id == response_id, models.FormResponse.form_id == form.id)
        .first()
    )


def save_partial_response(
    db: Session,
    form: models.Form,
    answers: List[dict],
    response_id: Optional[str] = None,
    last_question_id: Optional[str] = None,
) -> models.FormResponse:
    """Create or update an in-progress response. Answers are replaced wholesale."""
    now = datetime.utcnow()
    response = _owned_response(db, form, response_id)

    if response is None:
        response = models.FormResponse(
            form_id=form.id, is_complete=False, started_at=now, submitted_at=now
        )
        db.add(response)
        db.flush()

    # A completed response is never walked backwards by a late partial save.
    if not response.is_complete:
        response.last_question_id = last_question_id
        response.submitted_at = now
        _replace_answers(db, response, answers)

    db.commit()
    db.refresh(response)
    return response


def submit_response(
    db: Session,
    form: models.Form,
    answers: List[dict],
    response_id: Optional[str] = None,
    started_at: Optional[datetime] = None,
) -> models.FormResponse:
    """Persist an already-validated submission, completing a partial row if given."""
    now = datetime.utcnow()
    response = _owned_response(db, form, response_id)

    if response is None:
        response = models.FormResponse(form_id=form.id, started_at=started_at or now)
        db.add(response)
        db.flush()

    response.is_complete = True
    response.completed_at = now
    response.submitted_at = now
    response.last_question_id = None
    if response.started_at is None:
        response.started_at = started_at or now

    _replace_answers(db, response, answers)

    db.commit()
    db.refresh(response)
    return response


def delete_responses(db: Session, form_id: str, response_ids: List[str]) -> int:
    """Delete responses scoped to one form, via the ORM so answers cascade too."""
    db_form = get_form(db, form_id)
    if not db_form or not response_ids:
        return 0

    responses = (
        db.query(models.FormResponse)
        .filter(
            models.FormResponse.form_id == db_form.id,
            models.FormResponse.id.in_(response_ids),
        )
        .all()
    )
    for response in responses:
        db.delete(response)
    db.commit()
    return len(responses)


def get_form_responses(db: Session, form_id: str) -> List[dict]:
    db_form = get_form(db, form_id)
    if not db_form:
        return []

    responses = (
        db.query(models.FormResponse)
        .filter(models.FormResponse.form_id == db_form.id)
        .order_by(models.FormResponse.submitted_at.desc())
        .all()
    )

    return [
        {
            "id": response.id,
            "form_id": response.form_id,
            "submitted_at": response.submitted_at,
            "is_complete": response.is_complete,
            "started_at": response.started_at,
            "completed_at": response.completed_at,
            "last_question_id": response.last_question_id,
            "answers": [
                {
                    "id": answer.id,
                    "question_id": answer.question_id,
                    "value": answer.value or "",
                    "question_title": answer.question.title if answer.question else "Question",
                    "question_type": answer.question.type if answer.question else "short_text",
                }
                for answer in response.answers
            ],
        }
        for response in responses
    ]


def responses_to_csv(db: Session, form: models.Form) -> str:
    """One row per response, one column per question, in question order."""
    questions = list(form.questions)
    buffer = io.StringIO()
    writer = csv.writer(buffer)
    writer.writerow(
        ["Response ID", "Submitted At", "Status"] + [q.title or "Untitled question" for q in questions]
    )

    responses = (
        db.query(models.FormResponse)
        .filter(models.FormResponse.form_id == form.id)
        .order_by(models.FormResponse.submitted_at.desc())
        .all()
    )

    for response in responses:
        by_question = {answer.question_id: (answer.value or "") for answer in response.answers}
        writer.writerow(
            [
                response.id,
                response.submitted_at.isoformat(),
                "Completed" if response.is_complete else "Partial",
            ]
            + [by_question.get(q.id, "") for q in questions]
        )

    return buffer.getvalue()


def get_form_summary_stats(db: Session, form_id: str) -> Optional[dict]:
    form = get_form(db, form_id)
    if not form:
        return None

    questions = list(form.questions)
    responses = (
        db.query(models.FormResponse).filter(models.FormResponse.form_id == form.id).all()
    )
    completed = [r for r in responses if r.is_complete]
    partials = [r for r in responses if not r.is_complete]

    views = db.query(models.FormView).filter(models.FormView.form_id == form.id).count()
    # A "start" is anyone who saved any progress at all, complete or not.
    starts = len(responses)
    submissions = len(completed)

    # Per-question stats come from completed responses only; a half-filled form
    # would otherwise skew every average.
    completed_ids = {r.id for r in completed}
    questions_summary = []
    for question in questions:
        values = [
            answer.value
            for answer in db.query(models.Answer)
            .filter(models.Answer.question_id == question.id)
            .all()
            if answer.value and answer.response_id in completed_ids
        ]

        summary = {
            "question_id": question.id,
            "question_title": question.title,
            "question_type": question.type,
            "total_answers": len(values),
        }

        if question.type in validation.CHOICE_TYPES:
            summary["options_stat"] = _choice_stats(question, values)
        elif question.type == "yes_no":
            summary["yes_count"] = sum(1 for v in values if v.lower() in ("yes", "true"))
            summary["no_count"] = sum(1 for v in values if v.lower() in ("no", "false"))
        elif question.type == "rating":
            summary.update(_rating_stats(question, values))
        elif question.type == "number":
            summary.update(_number_stats(values))
        else:
            summary["text_responses"] = values

        questions_summary.append(summary)

    durations = [
        (r.completed_at - r.started_at).total_seconds()
        for r in completed
        if r.completed_at and r.started_at
    ]

    return {
        "form_id": form.id,
        "form_title": form.title,
        "total_responses": submissions,
        "completion_rate": round(submissions / starts * 100, 1) if starts else 0.0,
        "questions_summary": questions_summary,
        "views": views,
        "starts": starts,
        "submissions": submissions,
        "partials": len(partials),
        "avg_completion_seconds": round(sum(durations) / len(durations), 1) if durations else None,
        "drop_off": _drop_off(questions, partials, submissions),
    }


def _drop_off(questions, partials, submissions: int) -> List[dict]:
    """Per-question reach and abandonment, attributed to the furthest question reached."""
    abandoned_at = {}
    for response in partials:
        if response.last_question_id:
            abandoned_at[response.last_question_id] = abandoned_at.get(response.last_question_id, 0) + 1

    # Everyone who reached question N also reached every question before it.
    remaining = submissions + len(partials)
    rows = []
    for question in questions:
        dropped = abandoned_at.get(question.id, 0)
        rows.append(
            {
                "question_id": question.id,
                "question_title": question.title,
                "reached": remaining,
                "dropped": dropped,
                "drop_rate": round(dropped / remaining * 100, 1) if remaining else 0.0,
            }
        )
        remaining -= dropped

    return rows


def _choice_stats(question: models.Question, values: List[str]) -> List[dict]:
    counts = {option.label: 0 for option in question.options}
    for value in values:
        counts[value] = counts.get(value, 0) + 1
    total = len(values)
    return [
        {
            "label": label,
            "count": count,
            "percentage": round(count / total * 100, 1) if total else 0.0,
        }
        for label, count in counts.items()
    ]


def _rating_stats(question: models.Question, values: List[str]) -> dict:
    upper = validation.rating_max(validation.parse_settings(question.settings))
    distribution = {step: 0 for step in range(1, upper + 1)}
    ratings = []
    for value in values:
        try:
            rating = int(float(value))
        except ValueError:
            continue
        ratings.append(rating)
        distribution[rating] = distribution.get(rating, 0) + 1

    return {
        "rating_max": upper,
        "avg_rating": round(sum(ratings) / len(ratings), 1) if ratings else 0.0,
        "rating_distribution": distribution,
    }


def _number_stats(values: List[str]) -> dict:
    numbers = []
    for value in values:
        try:
            numbers.append(float(value))
        except ValueError:
            continue
    if not numbers:
        return {"avg_number": 0.0, "min_number": 0.0, "max_number": 0.0}
    return {
        "avg_number": round(sum(numbers) / len(numbers), 2),
        "min_number": min(numbers),
        "max_number": max(numbers),
    }
