from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List
import models, schemas, crud
from database import engine, get_db
from seed import seed_database

# Initialize DB tables & seed
models.Base.metadata.create_all(bind=engine)
seed_database()

app = FastAPI(title="Typeform Clone API", version="1.0.0")

# CORS setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"message": "FormFlow API is running"}

# --- Form Endpoints ---

@app.get("/api/forms", response_model=List[schemas.FormSchema])
def get_forms(db: Session = Depends(get_db)):
    return crud.get_forms(db)

@app.post("/api/forms", response_model=schemas.FormDetailSchema)
def create_form(form: schemas.FormCreate, db: Session = Depends(get_db)):
    return crud.create_form(db, form)

@app.get("/api/forms/{form_id}", response_model=schemas.FormDetailSchema)
def get_form(form_id: str, db: Session = Depends(get_db)):
    db_form = crud.get_form(db, form_id)
    if not db_form:
        raise HTTPException(status_code=404, detail="Form not found")
    return db_form

@app.put("/api/forms/{form_id}", response_model=schemas.FormDetailSchema)
def update_form(form_id: str, form_data: schemas.FormUpdate, db: Session = Depends(get_db)):
    updated = crud.update_form(db, form_id, form_data)
    if not updated:
        raise HTTPException(status_code=404, detail="Form not found")
    return updated

@app.post("/api/forms/{form_id}/duplicate", response_model=schemas.FormDetailSchema)
def duplicate_form(form_id: str, db: Session = Depends(get_db)):
    dup = crud.duplicate_form(db, form_id)
    if not dup:
        raise HTTPException(status_code=404, detail="Form not found")
    return dup

@app.delete("/api/forms/{form_id}")
def delete_form(form_id: str, db: Session = Depends(get_db)):
    success = crud.delete_form(db, form_id)
    if not success:
        raise HTTPException(status_code=404, detail="Form not found")
    return {"message": "Form deleted successfully"}

@app.post("/api/forms/{form_id}/publish", response_model=schemas.FormDetailSchema)
def toggle_publish_form(form_id: str, db: Session = Depends(get_db)):
    db_form = crud.get_form(db, form_id)
    if not db_form:
        raise HTTPException(status_code=404, detail="Form not found")
    new_status = "published" if db_form.status != "published" else "draft"
    return crud.update_form(db, form_id, schemas.FormUpdate(status=new_status))

# --- Public Form Respondent Flow ---

@app.get("/api/forms/share/{share_id}", response_model=schemas.FormDetailSchema)
def get_form_by_share_id(share_id: str, db: Session = Depends(get_db)):
    db_form = crud.get_form_by_share_id(db, share_id)
    if not db_form:
        raise HTTPException(status_code=404, detail="Public form not found")
    return db_form

@app.post("/api/forms/{form_id}/responses")
def submit_form_response(form_id: str, payload: schemas.SubmitResponseSchema, db: Session = Depends(get_db)):
    db_form = crud.get_form(db, form_id)
    if not db_form:
        raise HTTPException(status_code=404, detail="Form not found")
    resp = crud.submit_response(db, form_id, payload)
    return {"message": "Response submitted successfully", "response_id": resp.id}

@app.post("/api/responses/delete")
def delete_responses(response_ids: List[str], db: Session = Depends(get_db)):
    crud.delete_responses(db, response_ids)
    return {"message": "Responses deleted successfully"}

# --- Questions Endpoints ---

@app.post("/api/questions/form/{form_id}", response_model=schemas.QuestionSchema)
def create_question(form_id: str, q_data: schemas.QuestionCreate, db: Session = Depends(get_db)):
    db_form = crud.get_form(db, form_id)
    if not db_form:
        raise HTTPException(status_code=404, detail="Form not found")
    return crud.create_question(db, form_id, q_data)

@app.put("/api/questions/{question_id}", response_model=schemas.QuestionSchema)
def update_question(question_id: str, q_data: schemas.QuestionUpdate, db: Session = Depends(get_db)):
    updated = crud.update_question(db, question_id, q_data)
    if not updated:
        raise HTTPException(status_code=404, detail="Question not found")
    return updated

@app.post("/api/questions/{question_id}/duplicate", response_model=schemas.QuestionSchema)
def duplicate_question(question_id: str, db: Session = Depends(get_db)):
    dup = crud.duplicate_question(db, question_id)
    if not dup:
        raise HTTPException(status_code=404, detail="Question not found")
    return dup

@app.delete("/api/questions/{question_id}")
def delete_question(question_id: str, db: Session = Depends(get_db)):
    success = crud.delete_question(db, question_id)
    if not success:
        raise HTTPException(status_code=404, detail="Question not found")
    return {"message": "Question deleted successfully"}

@app.put("/api/questions/form/{form_id}/reorder")
def reorder_questions(form_id: str, payload: List[str], db: Session = Depends(get_db)):
    crud.reorder_questions(db, form_id, payload)
    return {"message": "Questions reordered successfully"}

# --- Results & Analytics Endpoints ---

@app.get("/api/forms/{form_id}/responses", response_model=List[schemas.FormResponseSchema])
def get_form_responses(form_id: str, db: Session = Depends(get_db)):
    db_form = crud.get_form(db, form_id)
    if not db_form:
        raise HTTPException(status_code=404, detail="Form not found")
    return crud.get_form_responses(db, form_id)

@app.get("/api/forms/{form_id}/summary", response_model=schemas.FormSummaryResponse)
def get_form_summary(form_id: str, db: Session = Depends(get_db)):
    summary = crud.get_form_summary_stats(db, form_id)
    if not summary:
        raise HTTPException(status_code=404, detail="Form not found")
    return summary
