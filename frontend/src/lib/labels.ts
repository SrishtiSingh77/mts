import { Form, Question } from "@/types";

/**
 * Editors store blank titles so their placeholder shows instead of text the
 * creator has to delete. Read-only surfaces (results, sidebars, the public
 * ending screen) need something to render in that case.
 */

export const FALLBACK_QUESTION_TITLE = "Untitled question";
export const FALLBACK_ENDING_TITLE = "Thanks for completing this typeform";
export const FALLBACK_ENDING_LABEL = "Thank You Screen";

export function questionLabel(question: Pick<Question, "title">): string {
  return question.title.trim() || FALLBACK_QUESTION_TITLE;
}

export function endingHeadline(form: Pick<Form, "ending">): string {
  return form.ending.title.trim() || FALLBACK_ENDING_TITLE;
}

/** Short label for lists and table cells, where the full headline is too long. */
export function endingLabel(endingTitle: string): string {
  return endingTitle.trim() || FALLBACK_ENDING_LABEL;
}

export function welcomeHeadline(form: Pick<Form, "title" | "welcome">): string {
  return form.welcome.title.trim() || form.title.trim() || "Untitled form";
}
