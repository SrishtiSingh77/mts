"use client";

import { Star } from "lucide-react";

import { ratingMax } from "@/lib/validation";
import { AnswerInputProps } from "../types";

export default function RatingAnswerInput({
  question,
  value,
  onChange,
  disabled,
  accent,
}: AnswerInputProps) {
  const max = ratingMax(question);
  const current = Number(value) || 0;

  return (
    <div className="flex flex-wrap items-center gap-2.5">
      {Array.from({ length: max }, (_, index) => index + 1).map((step) => {
        const isFilled = current >= step;
        return (
          <button
            key={step}
            type="button"
            disabled={disabled}
            onClick={() => onChange(String(step))}
            aria-label={`Rate ${step} out of ${max}`}
            style={{ color: isFilled ? accent : "#c9c9cf" }}
            className="transition-transform hover:scale-110 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            <Star className={`h-9 w-9 ${isFilled ? "fill-current" : ""}`} />
          </button>
        );
      })}
      <span className="ml-2 text-[15px] text-muted">
        {current ? `${current} of ${max}` : `1 – ${max}`}
      </span>
    </div>
  );
}
