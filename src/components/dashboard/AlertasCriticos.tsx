import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, ShieldAlert, Flag, Wallet, MessageSquare } from "lucide-react";
import { Link } from "react-router-dom";
import type { DashboardKPIs } from "@/hooks/useDashboardKPIs";

export function AlertasCriticos({ kpis }: { kpis: DashboardKPIs }) {
  const alertas: { icon: any; titulo: string; sub: string; href: string; tone: "destructive" | "warning" | "info" }[] = [];

  if (kpis.tarefasAtrasadas > 0) {
    alertas.push({
      icon: Flag, titulo: `${kpis.tarefasAtrasadas} tarefa${kpis.tarefasAtrasadas > 1 ? "s" : ""} atrasada${kpis.tarefasAtrasadas > 1 ? "s" : ""}`,
      sub: "no plano da campanha", href: "/plano", tone: "destructive",
    });
  }
  if (kpis.demandasUrgentes > 0) {
    alertas.push({
      icon: AlertTriangle, titulo: `${kpis.demandasUrgentes} demanda${kpis.demandasUrgentes > 1 ? "s" : ""} urgente${kpis.demandasUrgentes > 1 ? "s" : ""}`,
      sub: "exigem ação imediata", href: "/demandas?prioridade=urgente", tone: "destructive",
    });
  }
  if (kpis.proximoMarcoTitulo && kpis.proximoMarcoDias !== null && kpis.proximoMarcoDias <= 14) {
    alertas.push({
      icon: ShieldAlert, titulo: `Marco em ${kpis.proximoMarcoDias}d: ${kpis.proximoMarcoTitulo}`,
      sub: "abrir no plano", href: "/plano?aba=marcos", tone: "warning",
    });
  }
  if (kpis.contratosVencendo > 0) {
    alertas.push({
      icon: Wallet, titulo: `${kpis.contratosVencendo} contrato${kpis.contratosVencendo > 1 ? "s" : ""} vencendo`,
      sub: "nos próximos 30 dias", href: "/compliance", tone: "warning",
    });
  }
  if (kpis.mencoesAbertas > 0) {
    alertas.push({
      icon: MessageSquare, titulo: `${kpis.mencoesAbertas} menções sem resposta`,
      sub: "monitoramento de mídia", href: "/comunicacao", tone: "info",
    });
  }
  if (kpis.pctOrcamento > 85) {
    alertas.push({
      icon: Wallet, titulo: `Orçamento em ${kpis.pctOrcamento.toFixed(0)}%`,
      sub: "atenção ao limite", href: "/financeiro", tone: "destructive",
    });
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-warning" /> Alertas críticos
          {alertas.length > 0 && <Badge variant="outline" className="ml-auto text-[10px]">{alertas.length}</Badge>}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {alertas.length === 0 ? (
          <p className="text-xs text-muted-foreground py-4 text-center">Sem alertas críticos no momento.</p>
        ) : (
          alertas.map((a, i) => {
            const tone = a.tone === "destructive"
              ? "border-destructive/30 bg-destructive/5"
              : a.tone === "warning"
                ? "border-warning/30 bg-warning/5"
                : "border-info/30 bg-info/5";
            const iconTone = a.tone === "destructive"
              ? "text-destructive"
              : a.tone === "warning"
                ? "text-warning"
                : "text-info";
            return (
              <Link to={a.href} key={i} className={`flex items-start gap-2 p-2.5 rounded-md border ${tone} hover:bg-muted/30 transition`}>
                <a.icon className={`h-4 w-4 mt-0.5 shrink-0 ${iconTone}`} />
                <div className="min-w-0">
                  <p className="text-xs font-semibold truncate">{a.titulo}</p>
                  <p className="text-[11px] text-muted-foreground truncate">{a.sub}</p>
                </div>
              </Link>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}
