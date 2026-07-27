/**
 * Mirror of the branching half of backend/validation.py.
 *
 * The server replays the same path when validating, so these two must agree —
 * otherwise the respondent would be shown one route and judged against another.
 */
import { LogicOperator, LogicRule, Question } from "@/types";

/** Sentinel target meaning "skip the rest and go to the ending screen". */
export const JUMP_TO_ENDING = "__ending__";

export const LOGIC_OPERATORS: { value: LogicOperator; label: string; needsValue: boolean }[] = [
  { value: "equals", label: "is", needsValue: true },
  { value: "not_equals", label: "is not", needsValue: true },
  { value: "contains", label: "contains", needsValue: true },
  { value: "greater_than", label: "is greater than", needsValue: true },
  { value: "less_than", label: "is less than", needsValue: true },
  { value: "is_answered", label: "is answered", needsValue: false },
  { value: "is_empty", label: "is empty", needsValue: false },
];

export function operatorLabel(operator: LogicOperator): string {
  return LOGIC_OPERATORS.find((entry) => entry.value === operator)?.label ?? operator;
}

export function operatorNeedsValue(operator: LogicOperator): boolean {
  return LOGIC_OPERATORS.find((entry) => entry.value === operator)?.needsValue ?? true;
}

function asNumber(text: string): number | null {
  if (text.trim() === "") return null;
  const parsed = Number(text);
  return Number.isNaN(parsed) ? null : parsed;
}

export function ruleMatches(rule: LogicRule, answer: string): boolean {
  const given = (answer ?? "").trim();
  const expected = (rule.value ?? "").trim();

  switch (rule.operator) {
    case "is_answered":
      return given !== "";
    case "is_empty":
      return given === "";
    case "equals":
      return given.toLowerCase() === expected.toLowerCase();
    case "not_equals":
      return given.toLowerCase() !== expected.toLowerCase();
    case "contains":
      return given.toLowerCase().includes(expected.toLowerCase());
    case "greater_than":
    case "less_than": {
      const left = asNumber(given);
      const right = asNumber(expected);
      if (left === null || right === null) return false;
      return rule.operator === "greater_than" ? left > right : left < right;
    }
    default:
      return false;
  }
}

/** First matching rule wins; otherwise fall through to the next question. */
export function resolveNextQuestionId(
  question: Question,
  answer: string,
  nextInOrder: string | null
): string | null {
  for (const rule of question.logic ?? []) {
    if (ruleMatches(rule, answer)) {
      return rule.target_question_id ?? JUMP_TO_ENDING;
    }
  }
  return nextInOrder;
}

export function hasLogic(question: Question): boolean {
  return (question.logic?.length ?? 0) > 0;
}
