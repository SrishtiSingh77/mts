"use client";

import { Check } from "lucide-react";

import { AnswerInputProps } from "../types";

/** Auto-advance delay so the selected state is visible before the slide transition. */
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
    return <p className="text-xs text-gray-400">Add options in the right settings panel</p>;
  }

  const select = (label: string) => {
    onChange(label);
    if (onAdvance) setTimeout(onAdvance, ADVANCE_DELAY_MS);
  };

  return (
    <div className="max-w-md space-y-2.5">
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
                ? { borderColor: accent, backgroundColor: `${accent}14`, color: accent }
                : undefined
            }
            className={`flex w-full items-center justify-between rounded-2xl border-2 px-5 py-3.5 text-left text-sm font-semibold transition-all disabled:cursor-not-allowed ${
              isSelected
                ? "shadow-sm"
                : "border-gray-200 bg-white text-gray-800 hover:border-gray-300"
            }`}
          >
            <span className="flex items-center space-x-3">
              <span
                style={isSelected ? { backgroundColor: accent, color: "#fff" } : undefined}
                className={`flex h-6 w-6 items-center justify-center rounded-lg text-xs font-bold ${
                  isSelected ? "" : "bg-gray-100 text-gray-600"
                }`}
              >
                {String.fromCharCode(65 + index)}
              </span>
              <span>{option.label}</span>
            </span>
            {isSelected && <Check className="h-5 w-5 stroke-[3]" style={{ color: accent }} />}
          </button>
        );
      })}
    </div>
  );
}
