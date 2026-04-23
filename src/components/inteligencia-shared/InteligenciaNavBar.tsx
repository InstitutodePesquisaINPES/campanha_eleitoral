import { NavLink, useLocation } from "react-router-dom";
import { Brain, Target, Map, BarChartBig, Sparkles, TrendingUp, Layers } from "lucide-react";
import { useInteligenciaKPIs } from "@/hooks/useInteligenciaKPIs";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const ITEMS = [
  { to: "/inteligencia-politica", label: "Política", icon: Brain },
  { to: "/plano-estrategico", label: "Plano Estratégico", icon: Target },
  { to: "/mapa-estrategico", label: "Mapa de Bairros", icon: Map },
  { to: "/inteligencia", label: "Territorial", icon: Layers },
  { to: "/eleitoral", label: "TSE", icon: BarChartBig },
  { to: "/copilot", label: "Copilots IA", icon: Sparkles },
  { to: "/pesquisas", label: "Pesquisas", icon: TrendingUp },
];

interface Props {
  campanhaId?: string;
  compact?: boolean;
}

export function InteligenciaNavBar({ campanhaId, compact = false }: Props) {
  const location = useLocation();
  const { data: kpis } = useInteligenciaKPIs(campanhaId);

  return (
    <Card className="p-3 bg-gradient-to-r from-primary/5 via-background to-info/5 border-primary/20">
      <div className="flex flex-col gap-3">
        {/* KPIs cruzados */}
        {!compact && kpis && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
            <KPI label="Cobertura" value={`${kpis.coberturaPct}%`} tone={kpis.coberturaPct >= 70 ? "success" : kpis.coberturaPct >= 40 ? "warning" : "destructive"} />
            <KPI label="Meta votos" value={kpis.municipios.metaVotos.toLocaleString()} />
            <KPI label="Municípios" value={`${kpis.municipios.redutos}R · ${kpis.municipios.expansao}E`} hint={`${kpis.municipios.total} mapeados`} />
            <KPI label="Lideranças A+B" value={String(kpis.liderancas.classeAB)} hint={`${kpis.liderancas.convertidasCRM} no CRM`} />
            <KPI label="Vereadores" value={`${kpis.vereadores.aliados}✓ ${kpis.vereadores.adversarios}✗`} hint={`${kpis.vereadores.total} no TSE`} />
            <KPI label="Bairros críticos" value={String(kpis.bairros.criticos)} tone={kpis.bairros.criticos > 5 ? "destructive" : undefined} hint={`${kpis.demandas.abertas} demandas`} />
          </div>
        )}

        {/* Navegação cruzada */}
        <div className="flex flex-wrap gap-1.5">
          {ITEMS.map((item) => {
            const active = location.pathname === item.to;
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors",
                  active
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "bg-background hover:bg-muted text-muted-foreground hover:text-foreground border"
                )}
              >
                <Icon className="h-3.5 w-3.5" />
                {item.label}
              </NavLink>
            );
          })}
        </div>
      </div>
    </Card>
  );
}

function KPI({ label, value, hint, tone }: { label: string; value: string; hint?: string; tone?: "success" | "warning" | "destructive" }) {
  const toneClass =
    tone === "success" ? "text-success" :
    tone === "warning" ? "text-warning" :
    tone === "destructive" ? "text-destructive" : "text-foreground";
  return (
    <div className="rounded-md bg-background/60 border px-2.5 py-1.5">
      <p className="text-[9px] uppercase tracking-wide text-muted-foreground font-semibold">{label}</p>
      <p className={cn("text-sm font-bold tabular-nums leading-tight", toneClass)}>{value}</p>
      {hint && <p className="text-[9px] text-muted-foreground truncate">{hint}</p>}
    </div>
  );
}
