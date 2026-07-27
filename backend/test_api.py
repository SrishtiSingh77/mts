"""End-to-end API tests.

Run from the backend directory with the venv active:

    pytest -q

Each test builds the form it needs and deletes it afterwards, so the suite can run
against a seeded database without disturbing the sample data.
"""

import pytest
from fastapi.testclient import TestClient

import main

client = TestClient(main.app)


# --- helpers ---


@pytest.fixture
def form():
    """A published form with one question, torn down after the test."""
    created = client.post("/api/forms", json={"title": "Test form"}).json()
    # The starter question is blank; tests add exactly what they need.
    client.delete(f"/api/questions/{created['questions'][0]['id']}")
    yield created["id"]
    client.delete(f"/api/forms/{created['id']}")


def add_question(form_id, qtype="short_text", title="Q", required=False, options=None, settings=None):
    body = {"type": qtype, "title": title, "is_required": required}
    if options is not None:
        body["options"] = [{"label": label} for label in options]
    if settings is not None:
        body["settings"] = settings
    return client.post(f"/api/questions/form/{form_id}", json=body).json()


def publish(form_id):
    client.post(f"/api/forms/{form_id}/publish")
    return client.get(f"/api/forms/{form_id}").json()["share_id"]


def submit(share_id, answers, **extra):
    payload = {"answers": [{"question_id": q, "value": v} for q, v in answers]}
    payload.update(extra)
    return client.post(f"/api/forms/share/{share_id}/responses", json=payload)


def codes(response):
    return sorted(e["code"] for e in response.json().get("errors", []))


# --- validation ---


def test_required_question_is_enforced(form):
    q = add_question(form, "short_text", "Name", required=True)
    share = publish(form)

    assert codes(submit(share, [(q["id"], "")])) == ["required"]
    assert submit(share, [(q["id"], "Nakul")]).status_code == 200


@pytest.mark.parametrize(
    "qtype,bad,good,code",
    [
        ("email", "not-an-email", "a@b.in", "email"),
        ("number", "abc", "42", "number"),
        ("yes_no", "maybe", "Yes", "yes_no"),
    ],
)
def test_type_validation(form, qtype, bad, good, code):
    q = add_question(form, qtype, "Q", required=True)
    share = publish(form)

    assert code in codes(submit(share, [(q["id"], bad)]))
    assert submit(share, [(q["id"], good)]).status_code == 200


def test_choice_answer_must_match_an_option(form):
    q = add_question(form, "multiple_choice", "Pick", required=True, options=["A", "B"])
    share = publish(form)

    assert "choice" in codes(submit(share, [(q["id"], "Invented")]))
    assert submit(share, [(q["id"], "B")]).status_code == 200


def test_rating_respects_configured_scale(form):
    q = add_question(form, "rating", "Rate", required=True, settings={"rating_max": 7})
    share = publish(form)

    assert "rating" in codes(submit(share, [(q["id"], "9")]))
    assert submit(share, [(q["id"], "7")]).status_code == 200


def test_answers_are_normalized_on_write(form):
    name = add_question(form, "short_text", "Name")
    email = add_question(form, "email", "Email")
    yesno = add_question(form, "yes_no", "OK")
    number = add_question(form, "number", "Count")
    share = publish(form)

    submit(share, [(name["id"], "  Spaced  "), (email["id"], "MiXeD@Example.IN"),
                   (yesno["id"], "yes"), (number["id"], "7.0")])

    row = client.get(f"/api/forms/{form}/responses").json()[0]
    stored = {a["question_id"]: a["value"] for a in row["answers"]}
    assert stored[name["id"]] == "Spaced"
    assert stored[email["id"]] == "mixed@example.in"
    assert stored[yesno["id"]] == "Yes"
    assert stored[number["id"]] == "7"


def test_answers_for_other_forms_are_rejected(form):
    add_question(form, "short_text", "Q")
    share = publish(form)
    assert "unknown_question" in codes(submit(share, [("not-a-real-id", "x")]))


# --- publish gating ---


def test_unpublished_form_is_not_publicly_readable(form):
    add_question(form, "short_text", "Q")
    share = client.get(f"/api/forms/{form}").json()["share_id"]

    assert client.get(f"/api/forms/share/{share}").status_code == 404
    publish(form)
    assert client.get(f"/api/forms/share/{share}").status_code == 200


def test_form_without_questions_cannot_publish(form):
    assert client.post(f"/api/forms/{form}/publish").status_code == 400


# --- branching / logic jumps ---


def test_skipped_branch_does_not_trigger_required_errors(form):
    gate = add_question(form, "yes_no", "Customer?", required=True)
    only_if_yes = add_question(form, "short_text", "Plan", required=True)
    always = add_question(form, "short_text", "Feedback", required=True)

    client.put(
        f"/api/questions/{gate['id']}/logic",
        json={"rules": [{"operator": "equals", "value": "No", "target_question_id": None}]},
    )
    share = publish(form)

    # "No" jumps to the ending, so the two required questions are never seen.
    assert submit(share, [(gate["id"], "No")]).status_code == 200
    # "Yes" falls through, so both are still enforced.
    assert codes(submit(share, [(gate["id"], "Yes")])) == ["required", "required"]
    assert submit(
        share, [(gate["id"], "Yes"), (only_if_yes["id"], "Pro"), (always["id"], "Good")]
    ).status_code == 200


def test_only_answers_on_the_taken_path_are_stored(form):
    gate = add_question(form, "yes_no", "Customer?")
    skipped = add_question(form, "short_text", "Plan")
    target = add_question(form, "short_text", "Feedback")

    client.put(
        f"/api/questions/{gate['id']}/logic",
        json={"rules": [{"operator": "equals", "value": "No", "target_question_id": target["id"]}]},
    )
    share = publish(form)

    submit(share, [(gate["id"], "No"), (skipped["id"], "sneaky"), (target["id"], "hi")])
    row = client.get(f"/api/forms/{form}/responses").json()[0]
    stored = {a["question_id"] for a in row["answers"]}
    assert skipped["id"] not in stored
    assert stored == {gate["id"], target["id"]}


def test_backward_rule_cannot_loop_forever(form):
    first = add_question(form, "short_text", "First")
    second = add_question(form, "short_text", "Second")
    client.put(
        f"/api/questions/{second['id']}/logic",
        json={"rules": [{"operator": "is_answered", "value": "", "target_question_id": first["id"]}]},
    )
    share = publish(form)
    assert submit(share, [(first["id"], "a"), (second["id"], "b")]).status_code == 200


def test_logic_target_on_another_form_is_dropped(form):
    q = add_question(form, "short_text", "Q")
    other = client.post("/api/forms", json={"title": "Other"}).json()
    try:
        saved = client.put(
            f"/api/questions/{q['id']}/logic",
            json={
                "rules": [
                    {
                        "operator": "equals",
                        "value": "x",
                        "target_question_id": other["questions"][0]["id"],
                    }
                ]
            },
        ).json()
        assert saved["logic"][0]["target_question_id"] is None
    finally:
        client.delete(f"/api/forms/{other['id']}")


def test_unknown_logic_operator_is_rejected(form):
    q = add_question(form, "short_text", "Q")
    response = client.put(
        f"/api/questions/{q['id']}/logic",
        json={"rules": [{"operator": "sql_injection", "value": "x", "target_question_id": None}]},
    )
    assert response.status_code == 422


# --- partial responses / insights ---


def test_partial_then_complete_reuses_one_row(form):
    q1 = add_question(form, "short_text", "One")
    q2 = add_question(form, "short_text", "Two")
    share = publish(form)

    partial = client.post(
        f"/api/forms/share/{share}/responses/partial",
        json={"answers": [{"question_id": q1["id"], "value": "a"}], "last_question_id": q2["id"]},
    ).json()
    rid = partial["response_id"]

    summary = client.get(f"/api/forms/{form}/summary").json()
    assert (summary["starts"], summary["submissions"], summary["partials"]) == (1, 0, 1)

    done = submit(share, [(q1["id"], "a"), (q2["id"], "b")], response_id=rid)
    assert done.json()["response_id"] == rid

    summary = client.get(f"/api/forms/{form}/summary").json()
    assert (summary["starts"], summary["submissions"], summary["partials"]) == (1, 1, 0)


def test_views_are_counted_separately_from_starts(form):
    add_question(form, "short_text", "Q")
    share = publish(form)

    for _ in range(3):
        assert client.post(f"/api/forms/share/{share}/views").status_code == 204

    summary = client.get(f"/api/forms/{form}/summary").json()
    assert summary["views"] == 3
    assert summary["starts"] == 0


def test_partial_response_id_from_another_form_is_not_hijacked(form):
    q = add_question(form, "short_text", "Q")
    share = publish(form)
    mine = client.post(
        f"/api/forms/share/{share}/responses/partial",
        json={"answers": [{"question_id": q["id"], "value": "a"}]},
    ).json()["response_id"]

    other = client.post("/api/forms", json={"title": "Other"}).json()
    try:
        oq = other["questions"][0]
        other_share = publish(other["id"])
        theirs = client.post(
            f"/api/forms/share/{other_share}/responses/partial",
            json={"response_id": mine, "answers": [{"question_id": oq["id"], "value": "x"}]},
        ).json()["response_id"]
        assert theirs != mine
    finally:
        client.delete(f"/api/forms/{other['id']}")


def test_partial_answers_excluded_from_question_stats(form):
    q = add_question(form, "rating", "Rate", settings={"rating_max": 5})
    share = publish(form)

    # A partial rating of 1 must not drag the completed average of 5 down.
    client.post(
        f"/api/forms/share/{share}/responses/partial",
        json={"answers": [{"question_id": q["id"], "value": "1"}]},
    )
    submit(share, [(q["id"], "5")])

    stats = client.get(f"/api/forms/{form}/summary").json()["questions_summary"][0]
    assert stats["avg_rating"] == 5.0
    assert stats["total_answers"] == 1


# --- results, CSV, deletion ---


def test_csv_has_one_column_per_question_and_aligns(form):
    q1 = add_question(form, "short_text", "First question")
    q2 = add_question(form, "short_text", "Second question")
    share = publish(form)
    submit(share, [(q1["id"], "a"), (q2["id"], "")])

    import csv
    import io

    response = client.get(f"/api/forms/{form}/responses.csv")
    assert response.headers["content-type"].startswith("text/csv")
    rows = list(csv.reader(io.StringIO(response.text)))

    assert rows[0] == ["Response ID", "Submitted At", "Status", "First question", "Second question"]
    assert len({len(r) for r in rows}) == 1  # every row the same width
    assert rows[1][2] == "Completed"
    assert rows[1][4] == ""  # skipped optional stays an empty cell


def test_deleting_responses_cascades_to_answers(form):
    q = add_question(form, "short_text", "Q")
    share = publish(form)
    rid = submit(share, [(q["id"], "value")]).json()["response_id"]

    assert client.post(f"/api/forms/{form}/responses/delete", json=[rid]).json()["deleted"] == 1
    assert client.get(f"/api/forms/{form}/responses").json() == []


def test_deleting_a_form_removes_its_responses(form):
    q = add_question(form, "short_text", "Q")
    share = publish(form)
    submit(share, [(q["id"], "v")])

    assert client.delete(f"/api/forms/{form}").status_code == 200
    assert client.get(f"/api/forms/{form}").status_code == 404


# --- questions: ordering, duplication ---


def test_delete_keeps_positions_contiguous(form):
    ids = [add_question(form, "short_text", f"Q{i}")["id"] for i in range(3)]
    client.delete(f"/api/questions/{ids[1]}")

    positions = [q["position"] for q in client.get(f"/api/forms/{form}").json()["questions"]]
    assert positions == [0, 1]


def test_reorder_persists(form):
    a = add_question(form, "short_text", "A")
    b = add_question(form, "short_text", "B")
    client.put(f"/api/questions/form/{form}/reorder", json=[b["id"], a["id"]])

    titles = [q["title"] for q in client.get(f"/api/forms/{form}").json()["questions"]]
    assert titles == ["B", "A"]


def test_duplicating_a_form_copies_logic_with_remapped_targets(form):
    gate = add_question(form, "yes_no", "Gate")
    target = add_question(form, "short_text", "Target")
    client.put(
        f"/api/questions/{gate['id']}/logic",
        json={"rules": [{"operator": "equals", "value": "Yes", "target_question_id": target["id"]}]},
    )

    copy = client.post(f"/api/forms/{form}/duplicate").json()
    try:
        copied_ids = {q["id"] for q in copy["questions"]}
        rule = next(r for q in copy["questions"] for r in q["logic"])
        # The copy must point at its own questions, never the original's.
        assert rule["target_question_id"] in copied_ids
        assert rule["target_question_id"] != target["id"]
        assert copy["status"] == "draft"
    finally:
        client.delete(f"/api/forms/{copy['id']}")


def test_new_content_has_no_placeholder_text():
    created = client.post("/api/forms", json={"title": "Blank check"}).json()
    try:
        assert created["questions"][0]["title"] == ""
        assert created["welcome"]["title"] == ""
        assert created["ending"]["title"] == ""
        # Posted without a title, so this asserts the API's own default.
        added = client.post(
            f"/api/questions/form/{created['id']}", json={"type": "long_text"}
        ).json()
        assert added["title"] == ""
    finally:
        client.delete(f"/api/forms/{created['id']}")


# --- meta ---


def test_client_validation_mirror_matches_server_rules():
    spec = client.get("/api/meta/validation-rules").json()
    assert spec["rating"]["default_max"] == 5
    assert set(spec["question_types"]) == {
        "short_text", "long_text", "multiple_choice", "dropdown",
        "email", "number", "yes_no", "rating",
    }
