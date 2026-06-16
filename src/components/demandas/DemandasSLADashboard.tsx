import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useDemandasSLA } from "@/hooks/useDemandas";
import { useAuth } from "@/contexts/AuthContext";
import { DemandaSLABadge } from "./DemandaSLABadge";
import { AlertTriangle, Clock, CheckCircle2, Activity, Loader2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

export function DemandasSLADashboard({ onSelect }: { onSelect?: (id: string) => void }) {
  const { user } = useAuth();
  const [somenteMinhas, setSomenteMinhas] = useState(false);
  const { data = [], isLoading } = useDemandasSLA({ somenteMinhas, userId: user?.id });

  const kpis = useMemo(() => {
    const ativas = data.filter((d) => !["resolvida","cancelada","encerrada","arquivada"].includes(d.status));
    return {
      no_prazo: ativas.filter((d) => d.situacao_sla === "no_prazo").length,
      vencendo: ativas.filter((d) => d.situacao_sla === "vencendo").length,
      vencidas: ativas.filter((d) => d.situacao_sla === "vencida").length,
      atrasadas: data.filter((d) => d.situacao_sla === "atrasada").length,
      tempo_medio_min: (() => {
        const respondidas = data.filter((d) => d.tempo_resposta_min != null);
        if (!respondidas.length) return 0;
        return Math.round(respondidas.reduce((s, d) => s + (d.tempo_resposta_min ?? 0), 0) / respondidas.length);
      })(),
    };
  }, [data]);

  const criticas = useMemo(
    () => data.filter((d) =>
      ["vencida","vencendo"].includes(d.situacao_sla) &&
      !["resolvida","cancelada","encerrada","arquivada"].includes(d.status)
    ).slice(0, 10),
    [data],
  );

  const cards = [
    { label: "No prazo",  value: kpis.no_prazo,  icon: CheckCircle2, cls: "text-emerald-400" },
    { label: "Vencendo",  value: kpis.vencendo,  icon: Clock,        cls: "text-amber-400" },
    { label: "Vencidas",  value: kpis.vencidas,  icon: AlertTriangle, cls: "text-destructive" },
    { label: "Atrasadas (resolvidas tarde)", value: kpis.atrasadas, icon: Activity, cls: "text-warning" },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h2 className="text-xl font-bold">SLA & Performance</h2>
          <p className="text-sm text-muted-foreground">Tempo médio de resposta: {Math.round(kpis.tempo_medio_min / 60 * 10) / 10}h</p>
        </div>
        <div className="flex items-center gap-2">
          <Label htmlFor="minhas" className="text-sm">Somente minhas</Label>
          <Switch id="minhas" checked={somenteMinhas} onCheckedChange={setSomenteMinhas} disabled={!user} />
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {cards.map((c) => (
          <Card key={c.label}>
            <CardContent className="p-4">
              <c.icon className={`h-5 w-5 mb-1 ${c.cls}`} />
              <div className="text-2xl font-bold">{c.value}</div>
              <p className="text-xs text-muted-foreground">{c.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Demandas críticas (vencidas ou vencendo)</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-sm text-muted-foreground flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin" />Carregando…</div>
          ) : criticas.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nenhuma demanda crítica no momento. 🎉</p>
          ) : (
            <div className="divide-y">
              {criticas.map((d) => (
                <button
                  key={d.id}
                  onClick={() => onSelect?.(d.id)}
                  className="w-full text-left py-3 flex items-center gap-3 hover:bg-muted/50 px-2 rounded transition"
                >
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate">{d.titulo}</div>
                    <div className="text-[11px] text-muted-foreground">
                      {d.protocolo}
                      {d.data_prazo && <> · prazo {formatDistanceToNow(new Date(d.data_prazo), { addSuffix: true, locale: ptBR })}</>}
                    </div>
                  </div>
                  <DemandaSLABadge situacao={d.situacao_sla} horasRestantes={d.horas_restantes} />
                </button>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
