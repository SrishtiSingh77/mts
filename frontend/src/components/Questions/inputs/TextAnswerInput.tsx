"use client";

import { questionTypeMeta } from "@/lib/questionTypes";
import { AnswerInputProps } from "../types";

const INPUT_MODES = {
  email: "email",
  number: "decimal",
} as const;

/** Backs short_text, long_text, email and number — they differ only by keyboard and rows. */
export default function TextAnswerInput({
  question,
  value,
  onChange,
  onAdvance,
  disabled,
  accent,
  autoFocus,
}: AnswerInputProps) {
  const { placeholder } = questionTypeMeta(question.type);
  const isMultiline = question.type === "long_text";

  const sharedProps = {
    value,
    disabled,
    autoFocus,
    placeholder,
    onChange: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      onChange(event.target.value),
    className:
      "w-full border-b-2 bg-transparent py-2 text-xl text-gray-900 placeholder-gray-300 focus:outline-none disabled:cursor-not-allowed disabled:border-gray-300 disabled:text-gray-400",
    style: { borderBottomColor: disabled ? undefined : accent },
  };

  if (isMultiline) {
    return (
      <textarea
        {...sharedProps}
        rows={4}
        className={`${sharedProps.className} resize-none text-lg`}
        // Shift+Enter inserts a newline; plain Enter advances, matching Typeform.
        onKeyDown={(event) => {
          if (event.key === "Enter" && !event.shiftKey && onAdvance) {
            event.preventDefault();
            onAdvance();
          }
        }}
      />
    );
  }

  return (
    <input
      {...sharedProps}
      type={question.type === "number" ? "number" : "text"}
      inputMode={INPUT_MODES[question.type as keyof typeof INPUT_MODES]}
    />
  );
}
