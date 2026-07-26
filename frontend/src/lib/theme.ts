import { CSSProperties } from "react";

import { FormTheme, ThemeFont } from "@/types";

export const DEFAULT_THEME: FormTheme = {
  color: "#262627",
  background: "#f9f9f9",
  font: "sans",
};

export const THEME_PRESETS: { name: string; color: string; background: string }[] = [
  { name: "Basic", color: "#262627", background: "#f9f9f9" },
  { name: "Ink", color: "#1e3a8a", background: "#f5f7ff" },
  { name: "Forest", color: "#0f766e", background: "#f7fdfb" },
  { name: "Sunset", color: "#ea580c", background: "#fffaf5" },
  { name: "Grape", color: "#7c3aed", background: "#fbf8ff" },
  { name: "Rose", color: "#be123c", background: "#fff7f8" },
];

export const FONT_OPTIONS: { value: ThemeFont; label: string; stack: string }[] = [
  { value: "sans", label: "Sans", stack: "var(--font-geist-sans), system-ui, sans-serif" },
  { value: "serif", label: "Serif", stack: "Georgia, 'Times New Roman', serif" },
  { value: "mono", label: "Mono", stack: "var(--font-geist-mono), ui-monospace, monospace" },
];

export function fontStack(font: ThemeFont): string {
  return FONT_OPTIONS.find((option) => option.value === font)?.stack ?? FONT_OPTIONS[0].stack;
}

/** Inline style for a themed surface — the colours are user-chosen hex, so no Tailwind classes. */
export function themeStyles(theme: FormTheme | undefined): CSSProperties {
  const resolved = theme ?? DEFAULT_THEME;
  return {
    backgroundColor: resolved.background,
    fontFamily: fontStack(resolved.font),
  };
}

export function accentOf(theme: FormTheme | undefined): string {
  return theme?.color ?? DEFAULT_THEME.color;
}
