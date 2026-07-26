"""Sample data so a fresh clone is immediately usable."""

import json

import models
from database import Base, SessionLocal, engine

DEFAULT_CREATOR = {
    "id": models.DEFAULT_CREATOR_ID,
    "name": "Srishti Singh",
    "email": "singhsrishti01032005@gmail.com",
}

# Each form: metadata, questions (with inline options), and rows of answers keyed by question index.
SAMPLE_FORMS = [
    {
        "title": "Customer Product Feedback",
        "description": "Help us improve FormFlow by sharing your valuable feedback!",
        "status": "published",
        "share_id": "demo-feedback",
        "welcome": {
            "show": True,
            "title": "How are we doing?",
            "description": "Five quick questions on FormFlow. Takes about a minute, and every answer reaches the product team.",
            "button_label": "Start",
            "show_time": True,
            "show_submissions": True,
        },
        "theme": {"color": "#262627", "background": "#f9f9f9", "font": "sans"},
        "ending": {
            "title": "Thanks for the feedback!",
            "description": "Your answers go straight to the product team.",
            "button_label": "Create a typeform",
            "show_button": True,
            "show_social": True,
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
            ["Vaibhav Kothari", "vaibhav.kothari@example.in", "Form Builder", "5", "Yes", "Software Engineer", "15", "The drag and drop builder is smooth. Would love logic jumps next."],
            ["Aditi Sharma", "aditi.sharma@quantleap.in", "Analytics & Reports", "4", "Yes", "Product Manager", "45", "CSV export and webhooks would be fantastic additions."],
            ["Ananya Iyer", "ananya.iyer@designhub.co.in", "Form Builder", "5", "Yes", "UX Designer", "8", "The transitions between questions feel great."],
            ["Rohan Mehta", "rohan.mehta@growthscale.in", "Automated Workflows", "3", "No", "Marketing / Growth", "20", "Mobile preview needs more customization options."],
            ["Karthik Reddy", "karthik.reddy@buildly.dev", "Integrations", "4", "Yes", "Software Engineer", "12", ""],
        ],
    },
    {
        "title": "Tech Summit 2026 Registration",
        "description": "Reserve your seat for the annual keynote and workshop tracks.",
        "status": "published",
        "share_id": "demo-event",
        "welcome": {
            "show": True,
            "title": "Tech Summit 2026",
            "description": "Two days of keynotes and workshops in Pune. Reserve your seat below.",
            "button_label": "Register",
            "show_time": True,
            "show_submissions": False,
        },
        "theme": {"color": "#0f766e", "background": "#f7fdfb", "font": "sans"},
        "ending": {
            "title": "You're on the list 🎟️",
            "description": "A confirmation QR code is on its way to your inbox.",
            "button_label": "Back to home",
            "show_button": False,
            "show_social": False,
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
            ["Srishti Singh", "srishti.singh@northwind.in", "Cloud Infrastructure", "9", "No", "Travelling in from Pune, arriving late on day one."],
            ["Priya Nair", "priya.nair@quantleap.in", "AI & Machine Learning", "10", "Yes", ""],
            ["Arjun Desai", "arjun.desai@pixelforge.in", "Frontend Engineering", "8", "No", "Would love a hallway track on design systems."],
        ],
    },
    {
        "title": "Employee Onboarding Checklist",
        "description": "Internal draft — not published yet.",
        "status": "draft",
        "share_id": "demo-onboarding",
        "welcome": {
            "show": False,
            "title": "",
            "description": "",
            "button_label": "Start",
            "show_time": False,
            "show_submissions": False,
        },
        "theme": {"color": "#c026d3", "background": "#fdf7fd", "font": "sans"},
        "ending": {
            "title": "Onboarding submitted",
            "description": "People Ops will follow up within two working days.",
            "button_label": "Done",
            "show_button": False,
            "show_social": False,
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
    theme, welcome, ending = spec["theme"], spec["welcome"], spec["ending"]
    form = models.Form(
        creator_id=DEFAULT_CREATOR["id"],
        title=spec["title"],
        description=spec["description"],
        status=spec["status"],
        share_id=spec["share_id"],
        theme_color=theme["color"],
        theme_background=theme["background"],
        theme_font=theme["font"],
        welcome_show=welcome["show"],
        welcome_title=welcome["title"],
        welcome_description=welcome["description"],
        welcome_button_label=welcome["button_label"],
        welcome_show_time=welcome["show_time"],
        welcome_show_submissions=welcome["show_submissions"],
        ending_title=ending["title"],
        ending_description=ending["description"],
        ending_button_label=ending["button_label"],
        ending_show_button=ending["show_button"],
        ending_show_social=ending["show_social"],
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
