"use client";

import { Check, RotateCcw } from "lucide-react";

import { themeStyles } from "@/lib/theme";
import { Form } from "@/types";
import PoweredByFooter from "./PoweredByFooter";

interface EndingScreenProps {
  form: Form;
  onPrimaryAction: () => void;
  onSubmitAnother: () => void;
}

/** Thank-you screen; all copy comes from the form's ending settings. */
export default function EndingScreen({
  form,
  onPrimaryAction,
  onSubmitAnother,
}: EndingScreenProps) {
  const { ending } = form;

  return (
    <div style={themeStyles(form.theme)} className="flex min-h-screen flex-col justify-between p-8">
      <div className="animate-fade-in mx-auto flex max-w-lg flex-1 flex-col items-center justify-center space-y-6 text-center">
        <div className="shadow-xs flex h-20 w-20 items-center justify-center rounded-full border-2 border-gray-900 text-gray-900">
          <Check className="h-10 w-10 stroke-[2.5]" />
        </div>

        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-gray-900">{ending.title}</h1>
          <p className="text-sm font-medium text-gray-600">{ending.description}</p>
        </div>

        <div className="flex items-center space-x-3">
          {ending.show_button && (
            <button
              onClick={onPrimaryAction}
              className="cursor-pointer rounded-xl bg-[#262627] px-6 py-3 text-xs font-semibold text-white shadow-md transition-all hover:bg-black active:scale-95"
            >
              {ending.button_label}
            </button>
          )}

          <button
            onClick={onSubmitAnother}
            className="shadow-2xs flex cursor-pointer items-center space-x-1.5 rounded-xl border border-gray-200 bg-white px-4 py-3 text-xs font-semibold text-gray-700 transition-all hover:border-gray-300"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Submit another response</span>
          </button>
        </div>
      </div>

      <footer className="flex items-center justify-center border-t border-gray-100 py-4">
        <PoweredByFooter />
      </footer>
    </div>
  );
}
