import {
  AlignLeft,
  CheckSquare,
  FileText,
  Hash,
  List,
  LucideIcon,
  Mail,
  Star,
  ToggleLeft,
} from "lucide-react";

import { QuestionType } from "@/types";

export interface QuestionTypeMeta {
  type: QuestionType;
  label: string;
  icon: LucideIcon;
  /** Tailwind text colour for the icon, kept consistent everywhere the type appears. */
  iconClass: string;
  group: "Text & Numbers" | "Choice" | "Contact Info" | "Rating & Ranking";
  placeholder?: string;
}

/** Single source of truth for how each question type is labelled and iconed. */
export const QUESTION_TYPES: QuestionTypeMeta[] = [
  {
    type: "short_text",
    label: "Short Text",
    icon: AlignLeft,
    iconClass: "text-gray-600",
    group: "Text & Numbers",
    placeholder: "Type your answer here...",
  },
  {
    type: "long_text",
    label: "Long Text",
    icon: FileText,
    iconClass: "text-gray-600",
    group: "Text & Numbers",
    placeholder: "Type your answer here...",
  },
  {
    type: "number",
    label: "Number",
    icon: Hash,
    iconClass: "text-amber-600",
    group: "Text & Numbers",
    placeholder: "0",
  },
  {
    type: "email",
    label: "Email",
    icon: Mail,
    iconClass: "text-emerald-600",
    group: "Contact Info",
    placeholder: "name@example.com",
  },
  {
    type: "multiple_choice",
    label: "Multiple Choice",
    icon: CheckSquare,
    iconClass: "text-purple-600",
    group: "Choice",
  },
  { type: "dropdown", label: "Dropdown", icon: List, iconClass: "text-blue-600", group: "Choice" },
  {
    type: "yes_no",
    label: "Yes / No",
    icon: ToggleLeft,
    iconClass: "text-indigo-600",
    group: "Choice",
  },
  {
    type: "rating",
    label: "Rating Scale",
    icon: Star,
    iconClass: "text-amber-500",
    group: "Rating & Ranking",
  },
];

const BY_TYPE = new Map(QUESTION_TYPES.map((meta) => [meta.type, meta]));

export function questionTypeMeta(type: QuestionType): QuestionTypeMeta {
  return BY_TYPE.get(type) ?? QUESTION_TYPES[0];
}

export function questionTypesByGroup(): Record<string, QuestionTypeMeta[]> {
  return QUESTION_TYPES.reduce<Record<string, QuestionTypeMeta[]>>((groups, meta) => {
    (groups[meta.group] ??= []).push(meta);
    return groups;
  }, {});
}
