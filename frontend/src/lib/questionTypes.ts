import {
  AlignLeft,
  ChevronDown,
  CircleSlash,
  FileText,
  Hash,
  List,
  LucideIcon,
  Mail,
  Star,
} from "lucide-react";

import { QuestionType } from "@/types";

export type QuestionGroup = "Contact info" | "Choice" | "Rating & ranking" | "Text & Numbers";

/** Group -> icon tile colour, mirroring Typeform's element catalog. */
export const GROUP_CHIP: Record<QuestionGroup, string> = {
  "Contact info": "bg-[#f3ddf5] text-[#7b3b86]",
  Choice: "bg-[#dbe6fb] text-[#2c4f8f]",
  "Rating & ranking": "bg-[#d8efdf] text-[#25674a]",
  "Text & Numbers": "bg-[#dbe6fb] text-[#2c4f8f]",
};

export interface QuestionTypeMeta {
  type: QuestionType;
  label: string;
  icon: LucideIcon;
  /** Tailwind text colour for a bare icon, used in compact lists. */
  iconClass: string;
  group: QuestionGroup;
  placeholder?: string;
}

/** Single source of truth for how each question type is labelled and iconed. */
export const QUESTION_TYPES: QuestionTypeMeta[] = [
  {
    type: "short_text",
    label: "Short Text",
    icon: AlignLeft,
    iconClass: "text-[#2c4f8f]",
    group: "Text & Numbers",
    placeholder: "Type your answer here...",
  },
  {
    type: "long_text",
    label: "Long Text",
    icon: FileText,
    iconClass: "text-[#2c4f8f]",
    group: "Text & Numbers",
    placeholder: "Type your answer here...",
  },
  {
    type: "number",
    label: "Number",
    icon: Hash,
    iconClass: "text-[#8a6420]",
    group: "Text & Numbers",
    placeholder: "0",
  },
  {
    type: "email",
    label: "Email",
    icon: Mail,
    iconClass: "text-[#7b3b86]",
    group: "Contact info",
    placeholder: "name@example.com",
  },
  {
    type: "multiple_choice",
    label: "Multiple Choice",
    icon: List,
    iconClass: "text-[#2c4f8f]",
    group: "Choice",
  },
  {
    type: "dropdown",
    label: "Dropdown",
    icon: ChevronDown,
    iconClass: "text-[#2c4f8f]",
    group: "Choice",
  },
  {
    type: "yes_no",
    label: "Yes/No",
    icon: CircleSlash,
    iconClass: "text-[#2c4f8f]",
    group: "Choice",
  },
  {
    type: "rating",
    label: "Rating",
    icon: Star,
    iconClass: "text-[#25674a]",
    group: "Rating & ranking",
  },
];

const BY_TYPE = new Map(QUESTION_TYPES.map((meta) => [meta.type, meta]));

export function questionTypeMeta(type: QuestionType): QuestionTypeMeta {
  return BY_TYPE.get(type) ?? QUESTION_TYPES[0];
}

export function chipClassFor(type: QuestionType): string {
  return GROUP_CHIP[questionTypeMeta(type).group];
}

/** Catalog order used by the Add content modal. */
export const GROUP_ORDER: QuestionGroup[] = [
  "Contact info",
  "Choice",
  "Rating & ranking",
  "Text & Numbers",
];

export function questionTypesByGroup(): { group: QuestionGroup; metas: QuestionTypeMeta[] }[] {
  return GROUP_ORDER.map((group) => ({
    group,
    metas: QUESTION_TYPES.filter((meta) => meta.group === group),
  }));
}
