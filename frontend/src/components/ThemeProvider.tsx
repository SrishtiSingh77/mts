"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

export type AppTheme = "light" | "dark";

const STORAGE_KEY = "formflow-theme";

interface ThemeApi {
  theme: AppTheme;
  toggle: () => void;
  setTheme: (theme: AppTheme) => void;
}

const ThemeContext = createContext<ThemeApi | null>(null);

/**
 * Applies `.dark` to <html>, which re-points the colour tokens in globals.css.
 * The initial value is written by the inline script in layout.tsx, so this only
 * has to keep up with changes after hydration.
 */
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<AppTheme>("light");

  // Read whatever the pre-hydration script already decided.
  useEffect(() => {
    setThemeState(document.documentElement.classList.contains("dark") ? "dark" : "light");
  }, []);

  const setTheme = useCallback((next: AppTheme) => {
    setThemeState(next);
    document.documentElement.classList.toggle("dark", next === "dark");
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // Private browsing can reject writes; the class is already applied.
    }
  }, []);

  const toggle = useCallback(() => {
    setTheme(document.documentElement.classList.contains("dark") ? "light" : "dark");
  }, [setTheme]);

  // Follow the OS only while the user has not made an explicit choice.
  useEffect(() => {
    const query = window.matchMedia("(prefers-color-scheme: dark)");

    function onChange(event: MediaQueryListEvent) {
      try {
        if (window.localStorage.getItem(STORAGE_KEY)) return;
      } catch {
        return;
      }
      setThemeState(event.matches ? "dark" : "light");
      document.documentElement.classList.toggle("dark", event.matches);
    }

    query.addEventListener("change", onChange);
    return () => query.removeEventListener("change", onChange);
  }, []);

  const api = useMemo<ThemeApi>(() => ({ theme, toggle, setTheme }), [setTheme, theme, toggle]);

  return <ThemeContext.Provider value={api}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeApi {
  const context = useContext(ThemeContext);
  if (!context) throw new Error("useTheme must be used inside <ThemeProvider>");
  return context;
}

/**
 * Runs before paint so a dark-mode user never sees a white flash.
 * Kept as a string because it has to execute ahead of React hydration.
 */
export const THEME_INIT_SCRIPT = `(function(){try{
var s=localStorage.getItem('${STORAGE_KEY}');
var d=s?s==='dark':window.matchMedia('(prefers-color-scheme: dark)').matches;
if(d)document.documentElement.classList.add('dark');
}catch(e){}})();`;
