"use client";

import { ChevronDown, HelpCircle, Plus, Video, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { QUESTION_TYPES, questionTypeMeta } from "@/lib/questionTypes";
import { CHOICE_TYPES, MAX_RATING_MAX, MIN_RATING_MAX, ratingMax } from "@/lib/validation";
import { Question, QuestionType } from "@/types";

interface BuilderRightPanelProps {
  question: Question | null;
  onUpdateQuestion: (data: Partial<Question>) => void;
}

export default function BuilderRightPanel({
  question,
  onUpdateQuestion,
}: BuilderRightPanelProps) {
  const [typeMenuOpen, setTypeMenuOpen] = useState(false);
  const [newOption, setNewOption] = useState("");
  const typeMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!typeMenuOpen) return;
    function onPointerDown(event: MouseEvent) {
      if (!typeMenuRef.current?.contains(event.target as Node)) setTypeMenuOpen(false);
    }
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, [typeMenuOpen]);

  if (!question) {
    return <aside className="w-[320px] shrink-0 px-4 pb-4 pt-1" />;
  }

  const meta = questionTypeMeta(question.type);
  const TypeIcon = meta.icon;
  const isChoice = CHOICE_TYPES.includes(question.type);
  const options = question.options ?? [];

  const setOptions = (next: { label: string; position: number }[]) =>
    onUpdateQuestion({ options: next });

  return (
    <aside className="flex w-[320px] shrink-0 select-none flex-col gap-2 px-4 pb-4 pt-1">
      <div className="flex min-h-0 flex-1 flex-col overflow-y-auto rounded-xl bg-panel p-4">
        {/* Question / Video source */}
        <div className="mb-4">
          <span className="mb-2 flex items-center gap-1.5 text-[15px] font-medium text-ink">
            Question
            <HelpCircle className="h-[15px] w-[15px] text-faint" />
          </span>
          <div className="flex items-center gap-1 rounded-lg bg-white p-1">
            <span className="flex flex-1 items-center justify-center gap-2 rounded-md bg-panel py-2 text-[14px] text-ink">
              <TypeIcon className="h-4 w-4" />
              <span>Text</span>
            </span>
            <button
              disabled
              title="Video questions — coming soon"
              className="flex flex-1 items-center justify-center gap-2 rounded-md py-2 text-[14px] text-faint"
            >
              <Video className="h-4 w-4" />
              <span>Video</span>
            </button>
          </div>
        </div>

        {/* Answer type as a dropdown, matching Typeform's inspector */}
        <span className="mb-2 text-[15px] font-medium text-ink">Answer</span>
        <div className="relative mb-1" ref={typeMenuRef}>
          <button
            onClick={() => setTypeMenuOpen(!typeMenuOpen)}
            className="flex w-full items-center justify-between rounded-lg bg-white px-3 py-2.5 text-[15px] text-ink"
          >
            <span className="flex items-center gap-2.5">
              <span className="flex h-6 w-8 items-center justify-center rounded bg-chip text-chip-ink">
                <TypeIcon className="h-3.5 w-3.5" />
              </span>
              <span>{meta.label}</span>
            </span>
            <ChevronDown className="h-4 w-4 text-muted" />
          </button>

          {typeMenuOpen && (
            <div className="animate-fade-in absolute left-0 right-0 top-full z-40 mt-1 max-h-72 overflow-y-auto rounded-xl border border-hair bg-white py-1.5 shadow-[0_8px_28px_rgba(0,0,0,0.12)]">
              {QUESTION_TYPES.map(({ type, label, icon: Icon }) => (
                <button
                  key={type}
                  onClick={() => {
                    setTypeMenuOpen(false);
                    onUpdateQuestion({ type: type as QuestionType });
                  }}
                  className={`flex w-full items-center gap-2.5 px-3 py-2 text-left text-[15px] transition-colors hover:bg-panel ${
                    question.type === type ? "text-ink" : "text-muted"
                  }`}
                >
                  <span className="flex h-6 w-8 items-center justify-center rounded bg-chip text-chip-ink">
                    <Icon className="h-3.5 w-3.5" />
                  </span>
                  <span>{label}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        <ToggleRow
          label="Required"
          checked={question.is_required}
          onChange={(value) => onUpdateQuestion({ is_required: value })}
        />

        {question.type === "rating" && (
          <div className="border-t border-[#e2e2e5] py-3">
            <div className="mb-2 flex items-center justify-between text-[15px] text-ink">
              <span>Scale</span>
              <span className="text-[14px] text-muted">1 – {ratingMax(question)}</span>
            </div>
            <input
              type="range"
              min={MIN_RATING_MAX}
              max={MAX_RATING_MAX}
              value={ratingMax(question)}
              onChange={(event) =>
                onUpdateQuestion({
                  settings: { ...question.settings, rating_max: Number(event.target.value) },
                })
              }
              className="w-full accent-[#2f2a33]"
            />
          </div>
        )}

        {isChoice && (
          <div className="border-t border-[#e2e2e5] pt-3">
            <span className="mb-2 block text-[15px] font-medium text-ink">Options</span>

            <div className="space-y-1.5">
              {options.map((option, index) => (
                <div key={option.id || index} className="flex items-center gap-1.5">
                  <span className="w-4 text-[13px] text-muted">{index + 1}</span>
                  <input
                    type="text"
                    value={option.label}
                    onChange={(event) => {
                      const next = [...options];
                      next[index] = { ...next[index], label: event.target.value };
                      setOptions(next);
                    }}
                    className="flex-1 rounded-md bg-white px-2.5 py-1.5 text-[14px] text-ink focus:outline-none"
                  />
                  <button
                    onClick={() => setOptions(options.filter((_, i) => i !== index))}
                    aria-label={`Remove ${option.label}`}
                    className="rounded p-1 text-muted transition-colors hover:text-[#c0392b]"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>

            <div className="mt-2 flex items-center gap-1.5">
              <input
                type="text"
                value={newOption}
                onChange={(event) => setNewOption(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key !== "Enter" || !newOption.trim()) return;
                  setOptions([...options, { label: newOption.trim(), position: options.length }]);
                  setNewOption("");
                }}
                placeholder="Add option"
                className="flex-1 rounded-md bg-white px-2.5 py-1.5 text-[14px] text-ink placeholder:text-faint focus:outline-none"
              />
              <button
                onClick={() => {
                  if (!newOption.trim()) return;
                  setOptions([...options, { label: newOption.trim(), position: options.length }]);
                  setNewOption("");
                }}
                aria-label="Add option"
                className="rounded-md bg-chrome p-1.5 text-white transition-colors hover:bg-chrome-hover active:bg-chrome-pressed"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        <ToggleRow label="Max characters" disabled hint />
        <ToggleRow label="Answer validation" disabled hint />
        <ToggleRow label="Custom placeholder text" disabled hint />

        <div className="border-t border-[#e2e2e5]">
          <ToggleRow label="Map to contacts" disabled hint />
        </div>

        <div className="flex items-center justify-between border-t border-[#e2e2e5] py-3">
          <span className="text-[15px] font-medium text-ink">Image or video</span>
          <button
            disabled
            title="Coming soon"
            className="flex h-7 w-7 items-center justify-center rounded-md bg-white text-faint"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>
      </div>

      <PanelRow label="Logic" />
      <PanelRow label="Comments" premium />
    </aside>
  );
}

function ToggleRow({
  label,
  checked = false,
  onChange,
  disabled,
  hint,
}: {
  label: string;
  checked?: boolean;
  onChange?: (value: boolean) => void;
  disabled?: boolean;
  hint?: boolean;
}) {
  return (
    <div className="flex items-center justify-between py-3">
      <span
        className={`flex items-center gap-1.5 text-[15px] ${disabled ? "text-muted" : "text-ink"}`}
      >
        {label}
        {hint && <HelpCircle className="h-[15px] w-[15px] text-faint" />}
      </span>
      <button
        role="switch"
        aria-checked={checked}
        aria-label={label}
        disabled={disabled}
        title={disabled ? `${label} — coming soon` : undefined}
        onClick={() => onChange?.(!checked)}
        className={`flex h-[22px] w-[38px] shrink-0 items-center rounded-full p-[3px] transition-colors ${
          checked ? "justify-end bg-chrome" : "justify-start bg-[#c9c9cf]"
        } disabled:opacity-50`}
      >
        <span className="h-4 w-4 rounded-full bg-white shadow-sm" />
      </button>
    </div>
  );
}

function PanelRow({ label, premium }: { label: string; premium?: boolean }) {
  return (
    <div className="flex items-center justify-between rounded-xl bg-panel px-4 py-3.5">
      <span className="flex items-center gap-2 text-[15px] font-medium text-ink">
        {label}
        {premium && (
          <span className="rounded border border-[#a7d4c6] px-1.5 py-0.5 text-[11px] text-brand-green">
            Pro
          </span>
        )}
      </span>
      <button
        disabled
        title={`${label} — coming soon`}
        className="flex h-7 w-7 items-center justify-center rounded-md bg-white text-faint"
      >
        <Plus className="h-4 w-4" />
      </button>
    </div>
  );
}
