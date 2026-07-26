"use client";

import { Check, Lock, Palette, PartyPopper } from "lucide-react";
import { useState } from "react";

import { FONT_OPTIONS, THEME_PRESETS, accentOf, themeStyles } from "@/lib/theme";
import { Form, FormEnding, FormTheme, ThemeFont } from "@/types";

interface SettingsTabViewProps {
  form: Form;
  onThemeChange: (theme: FormTheme) => void;
  onEndingChange: (ending: FormEnding) => void;
}

const PLACEHOLDERS = [
  "Custom domains",
  "Response notifications",
  "Respondent language",
  "Close form on a date",
];

export default function SettingsTabView({
  form,
  onThemeChange,
  onEndingChange,
}: SettingsTabViewProps) {
  const [theme, setTheme] = useState<FormTheme>(form.theme);
  const [ending, setEnding] = useState<FormEnding>(form.ending);

  const patchTheme = (patch: Partial<FormTheme>) => {
    const next = { ...theme, ...patch };
    setTheme(next);
    onThemeChange(next);
  };

  const patchEnding = (patch: Partial<FormEnding>) => {
    const next = { ...ending, ...patch };
    setEnding(next);
    onEndingChange(next);
  };

  return (
    <div className="flex flex-1 overflow-hidden bg-panel">
      <div className="mx-auto w-full max-w-5xl space-y-6 overflow-y-auto p-8">
        {/* --- Theme --- */}
        <section className="space-y-5 rounded-2xl border border-hair bg-white p-6 shadow-sm">
          <header className="flex items-center space-x-2 border-b border-hair pb-3">
            <Palette className="h-4 w-4 text-ink" />
            <h2 className="text-sm font-bold text-ink">Theme</h2>
          </header>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div className="space-y-5">
              <div className="space-y-2">
                <span className="block text-[11px] font-bold uppercase tracking-wider text-muted">
                  Presets
                </span>
                <div className="grid grid-cols-3 gap-2">
                  {THEME_PRESETS.map((preset) => {
                    const isActive =
                      theme.color === preset.color && theme.background === preset.background;
                    return (
                      <button
                        key={preset.name}
                        onClick={() =>
                          patchTheme({ color: preset.color, background: preset.background })
                        }
                        className={`flex items-center space-x-2 rounded-xl border p-2.5 text-left text-[11px] font-semibold transition-all ${
                          isActive
                            ? "border-ink bg-panel text-ink"
                            : "border-hair text-ink hover:border-[#c9c9cf]"
                        }`}
                      >
                        <span
                          className="h-5 w-5 flex-shrink-0 rounded-full border border-black/10"
                          style={{ backgroundColor: preset.color }}
                        />
                        <span className="truncate">{preset.name}</span>
                        {isActive && <Check className="h-3.5 w-3.5 flex-shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <label className="space-y-1.5">
                  <span className="block text-[11px] font-bold uppercase tracking-wider text-muted">
                    Accent
                  </span>
                  <input
                    type="color"
                    value={theme.color}
                    onChange={(event) => patchTheme({ color: event.target.value })}
                    className="h-9 w-full cursor-pointer rounded-lg border border-hair bg-white p-1"
                  />
                </label>
                <label className="space-y-1.5">
                  <span className="block text-[11px] font-bold uppercase tracking-wider text-muted">
                    Background
                  </span>
                  <input
                    type="color"
                    value={theme.background}
                    onChange={(event) => patchTheme({ background: event.target.value })}
                    className="h-9 w-full cursor-pointer rounded-lg border border-hair bg-white p-1"
                  />
                </label>
              </div>

              <div className="space-y-1.5">
                <span className="block text-[11px] font-bold uppercase tracking-wider text-muted">
                  Font
                </span>
                <div className="flex items-center space-x-2">
                  {FONT_OPTIONS.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => patchTheme({ font: option.value as ThemeFont })}
                      style={{ fontFamily: option.stack }}
                      className={`flex-1 rounded-lg border px-3 py-2 text-xs font-semibold transition-all ${
                        theme.font === option.value
                          ? "border-ink bg-panel text-ink"
                          : "border-hair text-ink hover:border-[#c9c9cf]"
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Live theme preview */}
            <div className="space-y-2">
              <span className="block text-[11px] font-bold uppercase tracking-wider text-muted">
                Preview
              </span>
              <div
                style={themeStyles(theme)}
                className="space-y-4 rounded-2xl border border-hair p-6"
              >
                <div className="flex items-start space-x-2">
                  <span className="text-lg font-bold" style={{ color: accentOf(theme) }}>
                    1 →
                  </span>
                  <p className="text-lg font-bold text-ink">
                    How would you rate this theme?
                  </p>
                </div>
                <div
                  className="ml-7 border-b-2 pb-2 text-sm text-faint"
                  style={{ borderBottomColor: accentOf(theme) }}
                >
                  Type your answer here...
                </div>
                <button
                  className="ml-7 rounded-xl px-5 py-2 text-xs font-bold text-white"
                  style={{ backgroundColor: accentOf(theme) }}
                >
                  OK ✓
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* --- Thank-you screen --- */}
        <section className="space-y-5 rounded-2xl border border-hair bg-white p-6 shadow-sm">
          <header className="flex items-center space-x-2 border-b border-hair pb-3">
            <PartyPopper className="h-4 w-4 text-ink" />
            <h2 className="text-sm font-bold text-ink">Thank-you screen</h2>
          </header>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <label className="space-y-1.5">
              <span className="block text-xs font-semibold text-ink">Headline</span>
              <input
                type="text"
                value={ending.title}
                onChange={(event) => patchEnding({ title: event.target.value })}
                className="w-full rounded-lg border border-hair px-3 py-2 text-xs text-ink focus:border-ink focus:outline-none"
              />
            </label>

            <label className="space-y-1.5">
              <span className="block text-xs font-semibold text-ink">Button label</span>
              <input
                type="text"
                value={ending.button_label}
                onChange={(event) => patchEnding({ button_label: event.target.value })}
                disabled={!ending.show_button}
                className="w-full rounded-lg border border-hair px-3 py-2 text-xs text-ink focus:border-ink focus:outline-none disabled:bg-panel disabled:text-faint"
              />
            </label>

            <label className="space-y-1.5 lg:col-span-2">
              <span className="block text-xs font-semibold text-ink">Message</span>
              <textarea
                rows={2}
                value={ending.description}
                onChange={(event) => patchEnding({ description: event.target.value })}
                className="w-full resize-none rounded-lg border border-hair px-3 py-2 text-xs text-ink focus:border-ink focus:outline-none"
              />
            </label>
          </div>

          <div className="flex items-center justify-between border-t border-hair pt-4">
            <div>
              <span className="block text-xs font-semibold text-ink">Show call-to-action</span>
              <span className="block text-[10px] text-faint">
                Respondents can always submit another response
              </span>
            </div>
            <button
              onClick={() => patchEnding({ show_button: !ending.show_button })}
              role="switch"
              aria-checked={ending.show_button}
              className={`flex h-5 w-10 items-center rounded-full p-0.5 transition-colors ${
                ending.show_button ? "justify-end bg-chrome" : "justify-start bg-[#c9c9cf]"
              }`}
            >
              <span className="h-4 w-4 rounded-full bg-white shadow-md" />
            </button>
          </div>
        </section>

        {/* --- Not built --- */}
        <section className="space-y-3 rounded-2xl border border-hair bg-white p-6 shadow-sm">
          <header className="flex items-center space-x-2 border-b border-hair pb-3">
            <Lock className="h-4 w-4 text-faint" />
            <h2 className="text-sm font-bold text-ink">More settings</h2>
          </header>
          <div className="grid grid-cols-2 gap-2">
            {PLACEHOLDERS.map((label) => (
              <div
                key={label}
                className="flex items-center justify-between rounded-lg border border-hair bg-panel px-3 py-2.5 text-xs text-muted"
              >
                <span>{label}</span>
                <span className="rounded bg-white px-1.5 py-0.5 text-[10px] font-medium text-ink">
                  Coming Soon
                </span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
