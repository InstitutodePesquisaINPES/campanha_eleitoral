import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { THEMES, DEFAULT_THEME, DEFAULT_MODE, type ThemePreset, type ThemeMode } from "@/lib/themes";

const STORAGE_KEY_PRESET = "kiribamba_theme_preset";
const STORAGE_KEY_MODE = "kiribamba_theme_mode";

interface ThemeContextType {
  preset: ThemePreset;
  mode: ThemeMode;
  setPreset: (preset: ThemePreset) => void;
  setMode: (mode: ThemeMode) => void;
  effectiveMode: "light" | "dark";
}

const ThemeContext = createContext<ThemeContextType>({
  preset: DEFAULT_THEME,
  mode: DEFAULT_MODE,
  setPreset: () => {},
  setMode: () => {},
  effectiveMode: "light",
});

export const useTheme = () => useContext(ThemeContext);

function getSystemMode(): "light" | "dark" {
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function applyTheme(preset: ThemePreset, effectiveMode: "light" | "dark") {
  const theme = THEMES.find((t) => t.id === preset) ?? THEMES[0];
  const vars = effectiveMode === "dark" ? { ...theme.lightVars, ...theme.darkVars } : theme.lightVars;
  const root = document.documentElement;

  // Remove dark class
  root.classList.remove("dark");
  if (effectiveMode === "dark") root.classList.add("dark");

  // Inject CSS variables
  Object.entries(vars).forEach(([key, value]) => {
    root.style.setProperty(key, value);
  });
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [preset, setPresetState] = useState<ThemePreset>(
    () => (localStorage.getItem(STORAGE_KEY_PRESET) as ThemePreset) ?? DEFAULT_THEME
  );
  const [mode, setModeState] = useState<ThemeMode>(
    () => (localStorage.getItem(STORAGE_KEY_MODE) as ThemeMode) ?? DEFAULT_MODE
  );

  const effectiveMode: "light" | "dark" =
    mode === "system" ? getSystemMode() : mode;

  useEffect(() => {
    applyTheme(preset, effectiveMode);
  }, [preset, effectiveMode]);

  useEffect(() => {
    if (mode !== "system") return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = () => applyTheme(preset, getSystemMode());
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, [mode, preset]);

  const setPreset = (newPreset: ThemePreset) => {
    setPresetState(newPreset);
    localStorage.setItem(STORAGE_KEY_PRESET, newPreset);
  };

  const setMode = (newMode: ThemeMode) => {
    setModeState(newMode);
    localStorage.setItem(STORAGE_KEY_MODE, newMode);
  };

  return (
    <ThemeContext.Provider value={{ preset, mode, setPreset, setMode, effectiveMode }}>
      {children}
    </ThemeContext.Provider>
  );
}
