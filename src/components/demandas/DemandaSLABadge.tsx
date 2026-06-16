import { Badge } from "@/components/ui/badge";
import { Clock, AlertTriangle, CheckCircle2, Timer, HelpCircle } from "lucide-react";
import type { SituacaoSLA } from "@/hooks/useDemandas";

const meta: Record<SituacaoSLA, { label: string; cls: string; Icon: any }> = {
  no_prazo:  { label: "No prazo",  cls: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30", Icon: CheckCircle2 },
  vencendo:  { label: "Vencendo",  cls: "bg-amber-500/15 text-amber-400 border-amber-500/30",       Icon: Clock },
  vencida:   { label: "Vencida",   cls: "bg-destructive/15 text-destructive border-destructive/30", Icon: AlertTriangle },
  atrasada:  { label: "Atrasada",  cls: "bg-destructive/15 text-destructive border-destructive/30", Icon: AlertTriangle },
  sem_prazo: { label: "Sem prazo", cls: "bg-muted text-muted-foreground border-border",             Icon: HelpCircle },
};

export function DemandaSLABadge({ situacao, horasRestantes }: { situacao: SituacaoSLA; horasRestantes?: number | null }) {
  const m = meta[situacao] ?? meta.sem_prazo;
  const Icon = m.Icon;
  const horas = horasRestantes != null ? Math.round(horasRestantes) : null;
  const subtitulo =
    situacao === "no_prazo" && horas != null && horas > 0 ? ` · ${horas}h restantes` :
    situacao === "vencendo" && horas != null ? ` · ${horas}h` :
    situacao === "vencida" && horas != null ? ` · ${Math.abs(horas)}h em atraso` :
    "";
  return (
    <Badge variant="outline" className={`gap-1 ${m.cls}`}>
      <Icon className="h-3 w-3" />
      <span>{m.label}{subtitulo}</span>
    </Badge>
  );
}
