"use client";

import { Star } from "lucide-react";

import { ratingMax } from "@/lib/validation";
import { AnswerInputProps } from "../types";

export default function RatingAnswerInput({ question, value, onChange, disabled }: AnswerInputProps) {
  const max = ratingMax(question);
  const current = Number(value) || 0;

  return (
    <div className="flex flex-wrap items-center gap-2 pt-2">
      {Array.from({ length: max }, (_, index) => index + 1).map((step) => {
        const isFilled = current >= step;
        return (
          <button
            key={step}
            type="button"
            disabled={disabled}
            onClick={() => onChange(String(step))}
            aria-label={`Rate ${step} out of ${max}`}
            className={`flex h-12 w-12 items-center justify-center rounded-2xl border-2 transition-all disabled:cursor-not-allowed ${
              isFilled
                ? "scale-105 border-amber-400 bg-amber-50 text-amber-500"
                : "border-gray-200 bg-white text-gray-300 hover:border-amber-300"
            }`}
          >
            <Star className={`h-6 w-6 ${isFilled ? "fill-amber-400 text-amber-400" : ""}`} />
          </button>
        );
      })}
    </div>
  );
}
