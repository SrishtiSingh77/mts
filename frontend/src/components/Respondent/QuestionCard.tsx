"use client";

import { AlertCircle } from "lucide-react";

import QuestionInput, { SELF_ADVANCING_TYPES } from "@/components/Questions/QuestionInput";
import { Question } from "@/types";

interface QuestionCardProps {
  question: Question;
  number: number;
  value: string;
  accent: string;
  error: string | null;
  isLast: boolean;
  isSubmitting: boolean;
  onChange: (value: string) => void;
  onAdvance: () => void;
}

export default function QuestionCard({
  question,
  number,
  value,
  accent,
  error,
  isLast,
  isSubmitting,
  onChange,
  onAdvance,
}: QuestionCardProps) {
  // Choice-style questions advance themselves, so they get no OK button.
  const selfAdvancing = SELF_ADVANCING_TYPES.includes(question.type);

  return (
    <div className="w-full">
      {/* Question line — dark number badge, then the question at display size */}
      <div className="flex items-start gap-3">
        <span className="mt-[11px] flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-[5px] bg-ink text-[12px] font-medium text-white">
          {number}
        </span>
        <h2 className="text-[26px] leading-snug text-ink sm:text-[30px]">
          {question.title}
          {question.is_required && <span className="ml-1 text-[#c0392b]">*</span>}
        </h2>
      </div>

      {question.description && (
        <p className="mt-1.5 pl-[34px] text-[17px] text-muted">{question.description}</p>
      )}

      <div className="mt-10 pl-[34px]">
        {error && (
          <div
            role="alert"
            className="animate-fade-in mb-5 flex w-fit items-center gap-2 rounded-md bg-[#fdf2f1] px-3.5 py-2.5 text-[14px] text-[#a8322a]"
          >
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <QuestionInput
          question={question}
          value={value}
          accent={accent}
          autoFocus
          onChange={onChange}
          onAdvance={onAdvance}
        />

        {!selfAdvancing && (
          <div className="mt-9 flex items-center gap-4">
            <button
              onClick={onAdvance}
              disabled={isSubmitting}
              style={{ backgroundColor: accent }}
              className="rounded-md px-6 py-3 text-[17px] font-medium text-white transition-opacity hover:opacity-90 active:scale-[0.98] disabled:opacity-50"
            >
              {isLast ? (isSubmitting ? "Submitting..." : "Submit") : "OK"}
            </button>

            <span className="hidden text-[13px] text-muted sm:inline">
              press <span className="font-bold text-ink">Enter ↵</span>
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
