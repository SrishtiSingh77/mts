"use client";

import { Mic, Monitor, Plus, Send, Smartphone } from "lucide-react";
import { useState } from "react";

import QuestionInput from "@/components/Questions/QuestionInput";
import { accentOf, themeStyles } from "@/lib/theme";
import { FormTheme, Question } from "@/types";

interface BuilderCanvasProps {
  question: Question | null;
  questionNumber: number;
  theme: FormTheme;
  onUpdateQuestion: (updated: Partial<Question>) => void;
  onAddQuestion: () => void;
}

export default function BuilderCanvas({
  question,
  questionNumber,
  theme,
  onUpdateQuestion,
  onAddQuestion,
}: BuilderCanvasProps) {
  const [viewMode, setViewMode] = useState<"desktop" | "mobile">("desktop");

  if (!question) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center bg-gray-50/50 p-8">
        <p className="text-sm text-gray-400">No question selected.</p>
      </div>
    );
  }

  const accent = accentOf(theme);

  return (
    <div className="relative flex flex-1 select-none flex-col justify-between overflow-hidden bg-[#fbfbfb]">
      {/* Top toolbar */}
      <div className="flex h-12 items-center justify-between border-b border-gray-200/80 bg-white px-6">
        <button
          onClick={onAddQuestion}
          className="shadow-2xs flex items-center space-x-1.5 rounded-lg bg-[#262627] px-3 py-1.5 text-xs font-semibold text-white transition-all hover:bg-black"
        >
          <Plus className="h-3.5 w-3.5" />
          <span>Add content</span>
        </button>

        <div className="flex items-center space-x-1 rounded-lg border border-gray-200 bg-gray-50 p-0.5">
          {[
            { mode: "desktop" as const, icon: Monitor },
            { mode: "mobile" as const, icon: Smartphone },
          ].map(({ mode, icon: Icon }) => (
            <button
              key={mode}
              onClick={() => setViewMode(mode)}
              aria-label={`${mode} preview`}
              className={`rounded p-1 transition-colors ${
                viewMode === mode
                  ? "shadow-2xs bg-white font-semibold text-gray-900"
                  : "text-gray-400 hover:text-gray-600"
              }`}
            >
              <Icon className="h-4 w-4" />
            </button>
          ))}
        </div>
      </div>

      {/* Live preview — same inputs the respondent sees, rendered inert */}
      <div className="flex flex-1 items-center justify-center overflow-y-auto p-8">
        <div
          style={themeStyles(theme)}
          className={`transition-all duration-300 ${
            viewMode === "mobile"
              ? "flex h-[640px] w-[360px] flex-col justify-center rounded-[32px] border-[8px] border-gray-900 p-6 shadow-2xl"
              : "w-full max-w-2xl space-y-6 rounded-2xl border border-gray-200/90 p-10 shadow-lg"
          }`}
        >
          <div className="space-y-2">
            <div className="flex items-start space-x-2">
              <span className="text-lg font-bold leading-tight" style={{ color: accent }}>
                {questionNumber} →
              </span>
              <input
                type="text"
                value={question.title}
                onChange={(event) => onUpdateQuestion({ title: event.target.value })}
                placeholder="Write your question here..."
                className="w-full border-b border-transparent bg-transparent py-0.5 text-xl font-semibold text-gray-900 transition-all hover:border-gray-200 focus:border-purple-500 focus:outline-none"
              />
              {question.is_required && <span className="text-lg font-bold text-red-500">*</span>}
            </div>

            <input
              type="text"
              value={question.description || ""}
              onChange={(event) => onUpdateQuestion({ description: event.target.value })}
              placeholder="Description (optional)"
              className="w-full border-b border-transparent bg-transparent py-0.5 pl-7 text-sm text-gray-500 transition-all hover:border-gray-200 focus:border-purple-500 focus:outline-none"
            />
          </div>

          <div className="pl-7 pt-2">
            <QuestionInput
              question={question}
              value=""
              accent={accent}
              disabled
              onChange={() => undefined}
            />
          </div>
        </div>
      </div>

      {/* Placeholder AI composer */}
      <div className="flex justify-center p-4">
        <div className="flex w-full max-w-md items-center justify-between rounded-full border border-purple-200 bg-white p-2 shadow-lg">
          <div className="flex items-center space-x-2 pl-3 text-xs text-gray-500">
            <Mic className="h-4 w-4 text-purple-600" />
            <input
              type="text"
              placeholder="Chat to create... (coming soon)"
              disabled
              className="w-64 border-none bg-transparent text-xs text-gray-700 outline-none placeholder:text-gray-400"
            />
          </div>
          <button
            disabled
            className="flex h-7 w-7 items-center justify-center rounded-full bg-purple-600 text-white transition-colors hover:bg-purple-700 disabled:opacity-60"
          >
            <Send className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
