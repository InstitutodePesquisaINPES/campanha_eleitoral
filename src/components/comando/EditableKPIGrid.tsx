import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { AlertTriangle, Calendar, CheckCircle2, ClipboardList, DollarSign, Pencil, TrendingUp, Users, Save } from "lucide-react";
import { useUpdateCampanha } from "@/hooks/useCampanhas";
import { useCanManage } from "@/hooks/useUserRoles";

interface Props {
  data: {
    campanha_id: string;
    dias_restantes: number;
    total_pessoas: number;
    meta_votos: number | null;
    data_eleicao: string;
    demandas_abertas: number;
    demandas_urgentes: number;
    demandas_resolvidas: number;
    eventos_futuros: number;
    tarefas_concluidas: number;
    tarefas_total: number;
    tarefas_atrasadas: number;
    total_gasto: number;
    orcamento_total: number;
  };
}

const fmtBRL = (n: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 }).format(n);

export function EditableKPIGrid({ data }: Props) {
  const canManage = useCanManage();
  const updateCampanha = useUpdateCampanha();

  const metaPct = data.meta_votos ? Math.min(100, (data.total_pessoas / data.meta_votos) * 100) : 0;
  const tarefasPct = data.tarefas_total ? (data.tarefas_concluidas / data.tarefas_total) * 100 : 0;
  const orcPct = data.orcamento_total ? Math.min(100, (data.total_gasto / data.orcamento_total) * 100) : 0;

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {/* Dias restantes — editável (data eleição) */}
      <KPICard
        label="Dias restantes"
        value={data.dias_restantes >= 0 ? String(data.dias_restantes) : "—"}
        sub={`até ${new Date(data.data_eleicao).toLocaleDateString("pt-BR")}`}
        icon={Calendar}
        tone={data.dias_restantes < 30 ? "text-destructive" : "text-primary"}
        editable={canManage}
        editor={(close) => (
          <EditorData
            initial={data.data_eleicao}
            label="Data da eleição"
            saving={updateCampanha.isPending}
            onSave={(v) => updateCampanha.mutate({ id: data.campanha_id, data_eleicao: v }, { onSuccess: close })}
          />
        )}
      />

      {/* Cadastrados x meta global — editar meta */}
      <KPICard
        label="Cadastrados / Meta global"
        value={data.total_pessoas.toLocaleString("pt-BR")}
        sub={data.meta_votos ? `${metaPct.toFixed(0)}% de ${data.meta_votos.toLocaleString("pt-BR")} votos` : "defina a meta"}
        icon={Users}
        tone="text-primary"
        progress={metaPct}
        editable={canManage}
        editor={(close) => (
          <EditorNumero
            initial={data.meta_votos ?? 0}
            label="Meta de votos (global)"
            saving={updateCampanha.isPending}
            onSave={(v) => updateCampanha.mutate({ id: data.campanha_id, meta_votos: v }, { onSuccess: close })}
          />
        )}
      />

      <KPICard
        label="Tarefas"
        value={`${data.tarefas_concluidas}/${data.tarefas_total}`}
        sub={data.tarefas_atrasadas > 0 ? `${data.tarefas_atrasadas} atrasadas` : "no prazo"}
        icon={ClipboardList}
        tone={data.tarefas_atrasadas > 0 ? "text-destructive" : "text-primary"}
        progress={tarefasPct}
      />

      <KPICard
        label="Demandas abertas"
        value={String(data.demandas_abertas)}
        sub={`${data.demandas_urgentes} urgentes • ${data.demandas_resolvidas} resolvidas`}
        icon={data.demandas_urgentes > 0 ? AlertTriangle : CheckCircle2}
        tone={data.demandas_urgentes > 0 ? "text-destructive" : "text-primary"}
      />

      <KPICard
        label="Eventos futuros"
        value={String(data.eventos_futuros)}
        sub="agendados"
        icon={TrendingUp}
        tone="text-primary"
      />

      {/* Orçamento — editar orçamento total */}
      <KPICard
        label="Orçamento"
        value={fmtBRL(data.total_gasto)}
        sub={data.orcamento_total ? `${orcPct.toFixed(0)}% de ${fmtBRL(data.orcamento_total)}` : "defina o orçamento"}
        icon={DollarSign}
        tone={orcPct > 90 ? "text-destructive" : "text-primary"}
        progress={orcPct}
        editable={canManage}
        editor={(close) => (
          <EditorNumero
            initial={Number(data.orcamento_total ?? 0)}
            label="Orçamento total (R$)"
            saving={updateCampanha.isPending}
            onSave={(v) => updateCampanha.mutate({ id: data.campanha_id, orcamento_total: v }, { onSuccess: close })}
          />
        )}
      />
    </div>
  );
}

function KPICard({
  label, value, sub, icon: Icon, tone, progress, editable, editor,
}: {
  label: string; value: string; sub: string;
  icon: React.ComponentType<{ className?: string }>;
  tone: string; progress?: number;
  editable?: boolean;
  editor?: (close: () => void) => React.ReactNode;
}) {
  const [open, setOpen] = useState(false);

  const card = (
    <Card className={editable ? "relative cursor-pointer transition hover:border-primary/40 hover:shadow-md" : "relative"}>
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
            <p className="mt-1 text-3xl font-bold">{value}</p>
            <p className="mt-1 text-xs text-muted-foreground">{sub}</p>
          </div>
          <div className="flex flex-col items-end gap-1">
            <Icon className={`h-5 w-5 ${tone}`} />
            {editable && <Pencil className="h-3 w-3 text-muted-foreground/50" />}
          </div>
        </div>
        {typeof progress === "number" && <Progress value={progress} className="mt-3 h-1.5" />}
      </CardContent>
    </Card>
  );

  if (!editable || !editor) return card;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>{card}</PopoverTrigger>
      <PopoverContent className="w-72" align="start">
        {editor(() => setOpen(false))}
      </PopoverContent>
    </Popover>
  );
}

function EditorNumero({ initial, label, onSave, saving }: { initial: number; label: string; saving: boolean; onSave: (v: number) => void }) {
  const [v, setV] = useState(String(initial ?? 0));
  return (
    <div className="space-y-2">
      <Label className="text-xs">{label}</Label>
      <Input type="number" value={v} onChange={(e) => setV(e.target.value)} autoFocus />
      <Button size="sm" className="w-full" disabled={saving} onClick={() => onSave(Number(v) || 0)}>
        <Save className="h-3.5 w-3.5 mr-1" />Salvar
      </Button>
    </div>
  );
}

function EditorData({ initial, label, onSave, saving }: { initial: string; label: string; saving: boolean; onSave: (v: string) => void }) {
  const [v, setV] = useState(initial);
  return (
    <div className="space-y-2">
      <Label className="text-xs">{label}</Label>
      <Input type="date" value={v} onChange={(e) => setV(e.target.value)} autoFocus />
      <Button size="sm" className="w-full" disabled={saving || !v} onClick={() => onSave(v)}>
        <Save className="h-3.5 w-3.5 mr-1" />Salvar
      </Button>
    </div>
  );
}
