import json
from sqlalchemy.orm import Session
from sqlalchemy import func
import models, schemas

# --- Forms CRUD ---

def get_forms(db: Session):
    forms = db.query(models.Form).order_by(models.Form.updated_at.desc()).all()
    result = []
    for form in forms:
        resp_count = db.query(models.FormResponse).filter(models.FormResponse.form_id == form.id).count()
        form_dict = schemas.FormSchema.model_validate(form).model_dump()
        form_dict['response_count'] = resp_count
        result.append(form_dict)
    return result

def get_form(db: Session, form_id: str):
    return db.query(models.Form).filter(models.Form.id == form_id).first()

def get_form_by_share_id(db: Session, share_id: str):
    return db.query(models.Form).filter(models.Form.share_id == share_id).first()

def create_form(db: Session, form: schemas.FormCreate):
    db_form = models.Form(
        title=form.title,
        description=form.description
    )
    db.add(db_form)
    db.commit()
    db.refresh(db_form)
    
    # Add a default first question for good UX
    default_q = models.Question(
        form_id=db_form.id,
        type="short_text",
        title="What is your name?",
        description="Please type your full name",
        is_required=True,
        position=0
    )
    db.add(default_q)
    db.commit()
    db.refresh(db_form)
    return db_form

def update_form(db: Session, form_id: str, form_data: schemas.FormUpdate):
    db_form = get_form(db, form_id)
    if not db_form:
        return None
    if form_data.title is not None:
        db_form.title = form_data.title
    if form_data.description is not None:
        db_form.description = form_data.description
    if form_data.status is not None:
        db_form.status = form_data.status
    db.commit()
    db.refresh(db_form)
    return db_form

def duplicate_form(db: Session, form_id: str):
    db_form = get_form(db, form_id)
    if not db_form:
        return None
    new_form = models.Form(
        title=f"{db_form.title} (Copy)",
        description=db_form.description,
        status="draft"
    )
    db.add(new_form)
    db.commit()
    db.refresh(new_form)

    # Duplicate questions and options
    for q in db_form.questions:
        new_q = models.Question(
            form_id=new_form.id,
            type=q.type,
            title=q.title,
            description=q.description,
            is_required=q.is_required,
            position=q.position,
            settings=q.settings
        )
        db.add(new_q)
        db.commit()
        db.refresh(new_q)
        for opt in q.options:
            new_opt = models.QuestionOption(
                question_id=new_q.id,
                label=opt.label,
                position=opt.position
            )
            db.add(new_opt)
        db.commit()

    db.refresh(new_form)
    return new_form

def delete_form(db: Session, form_id: str):
    db_form = get_form(db, form_id)
    if not db_form:
        return False
    db.delete(db_form)
    db.commit()
    return True

# --- Questions CRUD ---

def create_question(db: Session, form_id: str, q_data: schemas.QuestionCreate):
    max_pos = db.query(func.max(models.Question.position)).filter(models.Question.form_id == form_id).scalar()
    next_pos = (max_pos + 1) if max_pos is not None else 0

    new_q = models.Question(
        form_id=form_id,
        type=q_data.type,
        title=q_data.title,
        description=q_data.description or "",
        is_required=q_data.is_required or False,
        position=next_pos,
        settings=q_data.settings or "{}"
    )
    db.add(new_q)
    db.commit()
    db.refresh(new_q)

    # Add options if provided or default options if choice type
    if q_data.options and len(q_data.options) > 0:
        for idx, opt in enumerate(q_data.options):
            db_opt = models.QuestionOption(
                question_id=new_q.id,
                label=opt.label,
                position=idx
            )
            db.add(db_opt)
    elif q_data.type in ["multiple_choice", "dropdown"]:
        default_options = ["Option 1", "Option 2", "Option 3"]
        for idx, label in enumerate(default_options):
            db_opt = models.QuestionOption(
                question_id=new_q.id,
                label=label,
                position=idx
            )
            db.add(db_opt)
    db.commit()
    db.refresh(new_q)
    return new_q

def update_question(db: Session, question_id: str, q_data: schemas.QuestionUpdate):
    db_q = db.query(models.Question).filter(models.Question.id == question_id).first()
    if not db_q:
        return None

    if q_data.type is not None:
        db_q.type = q_data.type
    if q_data.title is not None:
        db_q.title = q_data.title
    if q_data.description is not None:
        db_q.description = q_data.description
    if q_data.is_required is not None:
        db_q.is_required = q_data.is_required
    if q_data.position is not None:
        db_q.position = q_data.position
    if q_data.settings is not None:
        db_q.settings = q_data.settings

    if q_data.options is not None:
        # Delete existing options and replace with new list
        db.query(models.QuestionOption).filter(models.QuestionOption.question_id == question_id).delete()
        for idx, opt in enumerate(q_data.options):
            db_opt = models.QuestionOption(
                question_id=question_id,
                label=opt.label,
                position=idx
            )
            db.add(db_opt)

    db.commit()
    db.refresh(db_q)
    return db_q

def duplicate_question(db: Session, question_id: str):
    db_q = db.query(models.Question).filter(models.Question.id == question_id).first()
    if not db_q:
        return None
    
    # Increment positions of subsequent questions
    subsequent = db.query(models.Question).filter(
        models.Question.form_id == db_q.form_id,
        models.Question.position > db_q.position
    ).all()
    for sq in subsequent:
        sq.position += 1
    
    new_q = models.Question(
        form_id=db_q.form_id,
        type=db_q.type,
        title=f"{db_q.title} (Copy)",
        description=db_q.description,
        is_required=db_q.is_required,
        position=db_q.position + 1,
        settings=db_q.settings
    )
    db.add(new_q)
    db.commit()
    db.refresh(new_q)

    for opt in db_q.options:
        new_opt = models.QuestionOption(
            question_id=new_q.id,
            label=opt.label,
            position=opt.position
        )
        db.add(new_opt)

    db.commit()
    db.refresh(new_q)
    return new_q

def delete_question(db: Session, question_id: str):
    db_q = db.query(models.Question).filter(models.Question.id == question_id).first()
    if not db_q:
        return False
    form_id = db_q.form_id
    pos = db_q.position
    db.delete(db_q)
    db.commit()

    # Re-normalize positions
    remaining = db.query(models.Question).filter(
        models.Question.form_id == form_id,
        models.Question.position > pos
    ).all()
    for q in remaining:
        q.position -= 1
    db.commit()
    return True

def reorder_questions(db: Session, form_id: str, ordered_question_ids: list):
    for idx, q_id in enumerate(ordered_question_ids):
        db.query(models.Question).filter(
            models.Question.id == q_id,
            models.Question.form_id == form_id
        ).update({"position": idx})
    db.commit()
    return True

# --- Response CRUD & Analytics ---

def submit_response(db: Session, form_id: str, payload: schemas.SubmitResponseSchema):
    db_response = models.FormResponse(form_id=form_id)
    db.add(db_response)
    db.commit()
    db.refresh(db_response)

    for ans in payload.answers:
        db_ans = models.Answer(
            response_id=db_response.id,
            question_id=ans.question_id,
            value=ans.value
        )
        db.add(db_ans)
    db.commit()
    db.refresh(db_response)
    return db_response

def get_form_responses(db: Session, form_id: str):
    responses = db.query(models.FormResponse).filter(models.FormResponse.form_id == form_id).order_by(models.FormResponse.submitted_at.desc()).all()
    result = []
    for resp in responses:
        answers_list = []
        for ans in resp.answers:
            q = ans.question
            answers_list.append({
                "id": ans.id,
                "question_id": ans.question_id,
                "value": ans.value,
                "question_title": q.title if q else "Question",
                "question_type": q.type if q else "short_text"
            })
        result.append({
            "id": resp.id,
            "form_id": resp.form_id,
            "submitted_at": resp.submitted_at,
            "answers": answers_list
        })
    return result

def get_form_summary_stats(db: Session, form_id: str):
    form = db.query(models.Form).filter(models.Form.id == form_id).first()
    if not form:
        return None

    total_responses = db.query(models.FormResponse).filter(models.FormResponse.form_id == form_id).count()

    questions_summary = []
    for q in form.questions:
        answers = db.query(models.Answer).filter(models.Answer.question_id == q.id).all()
        answer_values = [a.value for a in answers if a.value is not None and a.value != ""]
        total_ans_count = len(answer_values)

        q_summary = {
            "question_id": q.id,
            "question_title": q.title,
            "question_type": q.type,
            "total_answers": total_ans_count,
            "options_stat": None,
            "yes_count": None,
            "no_count": None,
            "avg_rating": None,
            "rating_distribution": None,
            "avg_number": None,
            "min_number": None,
            "max_number": None,
            "text_responses": None
        }

        if q.type in ["multiple_choice", "dropdown"]:
            option_counts = {}
            for opt in q.options:
                option_counts[opt.label] = 0
            for val in answer_values:
                if val in option_counts:
                    option_counts[val] += 1
                else:
                    option_counts[val] = 1
            
            stats_list = []
            for label, count in option_counts.items():
                pct = (count / total_ans_count * 100) if total_ans_count > 0 else 0
                stats_list.append({
                    "label": label,
                    "count": count,
                    "percentage": round(pct, 1)
                })
            q_summary["options_stat"] = stats_list

        elif q.type == "yes_no":
            yes_c = sum(1 for v in answer_values if v.lower() in ["yes", "true"])
            no_c = sum(1 for v in answer_values if v.lower() in ["no", "false"])
            q_summary["yes_count"] = yes_c
            q_summary["no_count"] = no_c

        elif q.type == "rating":
            ratings = []
            distribution = {1: 0, 2: 0, 3: 0, 4: 0, 5: 0}
            for v in answer_values:
                try:
                    r_val = int(v)
                    ratings.append(r_val)
                    if r_val in distribution:
                        distribution[r_val] += 1
                    else:
                        distribution[r_val] = 1
                except ValueError:
                    pass
            q_summary["avg_rating"] = round(sum(ratings) / len(ratings), 1) if ratings else 0.0
            q_summary["rating_distribution"] = distribution

        elif q.type == "number":
            nums = []
            for v in answer_values:
                try:
                    nums.append(float(v))
                except ValueError:
                    pass
            if nums:
                q_summary["avg_number"] = round(sum(nums) / len(nums), 2)
                q_summary["min_number"] = min(nums)
                q_summary["max_number"] = max(nums)
            else:
                q_summary["avg_number"] = 0.0
                q_summary["min_number"] = 0.0
                q_summary["max_number"] = 0.0

        else: # short_text, long_text, email
            q_summary["text_responses"] = answer_values

        questions_summary.append(q_summary)

    return {
        "form_id": form.id,
        "form_title": form.title,
        "total_responses": total_responses,
        "questions_summary": questions_summary
    }
