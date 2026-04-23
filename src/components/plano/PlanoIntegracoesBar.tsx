import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, ClipboardList, Calendar, Wallet, MessageSquare, Package, ShieldCheck } from "lucide-react";

/**
 * Barra de atalhos contextuais: leva o usuário direto para os módulos
 * relacionados à campanha ativa, mantendo o plano como hub central.
 */
export function PlanoIntegracoesBar({ campanhaId }: { campanhaId: string }) {
  const links = [
    { icon: TrendingUp, label: "Sala de Situação", href: "/comando", tone: "text-primary" },
    { icon: ClipboardList, label: "Demandas", href: "/demandas", tone: "text-warning" },
    { icon: Calendar, label: "Agenda", href: "/agenda", tone: "text-info" },
    { icon: Wallet, label: "Financeiro", href: "/financeiro", tone: "text-success" },
    { icon: MessageSquare, label: "Comunicação", href: "/comunicacao", tone: "text-info" },
    { icon: Package, label: "Materiais", href: "/materiais", tone: "text-primary" },
    { icon: ShieldCheck, label: "Compliance", href: "/compliance", tone: "text-warning" },
  ];
  return (
    <Card>
      <CardContent className="p-3">
        <div className="flex flex-wrap gap-2">
          <span className="text-[11px] uppercase tracking-wider text-muted-foreground self-center mr-2">
            Integrações da campanha:
          </span>
          {links.map((l) => (
            <Link key={l.href} to={l.href}
              className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1 text-xs hover:border-primary/50 hover:bg-accent/40 transition">
              <l.icon className={`h-3.5 w-3.5 ${l.tone}`} />
              {l.label}
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
