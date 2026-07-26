"use client";

import { ComponentType } from "react";

import { QuestionType } from "@/types";
import ChoiceAnswerInput from "./inputs/ChoiceAnswerInput";
import DropdownAnswerInput from "./inputs/DropdownAnswerInput";
import RatingAnswerInput from "./inputs/RatingAnswerInput";
import TextAnswerInput from "./inputs/TextAnswerInput";
import YesNoAnswerInput from "./inputs/YesNoAnswerInput";
import { AnswerInputProps } from "./types";

/** One component per question type; the respondent flow and builder preview both dispatch here. */
const REGISTRY: Record<QuestionType, ComponentType<AnswerInputProps>> = {
  short_text: TextAnswerInput,
  long_text: TextAnswerInput,
  email: TextAnswerInput,
  number: TextAnswerInput,
  multiple_choice: ChoiceAnswerInput,
  dropdown: DropdownAnswerInput,
  yes_no: YesNoAnswerInput,
  rating: RatingAnswerInput,
};

/** Types that select-and-advance on their own, so no OK button is needed. */
export const SELF_ADVANCING_TYPES: QuestionType[] = ["multiple_choice", "yes_no"];

export default function QuestionInput(props: AnswerInputProps) {
  const Input = REGISTRY[props.question.type] ?? TextAnswerInput;
  return <Input {...props} />;
}

export type { AnswerInputProps };
