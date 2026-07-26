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

  const shared = {
    value,
    disabled,
    autoFocus,
    placeholder,
    onChange: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      onChange(event.target.value),
    // Typeform's answer field is a wide hairline that takes the theme's answer colour.
    style: { borderBottomColor: disabled ? "#d4d4d8" : accent },
    className:
      "w-full max-w-[820px] border-b-2 bg-transparent pb-2 text-[26px] sm:text-[30px] leading-normal text-ink placeholder:text-faint focus:outline-none disabled:cursor-not-allowed",
  };

  if (isMultiline) {
    return (
      <textarea
        {...shared}
        rows={3}
        className={`${shared.className} resize-none`}
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
      {...shared}
      type={question.type === "number" ? "number" : "text"}
      inputMode={INPUT_MODES[question.type as keyof typeof INPUT_MODES]}
    />
  );
}
