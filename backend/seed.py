"""Sample data so a fresh clone is immediately usable."""

import json

import models
from database import Base, SessionLocal, engine

DEFAULT_CREATOR = {
    "id": models.DEFAULT_CREATOR_ID,
    "name": "Sapphire Studio",
    "email": "creator@formflow.test",
}

# Each form: metadata, questions (with inline options), and rows of answers keyed by question index.
SAMPLE_FORMS = [
    {
        "title": "Customer Product Feedback",
        "description": "Help us improve FormFlow by sharing your valuable feedback!",
        "status": "published",
        "share_id": "demo-feedback",
        "theme": {"color": "#7c3aed", "background": "#fcfcfc", "font": "sans"},
        "ending": {
            "title": "Thanks for the feedback!",
            "description": "Your answers go straight to the product team.",
            "button_label": "Create a typeform",
            "show_button": True,
        },
        "questions": [
            ("short_text", "What is your full name?", "Enter your first and last name", True, {}, []),
            ("email", "What is your work email address?", "We'll send you an exclusive feedback discount", True, {}, []),
            (
                "multiple_choice",
                "Which feature do you use most frequently?",
                "Select the primary tool in your daily workflow",
                True,
                {},
                ["Form Builder", "Analytics & Reports", "Automated Workflows", "Integrations"],
            ),
            ("rating", "How would you rate your overall experience?", "1 star = Poor, 5 stars = Outstanding", True, {"rating_max": 5}, []),
            ("yes_no", "Would you recommend FormFlow to a colleague?", "", True, {}, []),
            (
                "dropdown",
                "What is your primary role?",
                "Select your job function",
                False,
                {},
                ["Product Manager", "Software Engineer", "UX Designer", "Marketing / Growth", "Other"],
            ),
            ("number", "How many team members use form tools in your company?", "Enter approximate head count", False, {}, []),
            ("long_text", "What is one improvement we should prioritize next?", "Feel free to share any details or suggestions", False, {}, []),
        ],
        "responses": [
            ["Sarah Connor", "sarah@cyberdyne.io", "Form Builder", "5", "Yes", "Software Engineer", "15", "The drag and drop builder interface is smooth! Would love AI branching."],
            ["Alex Mercer", "alex.mercer@techcorp.com", "Analytics & Reports", "4", "Yes", "Product Manager", "45", "Export to CSV and Webhooks integration would be fantastic."],
            ["Elena Rostova", "elena@designhub.co", "Form Builder", "5", "Yes", "UX Designer", "8", "Love the sleek animation transitions during filling!"],
            ["David Chen", "dchen@growthscale.org", "Automated Workflows", "3", "No", "Marketing / Growth", "20", "Need better mobile preview customization options."],
            ["Priya Nair", "priya.nair@buildly.dev", "Integrations", "4", "Yes", "Software Engineer", "12", ""],
        ],
    },
    {
        "title": "Tech Summit 2026 Registration",
        "description": "Reserve your seat for the annual keynote and workshop tracks.",
        "status": "published",
        "share_id": "demo-event",
        "theme": {"color": "#0f766e", "background": "#f7fdfb", "font": "serif"},
        "ending": {
            "title": "You're on the list 🎟️",
            "description": "A confirmation QR code is on its way to your inbox.",
            "button_label": "Back to home",
            "show_button": False,
        },
        "questions": [
            ("short_text", "Attendee name", "Full legal name for badge printing", True, {}, []),
            ("email", "Email address", "We will send your confirmation QR code here", True, {}, []),
            (
                "multiple_choice",
                "Which track will you attend?",
                "Select your primary interest",
                True,
                {},
                ["AI & Machine Learning", "Cloud Infrastructure", "Frontend Engineering"],
            ),
            ("rating", "How excited are you on a scale of 1 to 10?", "Be honest", False, {"rating_max": 10}, []),
            ("yes_no", "Do you need a vegetarian meal?", "", True, {}, []),
            ("long_text", "Anything we should know before you arrive?", "Accessibility needs, dietary notes, anything", False, {}, []),
        ],
        "responses": [
            ["Marcus Hale", "marcus@northwind.io", "Cloud Infrastructure", "9", "No", "Travelling in from Berlin, arriving late on day one."],
            ["Aditi Sharma", "aditi@quantleap.ai", "AI & Machine Learning", "10", "Yes", ""],
            ["Tom Okafor", "tom.okafor@pixelforge.studio", "Frontend Engineering", "8", "No", "Would love a hallway track for design systems."],
        ],
    },
    {
        "title": "Employee Onboarding Checklist",
        "description": "Internal draft — not published yet.",
        "status": "draft",
        "share_id": "demo-onboarding",
        "theme": {"color": "#c026d3", "background": "#fdf7fd", "font": "sans"},
        "ending": {
            "title": "Onboarding submitted",
            "description": "People Ops will follow up within two working days.",
            "button_label": "Done",
            "show_button": False,
        },
        "questions": [
            ("short_text", "What is your preferred first name?", "This is what your teammates will see", True, {}, []),
            ("dropdown", "Which department are you joining?", "", True, {}, ["Engineering", "Design", "Sales", "People Ops"]),
            ("number", "How many years of experience do you have?", "", False, {}, []),
            ("yes_no", "Have you completed the security training?", "", True, {}, []),
        ],
        "responses": [],
    },
]


def seed_database() -> None:
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    try:
        if not db.query(models.User).filter(models.User.id == DEFAULT_CREATOR["id"]).first():
            db.add(models.User(**DEFAULT_CREATOR))
            db.commit()

        if db.query(models.Form).count() > 0:
            print("Database already seeded.")
            return

        print("Seeding database with sample forms and responses...")
        for spec in SAMPLE_FORMS:
            _seed_form(db, spec)
        db.commit()
        print("Database successfully seeded!")
    finally:
        db.close()


def _seed_form(db, spec: dict) -> None:
    theme, ending = spec["theme"], spec["ending"]
    form = models.Form(
        creator_id=DEFAULT_CREATOR["id"],
        title=spec["title"],
        description=spec["description"],
        status=spec["status"],
        share_id=spec["share_id"],
        theme_color=theme["color"],
        theme_background=theme["background"],
        theme_font=theme["font"],
        ending_title=ending["title"],
        ending_description=ending["description"],
        ending_button_label=ending["button_label"],
        ending_show_button=ending["show_button"],
    )
    db.add(form)
    db.flush()

    questions = []
    for position, (q_type, title, description, required, settings, options) in enumerate(spec["questions"]):
        question = models.Question(
            form_id=form.id,
            type=q_type,
            title=title,
            description=description,
            is_required=required,
            position=position,
            settings=json.dumps(settings or {}),
        )
        db.add(question)
        db.flush()
        for index, label in enumerate(options):
            db.add(models.QuestionOption(question_id=question.id, label=label, position=index))
        questions.append(question)

    for row in spec["responses"]:
        response = models.FormResponse(form_id=form.id)
        db.add(response)
        db.flush()
        for question, value in zip(questions, row):
            db.add(models.Answer(response_id=response.id, question_id=question.id, value=value))


if __name__ == "__main__":
    seed_database()
