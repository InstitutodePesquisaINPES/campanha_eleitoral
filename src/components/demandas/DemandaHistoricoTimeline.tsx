import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useDemandaHistorico, statusLabels } from "@/hooks/useDemandas";
import { History, Loader2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

export function DemandaHistoricoTimeline({ demandaId }: { demandaId: string }) {
  const { data = [], isLoading } = useDemandaHistorico(demandaId);

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <History className="h-4 w-4 text-primary" />
          Histórico de status
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-sm text-muted-foreground flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" /> Carregando…
          </div>
        ) : data.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nenhuma mudança registrada.</p>
        ) : (
          <ol className="relative border-l border-border pl-5 space-y-3">
            {data.map((h) => (
              <li key={h.id} className="relative">
                <span className="absolute -left-[26px] top-1 h-3 w-3 rounded-full bg-primary border-2 border-background" />
                <div className="text-sm">
                  {h.status_anterior ? (
                    <>
                      <span className="font-medium">{statusLabels[h.status_anterior] ?? h.status_anterior}</span>
                      <span className="mx-2 text-muted-foreground">→</span>
                      <span className="font-semibold text-primary">{statusLabels[h.status_novo] ?? h.status_novo}</span>
                    </>
                  ) : (
                    <span className="font-semibold text-primary">Aberta como {statusLabels[h.status_novo] ?? h.status_novo}</span>
                  )}
                </div>
                <div className="text-[11px] text-muted-foreground">
                  {formatDistanceToNow(new Date(h.created_at), { addSuffix: true, locale: ptBR })}
                </div>
                {h.observacao && <div className="text-xs mt-1 italic text-muted-foreground">"{h.observacao}"</div>}
              </li>
            ))}
          </ol>
        )}
      </CardContent>
    </Card>
  );
}
