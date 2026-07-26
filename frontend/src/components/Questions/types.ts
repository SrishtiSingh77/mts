import { Question } from "@/types";

export interface AnswerInputProps {
  question: Question;
  value: string;
  onChange: (value: string) => void;
  /** Called when the input itself should move the flow forward (choice click, Enter). */
  onAdvance?: () => void;
  /** Builder preview renders the same components inert. */
  disabled?: boolean;
  /** Theme colour, applied inline because it is a user-chosen hex. */
  accent: string;
  autoFocus?: boolean;
}
