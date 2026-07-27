"use client";

import { ChevronDown, Gem, Plus } from "lucide-react";

import { FormEnding, WELCOME_BUTTON_MAX_LENGTH } from "@/types";

interface EndingInspectorProps {
  ending: FormEnding;
  onEndingChange: (patch: Partial<FormEnding>) => void;
}

/** Right-hand settings for the ending (thank-you) screen page. */
export default function EndingInspector({ ending, onEndingChange }: EndingInspectorProps) {
  return (
    <aside className="flex w-[320px] shrink-0 select-none flex-col gap-2 px-4 pb-4 pt-1">
      <div className="flex min-h-0 flex-1 flex-col overflow-y-auto rounded-xl bg-panel p-4">
        <div className="mb-4 flex w-full items-center justify-between rounded-lg bg-surface px-3 py-2.5 text-[15px] text-ink">
          <span className="flex items-center gap-2.5">
            <span className="flex h-6 w-8 items-center justify-center rounded bg-chip text-chip-ink">
              <span className="text-[11px] font-bold">◐</span>
            </span>
            <span>End Screen</span>
          </span>
          <ChevronDown className="h-4 w-4 text-muted" />
        </div>

        <ToggleRow
          label="Social share icons"
          checked={ending.show_social}
          onChange={(value) => onEndingChange({ show_social: value })}
        />

        <ToggleRow
          label="Button"
          checked={ending.show_button}
          onChange={(value) => onEndingChange({ show_button: value })}
        />

        {ending.show_button && (
          <div className="pb-3">
            <input
              type="text"
              value={ending.button_label}
              maxLength={WELCOME_BUTTON_MAX_LENGTH}
              onChange={(event) => onEndingChange({ button_label: event.target.value })}
              placeholder="Create a typeform"
              aria-label="Ending button label"
              className="w-full rounded-lg bg-surface px-3 py-2.5 text-[15px] text-ink placeholder:text-faint focus:outline-none"
            />
            <p className="mt-1 text-right text-[12px] text-muted">
              {ending.button_label.length}/{WELCOME_BUTTON_MAX_LENGTH}
            </p>
          </div>
        )}

        <div className="flex items-center justify-between border-t border-[#e2e2e5] py-3">
          <span className="flex items-center gap-2 text-[15px] text-muted">
            <span>Button link</span>
            <Gem className="h-4 w-4 text-[#a7d4c6]" />
          </span>
          <button
            role="switch"
            aria-checked={false}
            aria-label="Button link"
            disabled
            title="Custom redirect — coming soon"
            className="flex h-[22px] w-[38px] shrink-0 items-center justify-start rounded-full bg-[#c9c9cf] p-[3px] opacity-50"
          >
            <span className="h-4 w-4 rounded-full bg-surface shadow-sm" />
          </button>
        </div>

        <div className="flex items-center justify-between border-t border-[#e2e2e5] py-3">
          <span className="text-[15px] font-medium text-ink">Image or video</span>
          <button
            disabled
            title="Coming soon"
            className="flex h-7 w-7 items-center justify-center rounded-md bg-surface text-faint"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}

function ToggleRow({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between py-3">
      <span className="text-[15px] text-ink">{label}</span>
      <button
        role="switch"
        aria-checked={checked}
        aria-label={label}
        onClick={() => onChange(!checked)}
        className={`flex h-[22px] w-[38px] shrink-0 items-center rounded-full p-[3px] transition-colors ${
          checked ? "justify-end bg-chrome" : "justify-start bg-[#c9c9cf]"
        }`}
      >
        <span className="h-4 w-4 rounded-full bg-surface shadow-sm" />
      </button>
    </div>
  );
}
