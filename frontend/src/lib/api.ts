import {
  FieldError,
  Form,
  FormResponseData,
  FormSummary,
  FormUpdatePayload,
  LogicRule,
  Question,
  QuestionType,
} from "@/types";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

/** Carries the 422 per-question errors so callers can pin messages to fields. */
export class ApiError extends Error {
  status: number;
  fieldErrors: FieldError[];

  constructor(message: string, status: number, fieldErrors: FieldError[] = []) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.fieldErrors = fieldErrors;
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    cache: "no-store",
    headers: init?.body ? { "Content-Type": "application/json" } : undefined,
    ...init,
  });

  if (!response.ok) {
    let detail = `Request failed (${response.status})`;
    let fieldErrors: FieldError[] = [];
    try {
      const body = await response.json();
      if (typeof body?.detail === "string") detail = body.detail;
      if (Array.isArray(body?.errors)) fieldErrors = body.errors;
    } catch {
      // Non-JSON error body; keep the generic message.
    }
    throw new ApiError(detail, response.status, fieldErrors);
  }

  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}

const json = (body: unknown): RequestInit["body"] => JSON.stringify(body);

// --- Forms ---

export const fetchForms = () => request<Form[]>("/forms");

export const fetchForm = (formId: string) => request<Form>(`/forms/${formId}`);

export const fetchFormByShareId = (shareId: string) => request<Form>(`/forms/share/${shareId}`);

export const createForm = (title = "Untitled Form") =>
  request<Form>("/forms", { method: "POST", body: json({ title, description: "" }) });

export const updateForm = (formId: string, data: FormUpdatePayload) =>
  request<Form>(`/forms/${formId}`, { method: "PUT", body: json(data) });

export const duplicateForm = (formId: string) =>
  request<Form>(`/forms/${formId}/duplicate`, { method: "POST" });

export const deleteForm = (formId: string) =>
  request<{ message: string }>(`/forms/${formId}`, { method: "DELETE" });

export const togglePublishForm = (formId: string) =>
  request<Form>(`/forms/${formId}/publish`, { method: "POST" });

// --- Questions ---

export const createQuestion = (
  formId: string,
  type: QuestionType = "short_text",
  overrides: Partial<Pick<Question, "title" | "description" | "is_required">> = {}
) =>
  request<Question>(`/questions/form/${formId}`, {
    method: "POST",
    body: json({
      type,
      title: "",
      description: "",
      is_required: false,
      ...overrides,
    }),
  });

export const updateQuestion = (questionId: string, data: Partial<Question>) =>
  request<Question>(`/questions/${questionId}`, { method: "PUT", body: json(data) });

export const duplicateQuestion = (questionId: string) =>
  request<Question>(`/questions/${questionId}/duplicate`, { method: "POST" });

export const deleteQuestion = (questionId: string) =>
  request<{ message: string }>(`/questions/${questionId}`, { method: "DELETE" });

/** Replaces a question's branching rules wholesale. */
export const updateQuestionLogic = (questionId: string, rules: LogicRule[]) =>
  request<Question>(`/questions/${questionId}/logic`, {
    method: "PUT",
    body: json({ rules }),
  });

export const reorderQuestions = (formId: string, orderedIds: string[]) =>
  request<{ message: string }>(`/questions/form/${formId}/reorder`, {
    method: "PUT",
    body: json(orderedIds),
  });

// --- Responses ---

type SubmitAnswer = { question_id: string; value: string };
type SubmitResult = { message: string; response_id: string };

/** Fire-and-forget view counter; failures must never block the respondent. */
export const recordFormView = (shareId: string) =>
  request<void>(`/forms/share/${shareId}/views`, { method: "POST" }).catch(() => undefined);

/** Saves progress mid-flow and returns the row id to keep updating. */
export const savePartialResponse = (
  shareId: string,
  answers: SubmitAnswer[],
  responseId?: string,
  lastQuestionId?: string
) =>
  request<{ response_id: string }>(`/forms/share/${shareId}/responses/partial`, {
    method: "POST",
    body: json({ answers, response_id: responseId, last_question_id: lastQuestionId }),
  });

/** Public submit path — only works while the form is published. */
export const submitPublicResponse = (
  shareId: string,
  answers: SubmitAnswer[],
  responseId?: string,
  startedAt?: string
) =>
  request<SubmitResult>(`/forms/share/${shareId}/responses`, {
    method: "POST",
    body: json({ answers, response_id: responseId, started_at: startedAt }),
  });

/** Creator-side submit, used by the results page's test-response generator. */
export const submitFormResponse = (formId: string, answers: SubmitAnswer[]) =>
  request<SubmitResult>(`/forms/${formId}/responses`, { method: "POST", body: json({ answers }) });

export const deleteResponses = (formId: string, responseIds: string[]) =>
  request<{ message: string; deleted: number }>(`/forms/${formId}/responses/delete`, {
    method: "POST",
    body: json(responseIds),
  });

export const fetchFormResponses = (formId: string) =>
  request<FormResponseData[]>(`/forms/${formId}/responses`);

export const fetchFormSummary = (formId: string) => request<FormSummary>(`/forms/${formId}/summary`);

export const responsesCsvUrl = (formId: string) => `${API_BASE}/forms/${formId}/responses.csv`;
