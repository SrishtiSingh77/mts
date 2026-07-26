"use client";

import { accentOf } from "@/lib/theme";
import { Form, FormEnding } from "@/types";
import SocialShareIcons from "@/components/SocialShareIcons";

interface EndingCanvasProps {
  form: Form;
  onEndingChange: (patch: Partial<FormEnding>) => void;
}

/** Centre-aligned editable thank-you screen, matching Typeform's canvas. */
export default function EndingCanvas({ form, onEndingChange }: EndingCanvasProps) {
  const { ending } = form;
  const accent = accentOf(form.theme);

  return (
    <div className="flex min-h-full flex-col items-center justify-center px-[8%] py-24 text-center">
      <input
        type="text"
        value={ending.title}
        onChange={(event) => onEndingChange({ title: event.target.value })}
        placeholder="Say bye! Recall information with @"
        aria-label="Ending headline"
        className="w-full bg-transparent text-center text-[28px] leading-snug text-ink placeholder:italic placeholder:text-faint focus:outline-none"
      />

      <input
        type="text"
        value={ending.description}
        onChange={(event) => onEndingChange({ description: event.target.value })}
        placeholder="Description (optional)"
        aria-label="Ending description"
        className="mt-1 w-full bg-transparent text-center text-[17px] text-muted placeholder:italic placeholder:text-faint focus:outline-none"
      />

      {ending.show_social && <SocialShareIcons className="mt-7" />}

      {ending.show_button && (
        <button
          disabled
          style={{ backgroundColor: accent }}
          className="mt-7 rounded-md px-6 py-2.5 text-[17px] font-medium text-white"
        >
          {ending.button_label || "Create a typeform"}
        </button>
      )}
    </div>
  );
}
