import { useTheme } from "@/contexts/ThemeContext";
import { THEMES, type ThemePreset, type ThemeMode } from "@/lib/themes";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Sun, Moon, Monitor, Check, Palette } from "lucide-react";
import { cn } from "@/lib/utils";
import { useUpdateSystemSetting } from "@/hooks/useSystemSettings";

const MODE_OPTIONS: { value: ThemeMode; label: string; icon: React.ElementType }[] = [
  { value: "light", label: "Claro", icon: Sun },
  { value: "dark", label: "Escuro", icon: Moon },
  { value: "system", label: "Sistema", icon: Monitor },
];

export function ThemePanel() {
  const { preset, mode, tier, setPreset, setMode, setTier } = useTheme();
  const updateSettings = useUpdateSystemSetting();

  const handlePresetChange = (newPreset: ThemePreset) => {
    setPreset(newPreset);
    updateSettings.mutate({ theme_preset: newPreset });
  };

  return (
    <Card className="shadow-sm border-slate-200 dark:border-slate-800">
      <CardHeader className="bg-slate-50 dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 pb-4">
        <CardTitle className="text-lg flex items-center gap-2">
          <Palette className="w-5 h-5 text-violet-500" />
          Aparência e Tema
        </CardTitle>
        <CardDescription>
          Personalize as cores e o modo visual do sistema por Tenant.
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6 space-y-6">
        {/* Mode selector */}
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-3">
            Modo de Exibição
          </p>
          <div className="flex gap-3">
            {MODE_OPTIONS.map(({ value, label, icon: Icon }) => (
              <button
                key={value}
                onClick={() => setMode(value)}
                className={cn(
                  "flex-1 flex flex-col items-center gap-2 py-4 rounded-xl border-2 transition-all duration-200",
                  mode === value
                    ? "border-primary bg-primary/5 text-primary shadow-sm"
                    : "border-slate-200 dark:border-slate-700 text-slate-500 hover:border-slate-300 dark:hover:border-slate-600"
                )}
              >
                <Icon className="w-5 h-5" />
                <span className="text-xs font-semibold">{label}</span>
                {mode === value && (
                  <span className="w-4 h-4 rounded-full bg-primary flex items-center justify-center">
                    <Check className="w-2.5 h-2.5 text-white" />
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Preset selector */}
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-3">
            Paleta de Cores ({THEMES.length} temas)
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {THEMES.map((theme) => (
              <motion.button
                key={theme.id}
                whileHover={{ scale: 1.03, y: -2 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => handlePresetChange(theme.id as ThemePreset)}
                className={cn(
                  "relative flex flex-col items-center gap-2 p-3 rounded-2xl border-2 text-left transition-all duration-200 group",
                  preset === theme.id
                    ? "border-primary shadow-md shadow-primary/20 bg-primary/5"
                    : "border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600"
                )}
              >
                {/* Color preview */}
                <div
                  className="w-full h-12 rounded-xl shadow-sm overflow-hidden flex"
                  style={{ background: theme.preview.bg }}
                >
                  <div className="flex-1 h-full" style={{ background: theme.preview.primary }} />
                  <div className="w-1/3 h-full" style={{ background: theme.preview.accent }} />
                </div>

                {/* Check mark */}
                {preset === theme.id && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute top-2 right-2 w-5 h-5 bg-primary rounded-full flex items-center justify-center shadow"
                  >
                    <Check className="w-3 h-3 text-white" />
                  </motion.div>
                )}

                <div className="w-full">
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-100 leading-tight">{theme.name}</p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight mt-0.5 truncate">{theme.description}</p>
                </div>
              </motion.button>
            ))}
          </div>
        </div>

        {/* Tier selector */}
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-3">
            Padrão de Layout
          </p>
          <div className="flex gap-3">
            <button
              onClick={() => { setTier("professional"); updateSettings.mutate({ theme_tier: "professional" }) }}
              className={cn(
                "flex-1 flex flex-col items-center justify-center gap-2 py-4 rounded-xl border-2 transition-all duration-200",
                tier === "professional"
                  ? "border-primary bg-primary/5 text-primary shadow-sm"
                  : "border-slate-200 dark:border-slate-700 text-slate-500 hover:border-slate-300 dark:hover:border-slate-600"
              )}
            >
              <span className="text-xs font-bold">Profissional (Flat)</span>
              <span className="text-[10px] opacity-80">Rápido e limpo</span>
            </button>
            <button
              onClick={() => { setTier("enterprise"); updateSettings.mutate({ theme_tier: "enterprise" }) }}
              className={cn(
                "flex-1 flex flex-col items-center justify-center gap-2 py-4 rounded-xl border-2 transition-all duration-200",
                tier === "enterprise"
                  ? "border-primary bg-primary/5 text-primary shadow-sm"
                  : "border-slate-200 dark:border-slate-700 text-slate-500 hover:border-slate-300 dark:hover:border-slate-600"
              )}
            >
              <span className="text-xs font-bold">Enterprise (Glass)</span>
              <span className="text-[10px] opacity-80">Premium e animado</span>
            </button>
          </div>
        </div>

        {/* Live preview indicator */}
        <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
          </span>
          <p className="text-xs text-slate-600 dark:text-slate-400">
            O Tema escolhido é <strong className="text-primary">Global para sua Campanha</strong>. Todos os membros da equipe verão esta paleta de cores. O Modo Claro/Escuro é preferência de navegador.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
