"use client";

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

  return (
    <div style={themeStyles(form.theme)} className="flex min-h-screen flex-col">
      <div className="flex flex-1 items-center px-6 sm:px-[12%]">
        <div className="animate-fade-in w-full max-w-[820px]">
          <h1 className="text-[32px] leading-tight text-ink sm:text-[40px]">{form.title}</h1>

          {form.description && (
            <p className="mt-4 max-w-[620px] text-[18px] leading-relaxed text-muted">
              {form.description}
            </p>
          )}

          <div className="mt-9 flex items-center gap-4">
            <button
              onClick={onStart}
              style={{ backgroundColor: accent }}
              className="rounded-md px-7 py-3 text-[17px] font-medium text-white transition-opacity hover:opacity-90 active:scale-[0.98]"
            >
              Start
            </button>
            <span className="hidden text-[13px] text-muted sm:inline">
              press <span className="font-bold text-ink">Enter ↵</span>
            </span>
          </div>

          <p className="mt-6 text-[13px] text-muted">
            {questionCount} question{questionCount === 1 ? "" : "s"} · takes about{" "}
            {Math.max(1, Math.round(questionCount * 0.25))} min
          </p>
        </div>
      </div>

      <footer className="flex justify-end px-6 pb-6 sm:px-12">
        <PoweredByFooter />
      </footer>
    </div>
  );
}
