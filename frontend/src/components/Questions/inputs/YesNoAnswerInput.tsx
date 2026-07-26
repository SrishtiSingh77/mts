"use client";

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
    <div className="flex max-w-xs items-center space-x-4">
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
                ? { borderColor: accent, backgroundColor: `${accent}14`, color: accent }
                : undefined
            }
            className={`flex flex-1 items-center justify-center space-x-2 rounded-2xl border-2 px-6 py-3.5 text-sm font-bold transition-all disabled:cursor-not-allowed ${
              isSelected
                ? "shadow-sm"
                : "border-gray-200 bg-white text-gray-800 hover:border-gray-300"
            }`}
          >
            <span
              style={isSelected ? { backgroundColor: accent, color: "#fff" } : undefined}
              className={`flex h-6 w-6 items-center justify-center rounded-lg text-xs font-bold ${
                isSelected ? "" : "bg-gray-100 text-gray-600"
              }`}
            >
              {choice.charAt(0)}
            </span>
            <span>{choice}</span>
          </button>
        );
      })}
    </div>
  );
}
