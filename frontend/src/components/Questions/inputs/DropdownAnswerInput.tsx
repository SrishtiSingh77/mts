"use client";

import { AnswerInputProps } from "../types";

export default function DropdownAnswerInput({
  question,
  value,
  onChange,
  disabled,
  accent,
}: AnswerInputProps) {
  return (
    <div className="max-w-md">
      <select
        value={value}
        disabled={disabled}
        onChange={(event) => onChange(event.target.value)}
        style={{ borderColor: disabled ? undefined : accent }}
        className="shadow-xs w-full rounded-2xl border-2 bg-white px-4 py-3.5 text-sm font-semibold text-gray-900 focus:outline-none disabled:cursor-not-allowed disabled:border-gray-300 disabled:text-gray-400"
      >
        <option value="">Select an option...</option>
        {question.options.map((option, index) => (
          <option key={option.id || index} value={option.label}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}
