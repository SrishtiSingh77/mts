"use client";

import { Moon, Sun } from "lucide-react";

import { useTheme } from "./ThemeProvider";

/** Light/dark switch for the creator app. */
export default function ThemeToggle() {
  const { theme, toggle } = useTheme();
  const isDark = theme === "dark";

  return (
    <button
      onClick={toggle}
      role="switch"
      aria-checked={isDark}
      aria-label="Toggle dark mode"
      title={isDark ? "Switch to light mode" : "Switch to dark mode"}
      className="relative flex h-8 w-[58px] items-center rounded-full border border-hair bg-panel px-1 transition-colors"
    >
      {/* Knob slides across; icons sit underneath so both stay visible */}
      <span
        className={`absolute flex h-6 w-6 items-center justify-center rounded-full bg-surface shadow-sm transition-transform duration-200 ${
          isDark ? "translate-x-[26px]" : "translate-x-0"
        }`}
      >
        {isDark ? (
          <Moon className="h-3.5 w-3.5 text-ink" />
        ) : (
          <Sun className="h-3.5 w-3.5 text-ink" />
        )}
      </span>

      <span className="flex w-full items-center justify-between px-[5px] text-faint">
        <Sun className={`h-3.5 w-3.5 ${isDark ? "opacity-100" : "opacity-0"}`} />
        <Moon className={`h-3.5 w-3.5 ${isDark ? "opacity-0" : "opacity-100"}`} />
      </span>
    </button>
  );
}
