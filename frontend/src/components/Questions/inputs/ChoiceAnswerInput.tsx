"use client";

import { Check } from "lucide-react";

import { AnswerInputProps } from "../types";

/** Delay so the selected state is visible before the slide transition. */
const ADVANCE_DELAY_MS = 320;

export default function ChoiceAnswerInput({
  question,
  value,
  onChange,
  onAdvance,
  disabled,
  accent,
}: AnswerInputProps) {
  if (!question.options.length) {
    return <p className="text-[15px] text-faint">Add options in the settings panel</p>;
  }

  const select = (label: string) => {
    onChange(label);
    if (onAdvance) setTimeout(onAdvance, ADVANCE_DELAY_MS);
  };

  return (
    <div className="max-w-[560px] space-y-2.5">
      {question.options.map((option, index) => {
        const isSelected = value === option.label;
        return (
          <button
            key={option.id || index}
            type="button"
            disabled={disabled}
            onClick={() => select(option.label)}
            style={
              isSelected
                ? { borderColor: accent, backgroundColor: `${accent}12`, color: accent }
                : { borderColor: `${accent}55` }
            }
            className="flex w-full items-center justify-between rounded-md border bg-white px-4 py-3 text-left text-[17px] text-ink transition-colors hover:bg-black/[0.02] disabled:cursor-not-allowed"
          >
            <span className="flex items-center gap-3">
              <span
                style={
                  isSelected
                    ? { backgroundColor: accent, borderColor: accent, color: "#fff" }
                    : { borderColor: `${accent}55`, color: accent }
                }
                className="flex h-6 w-6 items-center justify-center rounded border text-[13px] font-medium"
              >
                {String.fromCharCode(65 + index)}
              </span>
              <span>{option.label}</span>
            </span>
            {isSelected && <Check className="h-[18px] w-[18px]" style={{ color: accent }} />}
          </button>
        );
      })}
    </div>
  );
}
