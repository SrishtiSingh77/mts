"use client";

import { ArrowRight, CornerDownRight, Plus, Trash2 } from "lucide-react";

import { LOGIC_OPERATORS, hasLogic, operatorNeedsValue } from "@/lib/logic";
import { FALLBACK_QUESTION_TITLE } from "@/lib/labels";
import { questionTypeMeta } from "@/lib/questionTypes";
import { LogicOperator, LogicRule, Question } from "@/types";

interface WorkflowTabViewProps {
  questions: Question[];
  onRulesChange: (questionId: string, rules: LogicRule[]) => void;
}

/** Rule editor for logic jumps. First matching rule wins at runtime. */
export default function WorkflowTabView({ questions, onRulesChange }: WorkflowTabViewProps) {
  if (!questions.length) {
    return (
      <div className="flex flex-1 items-center justify-center bg-stage p-12">
        <p className="text-[15px] text-muted">Add a question on the Content tab first.</p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto bg-stage px-6 py-9">
      <div className="mx-auto max-w-[820px]">
        <h2 className="text-[30px] leading-snug text-ink">Logic</h2>
        <p className="mt-1.5 text-[15px] text-muted">
          Send people to a different question based on their answer. Rules are checked top to
          bottom and the first match wins; if none match, the next question follows in order.
        </p>

        <div className="mt-7 space-y-3">
          {questions.map((question, index) => (
            <QuestionRules
              key={question.id}
              question={question}
              index={index}
              questions={questions}
              onRulesChange={onRulesChange}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function QuestionRules({
  question,
  index,
  questions,
  onRulesChange,
}: {
  question: Question;
  index: number;
  questions: Question[];
  onRulesChange: (questionId: string, rules: LogicRule[]) => void;
}) {
  const rules = question.logic ?? [];
  const { icon: TypeIcon } = questionTypeMeta(question.type);
  // A rule may only jump to another question on this form, or to the ending.
  const targets = questions.filter((candidate) => candidate.id !== question.id);

  const update = (next: LogicRule[]) => onRulesChange(question.id, next);

  const addRule = () =>
    update([
      ...rules,
      { operator: "equals", value: "", target_question_id: targets[index + 1]?.id ?? null },
    ]);

  const patchRule = (at: number, patch: Partial<LogicRule>) =>
    update(rules.map((rule, i) => (i === at ? { ...rule, ...patch } : rule)));

  return (
    <section className="rounded-xl border border-hair bg-surface p-5">
      <header className="flex items-center gap-3">
        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-[5px] bg-inverse text-[12px] font-medium text-on-inverse">
          {index + 1}
        </span>
        <span className="flex h-7 w-9 shrink-0 items-center justify-center rounded-md bg-chip text-chip-ink">
          <TypeIcon className="h-4 w-4" />
        </span>
        <span className="min-w-0 flex-1 truncate text-[15px] text-ink">
          {question.title.trim() || FALLBACK_QUESTION_TITLE}
        </span>
        {hasLogic(question) && (
          <span className="shrink-0 rounded-full bg-panel px-2.5 py-0.5 text-[12px] text-muted">
            {rules.length} rule{rules.length === 1 ? "" : "s"}
          </span>
        )}
      </header>

      {rules.length > 0 && (
        <ol className="mt-4 space-y-2.5">
          {rules.map((rule, at) => (
            <li key={rule.id ?? at} className="flex flex-wrap items-center gap-2 text-[14px]">
              <span className="text-muted">{at === 0 ? "If answer" : "Else if answer"}</span>

              <select
                value={rule.operator}
                onChange={(event) =>
                  patchRule(at, { operator: event.target.value as LogicOperator })
                }
                aria-label="Condition"
                className="rounded-lg border border-hair bg-surface px-2.5 py-1.5 text-ink focus:border-ink focus:outline-none"
              >
                {LOGIC_OPERATORS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>

              {operatorNeedsValue(rule.operator) &&
                (question.options.length > 0 ? (
                  <select
                    value={rule.value}
                    onChange={(event) => patchRule(at, { value: event.target.value })}
                    aria-label="Value"
                    className="rounded-lg border border-hair bg-surface px-2.5 py-1.5 text-ink focus:border-ink focus:outline-none"
                  >
                    <option value="">Choose…</option>
                    {question.options.map((option) => (
                      <option key={option.id ?? option.label} value={option.label}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                ) : question.type === "yes_no" ? (
                  <select
                    value={rule.value}
                    onChange={(event) => patchRule(at, { value: event.target.value })}
                    aria-label="Value"
                    className="rounded-lg border border-hair bg-surface px-2.5 py-1.5 text-ink focus:border-ink focus:outline-none"
                  >
                    <option value="">Choose…</option>
                    <option value="Yes">Yes</option>
                    <option value="No">No</option>
                  </select>
                ) : (
                  <input
                    type={question.type === "number" || question.type === "rating" ? "number" : "text"}
                    value={rule.value}
                    onChange={(event) => patchRule(at, { value: event.target.value })}
                    placeholder="value"
                    aria-label="Value"
                    className="w-28 rounded-lg border border-hair bg-surface px-2.5 py-1.5 text-ink placeholder:text-faint focus:border-ink focus:outline-none"
                  />
                ))}

              <ArrowRight className="h-4 w-4 shrink-0 text-muted" />

              <select
                value={rule.target_question_id ?? ""}
                onChange={(event) =>
                  patchRule(at, { target_question_id: event.target.value || null })
                }
                aria-label="Jump to"
                className="min-w-0 flex-1 rounded-lg border border-hair bg-surface px-2.5 py-1.5 text-ink focus:border-ink focus:outline-none"
              >
                <option value="">Ending screen</option>
                {targets.map((target) => (
                  <option key={target.id} value={target.id}>
                    {questions.indexOf(target) + 1}.{" "}
                    {target.title.trim() || FALLBACK_QUESTION_TITLE}
                  </option>
                ))}
              </select>

              <button
                onClick={() => update(rules.filter((_, i) => i !== at))}
                aria-label="Remove rule"
                className="shrink-0 rounded p-1.5 text-muted transition-colors hover:bg-[#fdf2f1] hover:text-[#c0392b]"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </li>
          ))}
        </ol>
      )}

      <div className="mt-4 flex items-center gap-3 border-t border-hair pt-3.5">
        <button
          onClick={addRule}
          className="flex items-center gap-2 rounded-lg border border-hair px-3 py-1.5 text-[14px] text-ink transition-colors hover:bg-panel"
        >
          <Plus className="h-4 w-4" />
          <span>Add rule</span>
        </button>

        <span className="flex items-center gap-1.5 text-[13px] text-muted">
          <CornerDownRight className="h-3.5 w-3.5" />
          <span>
            Otherwise:{" "}
            {index + 1 < questions.length
              ? `question ${index + 2}`
              : "ending screen"}
          </span>
        </span>
      </div>
    </section>
  );
}
