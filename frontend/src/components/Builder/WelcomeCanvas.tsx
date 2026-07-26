"use client";

import { Clock, Users } from "lucide-react";

import { accentOf } from "@/lib/theme";
import { Form, FormWelcome } from "@/types";

interface WelcomeCanvasProps {
  form: Form;
  onWelcomeChange: (patch: Partial<FormWelcome>) => void;
}

/** Centre-aligned editable welcome screen, matching Typeform's canvas. */
export default function WelcomeCanvas({ form, onWelcomeChange }: WelcomeCanvasProps) {
  const { welcome } = form;
  const accent = accentOf(form.theme);
  const questionCount = form.questions?.length ?? 0;
  const minutes = Math.max(1, Math.round(questionCount * 0.25));

  return (
    <div className="flex min-h-full flex-col items-center justify-center px-[8%] py-24 text-center">
      <input
        type="text"
        value={welcome.title}
        onChange={(event) => onWelcomeChange({ title: event.target.value })}
        placeholder="Say hi! Recall information with @"
        aria-label="Welcome headline"
        className="w-full bg-transparent text-center text-[28px] leading-snug text-ink placeholder:italic placeholder:text-faint focus:outline-none"
      />

      <input
        type="text"
        value={welcome.description}
        onChange={(event) => onWelcomeChange({ description: event.target.value })}
        placeholder="Description (optional)"
        aria-label="Welcome description"
        className="mt-1 w-full bg-transparent text-center text-[17px] text-muted placeholder:italic placeholder:text-faint focus:outline-none"
      />

      <button
        disabled
        style={{ backgroundColor: accent }}
        className="mt-9 rounded-md px-6 py-2.5 text-[17px] font-medium text-white"
      >
        {welcome.button_label || "Start"}
      </button>

      <div className="mt-4 flex items-center gap-4 text-[13px] text-muted">
        {welcome.show_time && (
          <span className="flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5" />
            <span>Takes {minutes} minute{minutes === 1 ? "" : "s"}</span>
          </span>
        )}
        {welcome.show_submissions && (
          <span className="flex items-center gap-1.5">
            <Users className="h-3.5 w-3.5" />
            <span>
              {form.response_count} submission{form.response_count === 1 ? "" : "s"}
            </span>
          </span>
        )}
      </div>
    </div>
  );
}
