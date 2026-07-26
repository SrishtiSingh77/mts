import os
from typing import List

from fastapi import Depends, FastAPI, HTTPException, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session

import crud
import models
import schemas
import validation
from database import engine, get_db
from seed import seed_database

models.Base.metadata.create_all(bind=engine)
seed_database()

app = FastAPI(title="Typeform Clone API", version="1.1.0")

# Comma-separated list of allowed origins; "*" in local dev.
ALLOWED_ORIGINS = [o.strip() for o in os.getenv("ALLOWED_ORIGINS", "*").split(",") if o.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def _form_or_404(db: Session, form_id: str) -> models.Form:
    form = crud.get_form(db, form_id)
    if not form:
        raise HTTPException(status_code=404, detail="Form not found")
    return form


@app.get("/")
def read_root():
    return {"message": "FormFlow API is running"}


@app.get("/api/meta/validation-rules")
def get_validation_rules():
    """Rule table the frontend mirror is checked against."""
    return validation.rules_spec()


# --- Forms ---


@app.get("/api/forms", response_model=List[schemas.FormSchema])
def get_forms(db: Session = Depends(get_db)):
    return crud.get_forms(db)


@app.post("/api/forms", response_model=schemas.FormDetailSchema, status_code=201)
def create_form(form: schemas.FormCreate, db: Session = Depends(get_db)):
    return crud.create_form(db, form)


@app.get("/api/forms/{form_id}", response_model=schemas.FormDetailSchema)
def get_form(form_id: str, db: Session = Depends(get_db)):
    return _form_or_404(db, form_id)


@app.put("/api/forms/{form_id}", response_model=schemas.FormDetailSchema)
def update_form(form_id: str, form_data: schemas.FormUpdate, db: Session = Depends(get_db)):
    updated = crud.update_form(db, form_id, form_data)
    if not updated:
        raise HTTPException(status_code=404, detail="Form not found")
    return updated


@app.post("/api/forms/{form_id}/duplicate", response_model=schemas.FormDetailSchema, status_code=201)
def duplicate_form(form_id: str, db: Session = Depends(get_db)):
    duplicated = crud.duplicate_form(db, form_id)
    if not duplicated:
        raise HTTPException(status_code=404, detail="Form not found")
    return duplicated


@app.delete("/api/forms/{form_id}")
def delete_form(form_id: str, db: Session = Depends(get_db)):
    if not crud.delete_form(db, form_id):
        raise HTTPException(status_code=404, detail="Form not found")
    return {"message": "Form deleted successfully"}


@app.post("/api/forms/{form_id}/publish", response_model=schemas.FormDetailSchema)
def toggle_publish_form(form_id: str, db: Session = Depends(get_db)):
    form = _form_or_404(db, form_id)
    if form.status != "published" and not form.questions:
        raise HTTPException(status_code=400, detail="Add at least one question before publishing.")
    new_status = "draft" if form.status == "published" else "published"
    return crud.update_form(db, form.id, schemas.FormUpdate(status=new_status))


# --- Public respondent flow (no auth) ---


@app.get("/api/forms/share/{share_id}", response_model=schemas.FormDetailSchema)
def get_public_form(share_id: str, db: Session = Depends(get_db)):
    form = crud.get_published_form_by_share_id(db, share_id)
    if not form:
        raise HTTPException(status_code=404, detail="This form is not available.")
    return form


@app.post("/api/forms/share/{share_id}/responses", response_model=schemas.SubmitResultSchema)
def submit_public_response(
    share_id: str, payload: schemas.SubmitResponseSchema, db: Session = Depends(get_db)
):
    form = crud.get_published_form_by_share_id(db, share_id)
    if not form:
        raise HTTPException(status_code=404, detail="This form is no longer accepting responses.")
    return _validate_and_store(db, form, payload)


@app.post("/api/forms/{form_id}/responses", response_model=schemas.SubmitResultSchema)
def submit_response(
    form_id: str, payload: schemas.SubmitResponseSchema, db: Session = Depends(get_db)
):
    """Creator-side submit, used by the results page's test-response generator."""
    return _validate_and_store(db, _form_or_404(db, form_id), payload)


def _validate_and_store(db: Session, form: models.Form, payload: schemas.SubmitResponseSchema):
    errors, normalized = validation.validate_submission(form, payload.answers)
    if errors:
        return JSONResponse(
            status_code=422,
            content={"detail": "Some answers need attention.", "errors": errors},
        )
    response = crud.submit_response(db, form, normalized)
    return {"message": "Response submitted successfully", "response_id": response.id}


# --- Questions ---


@app.post("/api/questions/form/{form_id}", response_model=schemas.QuestionSchema, status_code=201)
def create_question(form_id: str, q_data: schemas.QuestionCreate, db: Session = Depends(get_db)):
    question = crud.create_question(db, form_id, q_data)
    if not question:
        raise HTTPException(status_code=404, detail="Form not found")
    return question


@app.put("/api/questions/{question_id}", response_model=schemas.QuestionSchema)
def update_question(question_id: str, q_data: schemas.QuestionUpdate, db: Session = Depends(get_db)):
    updated = crud.update_question(db, question_id, q_data)
    if not updated:
        raise HTTPException(status_code=404, detail="Question not found")
    return updated


@app.post("/api/questions/{question_id}/duplicate", response_model=schemas.QuestionSchema, status_code=201)
def duplicate_question(question_id: str, db: Session = Depends(get_db)):
    duplicated = crud.duplicate_question(db, question_id)
    if not duplicated:
        raise HTTPException(status_code=404, detail="Question not found")
    return duplicated


@app.delete("/api/questions/{question_id}")
def delete_question(question_id: str, db: Session = Depends(get_db)):
    if not crud.delete_question(db, question_id):
        raise HTTPException(status_code=404, detail="Question not found")
    return {"message": "Question deleted successfully"}


@app.put("/api/questions/form/{form_id}/reorder")
def reorder_questions(form_id: str, payload: List[str], db: Session = Depends(get_db)):
    if not crud.reorder_questions(db, form_id, payload):
        raise HTTPException(status_code=404, detail="Form not found")
    return {"message": "Questions reordered successfully"}


# --- Results ---


@app.get("/api/forms/{form_id}/responses", response_model=List[schemas.FormResponseSchema])
def get_form_responses(form_id: str, db: Session = Depends(get_db)):
    _form_or_404(db, form_id)
    return crud.get_form_responses(db, form_id)


@app.post("/api/forms/{form_id}/responses/delete")
def delete_form_responses(form_id: str, response_ids: List[str], db: Session = Depends(get_db)):
    _form_or_404(db, form_id)
    deleted = crud.delete_responses(db, form_id, response_ids)
    return {"message": f"Deleted {deleted} response(s)", "deleted": deleted}


@app.get("/api/forms/{form_id}/responses.csv")
def export_form_responses_csv(form_id: str, db: Session = Depends(get_db)):
    form = _form_or_404(db, form_id)
    filename = f"{form.title.replace(' ', '-').lower()}-responses.csv"
    return Response(
        content=crud.responses_to_csv(db, form),
        media_type="text/csv",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )


@app.get("/api/forms/{form_id}/summary", response_model=schemas.FormSummaryResponse)
def get_form_summary(form_id: str, db: Session = Depends(get_db)):
    summary = crud.get_form_summary_stats(db, form_id)
    if not summary:
        raise HTTPException(status_code=404, detail="Form not found")
    return summary
