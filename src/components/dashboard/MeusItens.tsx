import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { ClipboardList, Calendar, Inbox } from "lucide-react";
import { useMeusItens } from "@/hooks/useDashboardKPIs";

const prioridadeColor: Record<string, string> = {
  urgente: "bg-destructive/10 text-destructive border-destructive/30",
  alta: "bg-warning/10 text-warning border-warning/30",
  media: "bg-info/10 text-info border-info/30",
  baixa: "bg-muted text-muted-foreground",
};

export function MeusItens() {
  const { data, isLoading } = useMeusItens();
  if (isLoading) return null;
  const total = (data?.demandas.length || 0) + (data?.eventos.length || 0);

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          <Inbox className="h-4 w-4 text-primary" /> Minha caixa
          {total > 0 && <Badge variant="outline" className="ml-auto text-[10px]">{total}</Badge>}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {total === 0 ? (
          <p className="text-xs text-muted-foreground py-4 text-center">Nada atribuído a você no momento.</p>
        ) : (
          <>
            {data!.demandas.length > 0 && (
              <div className="space-y-1.5">
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                  <ClipboardList className="h-3 w-3" /> Demandas
                </p>
                {data!.demandas.map((d: any) => (
                  <Link to="/demandas" key={d.id} className="flex justify-between items-center gap-2 py-1.5 px-2 rounded hover:bg-muted/40">
                    <span className="text-xs truncate">{d.titulo}</span>
                    <Badge variant="outline" className={`text-[10px] capitalize shrink-0 ${prioridadeColor[d.prioridade]}`}>{d.prioridade}</Badge>
                  </Link>
                ))}
              </div>
            )}
            {data!.eventos.length > 0 && (
              <div className="space-y-1.5">
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                  <Calendar className="h-3 w-3" /> Próximos eventos
                </p>
                {data!.eventos.map((e: any) => (
                  <Link to="/agenda" key={e.id} className="flex justify-between items-center gap-2 py-1.5 px-2 rounded hover:bg-muted/40">
                    <span className="text-xs truncate">{e.titulo}</span>
                    <span className="text-[10px] text-muted-foreground shrink-0 tabular-nums">
                      {new Date(e.data_inicio).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" })}
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
