from database import SessionLocal, engine, Base
import models
import datetime

def seed_database():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    try:
        # Check if database already has forms
        existing_forms = db.query(models.Form).count()
        if existing_forms > 0:
            print("Database already seeded.")
            return

        print("Seeding database with sample forms and responses...")

        # Form 1: Customer Satisfaction Survey (Published)
        form1 = models.Form(
            title="Customer Product Feedback",
            description="Help us improve FormFlow by sharing your valuable feedback!",
            status="published",
            share_id="demo-feedback"
        )
        db.add(form1)
        db.commit()
        db.refresh(form1)

        q1_1 = models.Question(
            form_id=form1.id,
            type="short_text",
            title="What is your full name?",
            description="Enter your first and last name",
            is_required=True,
            position=0
        )
        q1_2 = models.Question(
            form_id=form1.id,
            type="email",
            title="What is your work email address?",
            description="We'll send you an exclusive feedback discount",
            is_required=True,
            position=1
        )
        q1_3 = models.Question(
            form_id=form1.id,
            type="multiple_choice",
            title="Which feature do you use most frequently?",
            description="Select the primary tool in your daily workflow",
            is_required=True,
            position=2
        )
        q1_4 = models.Question(
            form_id=form1.id,
            type="rating",
            title="How would you rate your overall experience?",
            description="1 star = Poor, 5 stars = Outstanding",
            is_required=True,
            position=3,
            settings='{"max_rating": 5}'
        )
        q1_5 = models.Question(
            form_id=form1.id,
            type="yes_no",
            title="Would you recommend FormFlow to a colleague?",
            description="",
            is_required=True,
            position=4
        )
        q1_6 = models.Question(
            form_id=form1.id,
            type="dropdown",
            title="What is your primary role?",
            description="Select your job function",
            is_required=False,
            position=5
        )
        q1_7 = models.Question(
            form_id=form1.id,
            type="number",
            title="How many team members use form tools in your company?",
            description="Enter approximate head count",
            is_required=False,
            position=6
        )
        q1_8 = models.Question(
            form_id=form1.id,
            type="long_text",
            title="What is one improvement we should prioritize next?",
            description="Feel free to share any details or suggestions",
            is_required=False,
            position=7
        )

        db.add_all([q1_1, q1_2, q1_3, q1_4, q1_5, q1_6, q1_7, q1_8])
        db.commit()

        # Add options for Multiple Choice (q1_3)
        options_q3 = ["Form Builder", "Analytics & Reports", "Automated Workflows", "Integrations"]
        for idx, opt_label in enumerate(options_q3):
            db.add(models.QuestionOption(question_id=q1_3.id, label=opt_label, position=idx))

        # Add options for Dropdown (q1_6)
        options_q6 = ["Product Manager", "Software Engineer", "UX Designer", "Marketing / Growth", "Other"]
        for idx, opt_label in enumerate(options_q6):
            db.add(models.QuestionOption(question_id=q1_6.id, label=opt_label, position=idx))

        db.commit()

        # Add Sample Responses for Form 1
        sample_responses_data = [
            {
                q1_1.id: "Sarah Connor",
                q1_2.id: "sarah@cyberdyne.io",
                q1_3.id: "Form Builder",
                q1_4.id: "5",
                q1_5.id: "Yes",
                q1_6.id: "Software Engineer",
                q1_7.id: "15",
                q1_8.id: "The drag and drop builder interface is smooth! Would love AI branching."
            },
            {
                q1_1.id: "Alex Mercer",
                q1_2.id: "alex.mercer@techcorp.com",
                q1_3.id: "Analytics & Reports",
                q1_4.id: "4",
                q1_5.id: "Yes",
                q1_6.id: "Product Manager",
                q1_7.id: "45",
                q1_8.id: "Export to CSV and Webhooks integration would be fantastic."
            },
            {
                q1_1.id: "Elena Rostova",
                q1_2.id: "elena@designhub.co",
                q1_3.id: "Form Builder",
                q1_4.id: "5",
                q1_5.id: "Yes",
                q1_6.id: "UX Designer",
                q1_7.id: "8",
                q1_8.id: "Love the sleek animation transitions during filling!"
            },
            {
                q1_1.id: "David Chen",
                q1_2.id: "dchen@growthscale.org",
                q1_3.id: "Automated Workflows",
                q1_4.id: "3",
                q1_5.id: "No",
                q1_6.id: "Marketing / Growth",
                q1_7.id: "20",
                q1_8.id: "Need better mobile preview customization options."
            }
        ]

        for resp_data in sample_responses_data:
            resp_obj = models.FormResponse(form_id=form1.id)
            db.add(resp_obj)
            db.commit()
            db.refresh(resp_obj)

            for q_id, val in resp_data.items():
                db.add(models.Answer(response_id=resp_obj.id, question_id=q_id, value=val))
            db.commit()

        # Form 2: Event Registration (Draft)
        form2 = models.Form(
            title="Tech Summit 2026 Registration",
            description="Draft registration form for annual tech keynote event",
            status="draft",
            share_id="demo-event"
        )
        db.add(form2)
        db.commit()
        db.refresh(form2)

        q2_1 = models.Question(
            form_id=form2.id,
            type="short_text",
            title="Attendee Name",
            description="Full legal name for badge printing",
            is_required=True,
            position=0
        )
        q2_2 = models.Question(
            form_id=form2.id,
            type="email",
            title="Email Address",
            description="We will send confirmation QR code here",
            is_required=True,
            position=1
        )
        q2_3 = models.Question(
            form_id=form2.id,
            type="multiple_choice",
            title="Which track will you attend?",
            description="Select your primary interest",
            is_required=True,
            position=2
        )
        db.add_all([q2_1, q2_2, q2_3])
        db.commit()

        options_q2_3 = ["AI & Machine Learning", "Cloud Infrastructure", "Frontend Engineering"]
        for idx, label in enumerate(options_q2_3):
            db.add(models.QuestionOption(question_id=q2_3.id, label=label, position=idx))
        db.commit()

        print("Database successfully seeded!")

    finally:
        db.close()

if __name__ == "__main__":
    seed_database()
