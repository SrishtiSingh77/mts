"use client";

import { ArrowRight } from "lucide-react";

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
    <div
      style={themeStyles(form.theme)}
      className="flex min-h-screen flex-col justify-between p-8"
    >
      <div className="animate-fade-in mx-auto flex max-w-2xl flex-1 flex-col items-center justify-center space-y-6 text-center">
        <div
          style={{ backgroundColor: accent }}
          className="flex h-16 w-16 items-center justify-center rounded-2xl text-2xl font-bold text-white shadow-lg"
        >
          {form.title.charAt(0).toUpperCase()}
        </div>

        <h1 className="text-3xl font-extrabold leading-tight text-gray-900">{form.title}</h1>

        {form.description && (
          <p className="max-w-lg text-base leading-relaxed text-gray-600">{form.description}</p>
        )}

        <button
          onClick={onStart}
          className="flex cursor-pointer items-center space-x-2 rounded-2xl bg-[#262627] px-8 py-3.5 text-base font-semibold text-white shadow-lg transition-all hover:bg-black active:scale-95"
        >
          <span>Start</span>
          <ArrowRight className="h-5 w-5" />
        </button>

        <p className="text-xs text-gray-400">
          {questionCount} question{questionCount === 1 ? "" : "s"} · takes about{" "}
          {Math.max(1, Math.round(questionCount * 0.25))} min
        </p>
      </div>

      <footer className="flex items-center justify-center border-t border-gray-100 py-4">
        <PoweredByFooter />
      </footer>
    </div>
  );
}
