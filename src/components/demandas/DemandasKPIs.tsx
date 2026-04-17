import { Card, CardContent } from "@/components/ui/card";
import { useDemandasStats } from "@/hooks/useDemandas";
import { FileText, AlertTriangle, CheckCircle2, Flame, Timer, Star, TrendingUp, Activity } from "lucide-react";

export function DemandasKPIs() {
  const { data: s } = useDemandasStats();
  if (!s) return null;

  const cards = [
    { icon: FileText, label: "Total", value: s.total.toLocaleString("pt-BR"), color: "text-foreground" },
    { icon: Activity, label: "Ativas", value: s.ativas.toLocaleString("pt-BR"), color: "text-primary" },
    { icon: AlertTriangle, label: "Vencidas (SLA)", value: s.vencidas.toLocaleString("pt-BR"), color: "text-destructive" },
    { icon: Flame, label: "Urgentes", value: s.urgentes.toLocaleString("pt-BR"), color: "text-warning" },
    { icon: CheckCircle2, label: "Resolvidas", value: s.resolvidas.toLocaleString("pt-BR"), color: "text-success" },
    { icon: TrendingUp, label: "Taxa resolução", value: `${s.taxaResolucao.toFixed(1)}%`, color: "text-success" },
    { icon: Timer, label: "Tempo médio", value: `${s.tempoMedioDias.toFixed(1)}d`, color: "text-info" },
    { icon: Star, label: "Satisfação", value: s.satisfacaoMedia ? `${s.satisfacaoMedia.toFixed(1)}/5` : "—", color: "text-warning" },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-2">
      {cards.map((c) => (
        <Card key={c.label}>
          <CardContent className="p-3">
            <c.icon className={`h-4 w-4 mb-1 ${c.color}`} />
            <div className="text-lg font-bold leading-tight">{c.value}</div>
            <p className="text-[10px] text-muted-foreground">{c.label}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
