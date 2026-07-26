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
    <div className="w-full space-y-6">
      <div className="space-y-2">
        <div className="flex items-start space-x-3">
          <span className="pt-0.5 text-xl font-bold sm:text-2xl" style={{ color: accent }}>
            {number} →
          </span>
          <h2 className="text-xl font-bold leading-snug text-gray-900 sm:text-2xl">
            {question.title}
            {question.is_required && <span className="ml-1 font-bold text-red-500">*</span>}
          </h2>
        </div>

        {question.description && (
          <p className="pl-8 text-sm text-gray-500">{question.description}</p>
        )}
      </div>

      {error && (
        <div
          role="alert"
          className="animate-fade-in ml-8 flex items-center space-x-2 rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-xs font-semibold text-red-700"
        >
          <AlertCircle className="h-4 w-4 flex-shrink-0 text-red-600" />
          <span>{error}</span>
        </div>
      )}

      <div className="space-y-8 pl-8 pt-2">
        <QuestionInput
          question={question}
          value={value}
          accent={accent}
          autoFocus
          onChange={onChange}
          onAdvance={onAdvance}
        />

        {!selfAdvancing && (
          <div className="flex items-center space-x-4">
            <button
              onClick={onAdvance}
              disabled={isSubmitting}
              className="flex cursor-pointer items-center space-x-2 rounded-xl bg-[#262627] px-6 py-2.5 text-base font-bold text-white shadow-md transition-all hover:bg-black active:scale-95 disabled:opacity-50"
            >
              <span>{isLast ? (isSubmitting ? "Submitting..." : "Submit ✓") : "OK ✓"}</span>
            </button>

            <span className="hidden text-xs text-gray-400 sm:inline">
              press <span className="font-bold text-gray-600">Enter ↵</span>
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
