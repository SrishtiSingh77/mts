import { Form, Question, FormResponseData, FormSummary } from "@/types";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

export async function fetchForms(): Promise<Form[]> {
  const res = await fetch(`${API_BASE}/forms`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch forms");
  return res.json();
}

export async function fetchForm(formId: string): Promise<Form> {
  const res = await fetch(`${API_BASE}/forms/${formId}`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch form");
  return res.json();
}

export async function fetchFormByShareId(shareId: string): Promise<Form> {
  const res = await fetch(`${API_BASE}/forms/share/${shareId}`, { cache: "no-store" });
  if (!res.ok) throw new Error("Form not found");
  return res.json();
}

export async function createForm(title: string = "Untitled Form"): Promise<Form> {
  const res = await fetch(`${API_BASE}/forms`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title, description: "" }),
  });
  if (!res.ok) throw new Error("Failed to create form");
  return res.json();
}

export async function updateForm(formId: string, data: Partial<Form>): Promise<Form> {
  const res = await fetch(`${API_BASE}/forms/${formId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to update form");
  return res.json();
}

export async function duplicateForm(formId: string): Promise<Form> {
  const res = await fetch(`${API_BASE}/forms/${formId}/duplicate`, {
    method: "POST",
  });
  if (!res.ok) throw new Error("Failed to duplicate form");
  return res.json();
}

export async function deleteForm(formId: string): Promise<void> {
  const res = await fetch(`${API_BASE}/forms/${formId}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("Failed to delete form");
}

export async function togglePublishForm(formId: string): Promise<Form> {
  const res = await fetch(`${API_BASE}/forms/${formId}/publish`, {
    method: "POST",
  });
  if (!res.ok) throw new Error("Failed to toggle publish status");
  return res.json();
}

export async function createQuestion(formId: string, type: string = "short_text"): Promise<Question> {
  const res = await fetch(`${API_BASE}/questions/form/${formId}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      type,
      title: "Untitled Question",
      description: "",
      is_required: false,
    }),
  });
  if (!res.ok) throw new Error("Failed to add question");
  return res.json();
}

export async function updateQuestion(questionId: string, data: Partial<Question>): Promise<Question> {
  const res = await fetch(`${API_BASE}/questions/${questionId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to update question");
  return res.json();
}

export async function duplicateQuestion(questionId: string): Promise<Question> {
  const res = await fetch(`${API_BASE}/questions/${questionId}/duplicate`, {
    method: "POST",
  });
  if (!res.ok) throw new Error("Failed to duplicate question");
  return res.json();
}

export async function deleteQuestion(questionId: string): Promise<void> {
  const res = await fetch(`${API_BASE}/questions/${questionId}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("Failed to delete question");
}

export async function reorderQuestions(formId: string, orderedIds: string[]): Promise<void> {
  const res = await fetch(`${API_BASE}/questions/form/${formId}/reorder`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(orderedIds),
  });
  if (!res.ok) throw new Error("Failed to reorder questions");
}

export async function submitFormResponse(formId: string, answers: { question_id: string; value: string }[]): Promise<void> {
  const res = await fetch(`${API_BASE}/forms/${formId}/responses`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ answers }),
  });
  if (!res.ok) throw new Error("Failed to submit response");
}

export async function deleteResponses(responseIds: string[]): Promise<void> {
  const res = await fetch(`${API_BASE}/responses/delete`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(responseIds),
  });
  if (!res.ok) throw new Error("Failed to delete responses");
}

export async function fetchFormResponses(formId: string): Promise<FormResponseData[]> {
  const res = await fetch(`${API_BASE}/forms/${formId}/responses`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch responses");
  return res.json();
}

export async function fetchFormSummary(formId: string): Promise<FormSummary> {
  const res = await fetch(`${API_BASE}/forms/${formId}/summary`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch summary");
  return res.json();
}
