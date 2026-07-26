"use client";

import { ChevronDown, HelpCircle, Plus, Trash2 } from "lucide-react";

import { FormWelcome, WELCOME_BUTTON_MAX_LENGTH } from "@/types";

interface WelcomeInspectorProps {
  welcome: FormWelcome;
  onWelcomeChange: (patch: Partial<FormWelcome>) => void;
  onRemove: () => void;
}

/** Right-hand settings for the welcome screen page. */
export default function WelcomeInspector({
  welcome,
  onWelcomeChange,
  onRemove,
}: WelcomeInspectorProps) {
  return (
    <aside className="flex w-[320px] shrink-0 select-none flex-col gap-2 px-4 pb-4 pt-1">
      <div className="flex min-h-0 flex-1 flex-col overflow-y-auto rounded-xl bg-panel p-4">
        <div className="mb-4 flex w-full items-center justify-between rounded-lg bg-white px-3 py-2.5 text-[15px] text-ink">
          <span className="flex items-center gap-2.5">
            <span className="flex h-6 w-8 items-center justify-center rounded bg-chip text-chip-ink">
              <span className="text-[11px] font-bold">◑</span>
            </span>
            <span>Welcome Screen</span>
          </span>
          <ChevronDown className="h-4 w-4 text-muted" />
        </div>

        <ToggleRow
          label="Time to complete"
          hint
          checked={welcome.show_time}
          onChange={(value) => onWelcomeChange({ show_time: value })}
        />
        <ToggleRow
          label="Number of submissions"
          hint
          checked={welcome.show_submissions}
          onChange={(value) => onWelcomeChange({ show_submissions: value })}
        />

        <div className="border-t border-[#e2e2e5] pt-3">
          <span className="mb-2 block text-[15px] font-medium text-ink">Button</span>
          <input
            type="text"
            value={welcome.button_label}
            maxLength={WELCOME_BUTTON_MAX_LENGTH}
            onChange={(event) => onWelcomeChange({ button_label: event.target.value })}
            placeholder="Start"
            aria-label="Welcome button label"
            className="w-full rounded-lg bg-white px-3 py-2.5 text-[15px] text-ink placeholder:text-faint focus:outline-none"
          />
          <p className="mt-1 text-right text-[12px] text-muted">
            {welcome.button_label.length}/{WELCOME_BUTTON_MAX_LENGTH}
          </p>
        </div>

        <div className="flex items-center justify-between border-t border-[#e2e2e5] py-3">
          <span className="text-[15px] font-medium text-ink">Image or video</span>
          <button
            disabled
            title="Coming soon"
            className="flex h-7 w-7 items-center justify-center rounded-md bg-white text-faint"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>

        <button
          onClick={onRemove}
          className="mt-2 flex items-center gap-2 rounded-lg px-1 py-2 text-left text-[15px] text-[#c0392b] transition-colors hover:bg-[#fdf2f1]"
        >
          <Trash2 className="h-4 w-4" />
          <span>Remove welcome screen</span>
        </button>
      </div>
    </aside>
  );
}

function ToggleRow({
  label,
  checked,
  onChange,
  hint,
}: {
  label: string;
  checked: boolean;
  onChange: (value: boolean) => void;
  hint?: boolean;
}) {
  return (
    <div className="flex items-center justify-between py-3">
      <span className="flex items-center gap-1.5 text-[15px] text-ink">
        {label}
        {hint && <HelpCircle className="h-[15px] w-[15px] text-faint" />}
      </span>
      <button
        role="switch"
        aria-checked={checked}
        aria-label={label}
        onClick={() => onChange(!checked)}
        className={`flex h-[22px] w-[38px] shrink-0 items-center rounded-full p-[3px] transition-colors ${
          checked ? "justify-end bg-chrome" : "justify-start bg-[#c9c9cf]"
        }`}
      >
        <span className="h-4 w-4 rounded-full bg-white shadow-sm" />
      </button>
    </div>
  );
}
