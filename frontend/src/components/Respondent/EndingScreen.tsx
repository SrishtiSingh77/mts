"use client";

import { Check, RotateCcw } from "lucide-react";

import SocialShareIcons from "@/components/SocialShareIcons";
import { accentOf, themeStyles } from "@/lib/theme";
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
  const accent = accentOf(form.theme);

  return (
    <div style={themeStyles(form.theme)} className="flex min-h-screen flex-col">
      <div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
        <div className="animate-fade-in max-w-[560px]">
          <span
            className="mx-auto flex h-[68px] w-[68px] items-center justify-center rounded-full border-2"
            style={{ borderColor: accent, color: accent }}
          >
            <Check className="h-9 w-9 stroke-[2.5]" />
          </span>

          <h1 className="mt-7 text-[28px] leading-snug text-ink">{ending.title}</h1>
          <p className="mt-2 text-[17px] text-muted">{ending.description}</p>

          {ending.show_social && <SocialShareIcons className="mt-7" />}

          <div className="mt-8 flex items-center justify-center gap-3">
            {ending.show_button && (
              <button
                onClick={onPrimaryAction}
                style={{ backgroundColor: accent }}
                className="rounded-md px-6 py-3 text-[15px] font-medium text-white transition-opacity hover:opacity-90"
              >
                {ending.button_label}
              </button>
            )}

            <button
              onClick={onSubmitAnother}
              className="flex items-center gap-2 rounded-md border border-hair bg-white px-5 py-3 text-[15px] text-ink transition-colors hover:bg-panel"
            >
              <RotateCcw className="h-4 w-4" />
              <span>Submit another response</span>
            </button>
          </div>
        </div>
      </div>

      <footer className="flex justify-end px-6 pb-6 sm:px-12">
        <PoweredByFooter />
      </footer>
    </div>
  );
}
