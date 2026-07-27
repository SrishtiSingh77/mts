export type QuestionType =
  | "short_text"
  | "long_text"
  | "multiple_choice"
  | "dropdown"
  | "email"
  | "number"
  | "yes_no"
  | "rating";

/** Per-type extras stored as JSON on the question row. */
export interface QuestionSettings {
  rating_max?: number;
}

export interface QuestionOption {
  id?: string;
  label: string;
  position: number;
}

export type LogicOperator =
  | "equals"
  | "not_equals"
  | "contains"
  | "greater_than"
  | "less_than"
  | "is_answered"
  | "is_empty";

/** One branching rule. A null target means jump to the ending screen. */
export interface LogicRule {
  id?: string;
  question_id?: string;
  position?: number;
  operator: LogicOperator;
  value: string;
  target_question_id: string | null;
}

export interface Question {
  id: string;
  form_id: string;
  type: QuestionType;
  title: string;
  description?: string;
  is_required: boolean;
  position: number;
  settings: QuestionSettings;
  options: QuestionOption[];
  logic: LogicRule[];
}

export type ThemeFont = "sans" | "serif" | "mono";

export interface FormTheme {
  color: string;
  background: string;
  font: ThemeFont;
}

export const WELCOME_BUTTON_MAX_LENGTH = 24;

export interface FormWelcome {
  show: boolean;
  /** Blank falls back to the form's own title. */
  title: string;
  /** Blank falls back to the form's own description. */
  description: string;
  button_label: string;
  show_time: boolean;
  show_submissions: boolean;
}

/** The welcome screen is selectable in the Pages list under this sentinel id. */
export const WELCOME_PAGE_ID = "__welcome__";

export interface FormEnding {
  title: string;
  description: string;
  button_label: string;
  show_button: boolean;
  show_social: boolean;
}

/** The ending screen is selectable in the Endings list under this sentinel id. */
export const ENDING_PAGE_ID = "__ending__";

export interface Form {
  id: string;
  title: string;
  description?: string;
  status: "draft" | "published";
  share_id: string;
  created_at: string;
  updated_at: string;
  /** Completed submissions only. */
  response_count: number;
  /** Responses abandoned part-way through. */
  partial_count: number;
  theme: FormTheme;
  welcome: FormWelcome;
  ending: FormEnding;
  questions?: Question[];
}

/** Shape of a PUT /api/forms/:id body. */
export interface FormUpdatePayload {
  title?: string;
  description?: string;
  status?: Form["status"];
  theme?: FormTheme;
  welcome?: FormWelcome;
  ending?: FormEnding;
}

export interface Answer {
  id: string;
  question_id: string;
  value: string;
  question_title?: string;
  question_type?: QuestionType;
}

export interface FormResponseData {
  id: string;
  form_id: string;
  submitted_at: string;
  is_complete: boolean;
  started_at: string | null;
  completed_at: string | null;
  /** Furthest question reached, where an abandonment is attributed. */
  last_question_id: string | null;
  answers: Answer[];
}

export interface OptionStat {
  label: string;
  count: number;
  percentage: number;
}

export interface QuestionSummary {
  question_id: string;
  question_title: string;
  question_type: QuestionType;
  total_answers: number;
  options_stat?: OptionStat[];
  yes_count?: number;
  no_count?: number;
  avg_rating?: number;
  rating_max?: number;
  rating_distribution?: Record<number, number>;
  avg_number?: number;
  min_number?: number;
  max_number?: number;
  text_responses?: string[];
}

export interface QuestionDropOff {
  question_id: string;
  question_title: string;
  reached: number;
  dropped: number;
  drop_rate: number;
}

export interface FormSummary {
  form_id: string;
  form_title: string;
  total_responses: number;
  completion_rate: number;
  questions_summary: QuestionSummary[];

  // Partial-response tracking
  views: number;
  starts: number;
  submissions: number;
  partials: number;
  avg_completion_seconds: number | null;
  drop_off: QuestionDropOff[];
}

/** One entry from a 422 submission response, keyed to the offending question. */
export interface FieldError {
  question_id: string;
  code: string;
  message: string;
}
