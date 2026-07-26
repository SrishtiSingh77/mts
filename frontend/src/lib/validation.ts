/**
 * Mirror of backend/validation.py — same codes, same messages, same check order.
 *
 * The server re-validates everything; this exists only so the respondent gets an
 * instant inline message instead of a round-trip. Verify parity against
 * GET /api/meta/validation-rules when either side changes.
 */
import { Question, QuestionType } from "@/types";

export const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const MAX_SHORT_TEXT_LENGTH = 500;
export const MAX_LONG_TEXT_LENGTH = 5000;

export const DEFAULT_RATING_MAX = 5;
export const MIN_RATING_MAX = 3;
export const MAX_RATING_MAX = 10;

export const CHOICE_TYPES: QuestionType[] = ["multiple_choice", "dropdown"];

export type ValidationCode =
  | "required"
  | "email"
  | "number"
  | "choice"
  | "yes_no"
  | "rating"
  | "too_long";

const MESSAGES: Record<ValidationCode, (params?: Record<string, number>) => string> = {
  required: () => "Please answer this required question before continuing.",
  email: () => "Please enter a valid email address (e.g. name@example.com).",
  number: () => "Please enter a valid numeric value.",
  choice: () => "Please pick one of the available options.",
  yes_no: () => 'Please answer "Yes" or "No".',
  rating: (p) => `Please pick a rating between ${p?.min ?? 1} and ${p?.max ?? DEFAULT_RATING_MAX}.`,
  too_long: (p) => `Answer is too long (maximum ${p?.max ?? MAX_LONG_TEXT_LENGTH} characters).`,
};

export function message(code: ValidationCode, params?: Record<string, number>): string {
  return MESSAGES[code](params);
}

/** Rating scale upper bound, clamped the same way the server clamps it. */
export function ratingMax(question: Question): number {
  const raw = question.settings?.rating_max;
  if (typeof raw !== "number" || Number.isNaN(raw)) return DEFAULT_RATING_MAX;
  return Math.max(MIN_RATING_MAX, Math.min(MAX_RATING_MAX, Math.round(raw)));
}

export function maxTextLength(type: QuestionType): number {
  return type === "short_text" ? MAX_SHORT_TEXT_LENGTH : MAX_LONG_TEXT_LENGTH;
}

/** Returns an error message, or null when the answer is acceptable. */
export function validateAnswer(question: Question, rawValue: string): string | null {
  const value = (rawValue ?? "").trim();

  if (!value) return question.is_required ? message("required") : null;

  if (["short_text", "long_text", "email", "number"].includes(question.type)) {
    const limit = maxTextLength(question.type);
    if (value.length > limit) return message("too_long", { max: limit });
  }

  switch (question.type) {
    case "email":
      return EMAIL_PATTERN.test(value) ? null : message("email");
    case "number":
      return Number.isNaN(Number(value)) ? message("number") : null;
    case "multiple_choice":
    case "dropdown": {
      const labels = question.options.map((o) => o.label);
      return labels.length && !labels.includes(value) ? message("choice") : null;
    }
    case "yes_no":
      return ["yes", "no"].includes(value.toLowerCase()) ? null : message("yes_no");
    case "rating": {
      const max = ratingMax(question);
      const rating = Number(value);
      return !Number.isInteger(rating) || rating < 1 || rating > max
        ? message("rating", { min: 1, max })
        : null;
    }
    default:
      return null;
  }
}
