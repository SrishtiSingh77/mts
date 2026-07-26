export type QuestionType =
  | "short_text"
  | "long_text"
  | "multiple_choice"
  | "dropdown"
  | "email"
  | "number"
  | "yes_no"
  | "rating";

export interface QuestionOption {
  id?: string;
  label: string;
  position: number;
}

export interface Question {
  id: string;
  form_id: string;
  type: QuestionType;
  title: string;
  description?: string;
  is_required: boolean;
  position: number;
  settings?: string;
  options: QuestionOption[];
}

export interface Form {
  id: string;
  title: string;
  description?: string;
  status: "draft" | "published";
  share_id: string;
  created_at: string;
  updated_at: string;
  response_count?: number;
  questions?: Question[];
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
  rating_distribution?: Record<number, number>;
  avg_number?: number;
  min_number?: number;
  max_number?: number;
  text_responses?: string[];
}

export interface FormSummary {
  form_id: string;
  form_title: string;
  total_responses: number;
  questions_summary: QuestionSummary[];
}
