"use client";

import { Clock, Users } from "lucide-react";

import { accentOf, themeStyles } from "@/lib/theme";
import { Form } from "@/types";
import PoweredByFooter from "./PoweredByFooter";

interface WelcomeScreenProps {
  form: Form;
  onStart: () => void;
}

export default function WelcomeScreen({ form, onStart }: WelcomeScreenProps) {
  const accent = accentOf(form.theme);
  const questionCount = form.questions?.length ?? 0;
  const minutes = Math.max(1, Math.round(questionCount * 0.25));

  // Blank welcome copy falls back to the form's own title and description.
  const title = form.welcome.title.trim() || form.title;
  const description = form.welcome.description.trim() || form.description || "";

  return (
    <div style={themeStyles(form.theme)} className="flex min-h-screen flex-col">
      <div className="flex flex-1 items-center px-6 sm:px-[12%]">
        <div className="animate-fade-in w-full max-w-[820px]">
          <h1 className="text-[32px] leading-tight text-ink sm:text-[40px]">{title}</h1>

          {description && (
            <p className="mt-4 max-w-[620px] text-[18px] leading-relaxed text-muted">
              {description}
            </p>
          )}

          <div className="mt-9 flex items-center gap-4">
            <button
              onClick={onStart}
              style={{ backgroundColor: accent }}
              className="rounded-md px-7 py-3 text-[17px] font-medium text-white transition-opacity hover:opacity-90 active:scale-[0.98]"
            >
              {form.welcome.button_label || "Start"}
            </button>
            <span className="hidden text-[13px] text-muted sm:inline">
              press <span className="font-bold text-ink">Enter ↵</span>
            </span>
          </div>

          {/* Both meta lines are opt-in from the welcome screen settings. */}
          {(form.welcome.show_time || form.welcome.show_submissions) && (
            <div className="mt-6 flex items-center gap-4 text-[13px] text-muted">
              {form.welcome.show_time && (
                <span className="flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5" />
                  <span>Takes {minutes} minute{minutes === 1 ? "" : "s"}</span>
                </span>
              )}
              {form.welcome.show_submissions && (
                <span className="flex items-center gap-1.5">
                  <Users className="h-3.5 w-3.5" />
                  <span>
                    {form.response_count} submission{form.response_count === 1 ? "" : "s"}
                  </span>
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      <footer className="flex justify-end px-6 pb-6 sm:px-12">
        <PoweredByFooter />
      </footer>
    </div>
  );
}
