import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { THEMES, DEFAULT_THEME, DEFAULT_MODE, type ThemePreset, type ThemeMode } from "@/lib/themes";
import { useTenantSettings } from "@/hooks/useTenantSettings";

const STORAGE_KEY_MODE = "kiribamba_theme_mode";

export type ThemeTier = "professional" | "enterprise";

interface ThemeContextType {
  preset: ThemePreset;
  mode: ThemeMode;
  tier: ThemeTier;
  setPreset: (preset: ThemePreset) => void;
  setMode: (mode: ThemeMode) => void;
  setTier: (tier: ThemeTier) => void;
  effectiveMode: "light" | "dark";
}

const ThemeContext = createContext<ThemeContextType>({
  preset: DEFAULT_THEME,
  mode: DEFAULT_MODE,
  tier: "professional",
  setPreset: () => {},
  setMode: () => {},
  setTier: () => {},
  effectiveMode: "light",
});

export const useTheme = () => useContext(ThemeContext);

function getSystemMode(): "light" | "dark" {
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function applyTheme(preset: ThemePreset, effectiveMode: "light" | "dark", tier: ThemeTier) {
  const theme = THEMES.find((t) => t.id === preset) ?? THEMES[0];
  const vars = effectiveMode === "dark" ? { ...theme.lightVars, ...theme.darkVars } : theme.lightVars;
  const root = document.documentElement;

  // Remove dark and tier classes
  root.classList.remove("dark", "tier-enterprise", "tier-professional");
  
  if (effectiveMode === "dark") root.classList.add("dark");
  root.classList.add(`tier-${tier}`);

  // Inject CSS variables
  Object.entries(vars).forEach(([key, value]) => {
    root.style.setProperty(key, value);
  });
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const { data: tenantSettings } = useTenantSettings();

  const [preset, setPresetState] = useState<ThemePreset>(
    () => (localStorage.getItem("kiribamba_theme_preset") as ThemePreset) ?? DEFAULT_THEME
  );

  const [mode, setModeState] = useState<ThemeMode>(
    () => (localStorage.getItem(STORAGE_KEY_MODE) as ThemeMode) ?? DEFAULT_MODE
  );

  const [tier, setTierState] = useState<ThemeTier>(
    () => (localStorage.getItem("kiribamba_theme_tier") as ThemeTier) ?? "professional"
  );

  const effectiveMode: "light" | "dark" =
    mode === "system" ? getSystemMode() : mode;

  // Sync with backend settings
  useEffect(() => {
    if (tenantSettings) {
      if (tenantSettings.themeConfig?.preset) {
        const backendPreset = tenantSettings.themeConfig.preset as ThemePreset;
        if (backendPreset !== preset) {
          setPresetState(backendPreset);
          localStorage.setItem("kiribamba_theme_preset", backendPreset);
        }
      }

      if (tenantSettings.themeConfig?.tier) {
        const backendTier = tenantSettings.themeConfig.tier as ThemeTier;
        if (backendTier !== tier) {
          setTierState(backendTier);
          localStorage.setItem("kiribamba_theme_tier", backendTier);
        }
      }

      // Dynamic Primary Color Override
      if (tenantSettings.primaryColor) {
        document.documentElement.style.setProperty("--primary", tenantSettings.primaryColor);
        // Add basic alpha variants or let Tailwind handle HSL
      }
    }
  }, [tenantSettings]);

  useEffect(() => {
    applyTheme(preset, effectiveMode, tier);
  }, [preset, effectiveMode, tier]);

  useEffect(() => {
    if (mode !== "system") return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = () => applyTheme(preset, getSystemMode(), tier);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, [mode, preset, tier]);

  const setPreset = (newPreset: ThemePreset) => {
    setPresetState(newPreset);
    localStorage.setItem("kiribamba_theme_preset", newPreset);
  };

  const setMode = (newMode: ThemeMode) => {
    setModeState(newMode);
    localStorage.setItem(STORAGE_KEY_MODE, newMode);
  };

  const setTier = (newTier: ThemeTier) => {
    setTierState(newTier);
    localStorage.setItem("kiribamba_theme_tier", newTier);
  };

  return (
    <ThemeContext.Provider value={{ preset, mode, tier, setPreset, setMode, setTier, effectiveMode }}>
      {children}
    </ThemeContext.Provider>
  );
}
