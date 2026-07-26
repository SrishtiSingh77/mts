"use client";

import { Check } from "lucide-react";

import { AnswerInputProps } from "../types";

const ADVANCE_DELAY_MS = 320;
const CHOICES = ["Yes", "No"] as const;

export default function YesNoAnswerInput({
  value,
  onChange,
  onAdvance,
  disabled,
  accent,
}: AnswerInputProps) {
  const select = (choice: string) => {
    onChange(choice);
    if (onAdvance) setTimeout(onAdvance, ADVANCE_DELAY_MS);
  };

  return (
    <div className="max-w-[280px] space-y-2.5">
      {CHOICES.map((choice) => {
        const isSelected = value === choice;
        return (
          <button
            key={choice}
            type="button"
            disabled={disabled}
            onClick={() => select(choice)}
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
                {choice.charAt(0)}
              </span>
              <span>{choice}</span>
            </span>
            {isSelected && <Check className="h-[18px] w-[18px]" style={{ color: accent }} />}
          </button>
        );
      })}
    </div>
  );
}
