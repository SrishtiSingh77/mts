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
    <select
      value={value}
      disabled={disabled}
      onChange={(event) => onChange(event.target.value)}
      style={{ borderBottomColor: disabled ? "#d4d4d8" : accent }}
      className="w-full max-w-[560px] appearance-none border-b-2 bg-transparent pb-2 text-[26px] text-ink focus:outline-none disabled:cursor-not-allowed"
    >
      <option value="">Type or select an option</option>
      {question.options.map((option, index) => (
        <option key={option.id || index} value={option.label}>
          {option.label}
        </option>
      ))}
    </select>
  );
}
