"use client";

import { Mic, SendHorizontal } from "lucide-react";

import QuestionInput from "@/components/Questions/QuestionInput";
import { accentOf } from "@/lib/theme";
import { Form, FormEnding, FormTheme, FormWelcome, Question } from "@/types";
import EndingCanvas from "./EndingCanvas";
import WelcomeCanvas from "./WelcomeCanvas";

interface BuilderCanvasProps {
  form: Form;
  question: Question | null;
  questionNumber: number;
  theme: FormTheme;
  viewMode: "desktop" | "mobile";
  /** Renders a screen page instead of a question. */
  showWelcome: boolean;
  showEnding: boolean;
  onUpdateQuestion: (updated: Partial<Question>) => void;
  onWelcomeChange: (patch: Partial<FormWelcome>) => void;
  onEndingChange: (patch: Partial<FormEnding>) => void;
}

export default function BuilderCanvas({
  form,
  question,
  questionNumber,
  theme,
  viewMode,
  showWelcome,
  showEnding,
  onUpdateQuestion,
  onWelcomeChange,
  onEndingChange,
}: BuilderCanvasProps) {
  return (
    <div className="relative flex min-w-0 flex-1 flex-col px-2 pb-4 pt-2">
      <div className="flex min-h-0 flex-1 items-stretch justify-center">
        <div
          className={`w-full overflow-y-auto border border-hair bg-surface/60 transition-all ${
            viewMode === "mobile"
              ? "mx-auto max-w-[400px] rounded-[28px] border-[10px] border-ink"
              : "rounded-md"
          }`}
        >
          {showWelcome ? (
            <div className="min-h-full" style={{ backgroundColor: theme.background }}>
              <WelcomeCanvas form={form} onWelcomeChange={onWelcomeChange} />
            </div>
          ) : showEnding ? (
            <div className="min-h-full" style={{ backgroundColor: theme.background }}>
              <EndingCanvas form={form} onEndingChange={onEndingChange} />
            </div>
          ) : question ? (
            <div
              className={`flex min-h-full flex-col justify-center ${
                viewMode === "mobile" ? "px-6 py-10" : "px-[10%] py-24"
              }`}
              style={{ backgroundColor: theme.background }}
            >
              {/* Question line — number badge then inline-editable title */}
              <div className="flex items-start gap-3">
                <span className="mt-[9px] flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-[5px] bg-inverse text-[12px] font-medium text-on-inverse">
                  {questionNumber}
                </span>

                <div className="min-w-0 flex-1">
                  <input
                    type="text"
                    value={question.title}
                    onChange={(event) => onUpdateQuestion({ title: event.target.value })}
                    placeholder="Your question here. Recall information with @"
                    className="w-full bg-transparent text-[26px] leading-snug text-ink placeholder:italic placeholder:text-faint focus:outline-none"
                  />
                  <input
                    type="text"
                    value={question.description || ""}
                    onChange={(event) => onUpdateQuestion({ description: event.target.value })}
                    placeholder="Description (optional)"
                    className="mt-0.5 w-full bg-transparent text-[17px] text-muted placeholder:italic placeholder:text-faint focus:outline-none"
                  />
                </div>
              </div>

              {/* The live preview is the real respondent input, rendered inert */}
              <div className="mt-8 pl-[34px]">
                <QuestionInput
                  question={question}
                  value=""
                  accent={accentOf(theme)}
                  disabled
                  onChange={() => undefined}
                />
              </div>
            </div>
          ) : (
            <div className="flex min-h-full items-center justify-center">
              <p className="text-[15px] text-faint">Add content to start building this form.</p>
            </div>
          )}
        </div>
      </div>

      {/* Floating AI composer, placeholder only */}
      <div className="pointer-events-none absolute bottom-6 left-1/2 -translate-x-1/2">
        <div className="pointer-events-auto flex w-[calc(100vw-2rem)] max-w-[430px] items-center gap-3 rounded-full border border-[#e0d7f5] bg-surface px-4 py-3 shadow-[0_4px_20px_rgba(0,0,0,0.08)]">
          <Mic className="h-[18px] w-[18px] shrink-0 text-ink" />
          <input
            type="text"
            placeholder="Chat to create"
            disabled
            title="AI form generation — coming soon"
            className="w-full bg-transparent text-[15px] text-ink placeholder:text-muted focus:outline-none"
          />
          <SendHorizontal className="h-[18px] w-[18px] shrink-0 text-faint" />
        </div>
      </div>
    </div>
  );
}
