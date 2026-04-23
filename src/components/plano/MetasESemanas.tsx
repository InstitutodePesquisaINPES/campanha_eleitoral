import { useState } from "react";
import { useFases, useMetas, useSemanas, useUpdateMeta, useCreateMeta, useDeleteMeta } from "@/hooks/useCampanhas";
import { useCanManage } from "@/hooks/useUserRoles";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Target, Flag, Plus, Trash2, MessageSquare, AlertTriangle, CheckCircle2, TrendingUp } from "lucide-react";

const faseLabels: Record<string, string> = {
  pre_campanha: "Pré-campanha", lancamento: "Lançamento", consolidacao: "Consolidação", reta_final: "Reta Final",
};
const faseColors: Record<string, string> = {
  pre_campanha: "bg-info/10 text-info border-info/30",
  lancamento: "bg-primary/10 text-primary border-primary/30",
  consolidacao: "bg-success/10 text-success border-success/30",
  reta_final: "bg-destructive/10 text-destructive border-destructive/30",
};
const AREAS = ["organizacao","campo","digital","financeiro","juridico","comunicacao","logistica","dados"] as const;
const FASES = ["pre_campanha","lancamento","consolidacao","reta_final"] as const;

function NovaMetaDialog({ campanhaId, canManage }: { campanhaId: string; canManage: boolean }) {
  const [open, setOpen] = useState(false);
  const create = useCreateMeta();
  const [form, setForm] = useState({ meta: "", indicador: "", area: "campo", fase: "pre_campanha", valor_meta: 100 });
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline" className="h-8 gap-1" disabled={!canManage}><Plus className="h-3.5 w-3.5" />Nova meta</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader><DialogTitle>Adicionar meta</DialogTitle></DialogHeader>
        <div className="grid gap-3">
          <div><Label>Meta *</Label><Input value={form.meta} onChange={(e) => setForm({ ...form, meta: e.target.value })} placeholder="Ex.: Cadastrar eleitores" /></div>
          <div><Label>Indicador *</Label><Input value={form.indicador} onChange={(e) => setForm({ ...form, indicador: e.target.value })} placeholder="Ex.: Eleitores no SIGT" /></div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <Label>Fase</Label>
              <Select value={form.fase} onValueChange={(v) => setForm({ ...form, fase: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{FASES.map(f => <SelectItem key={f} value={f}>{faseLabels[f]}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <Label>Área</Label>
              <Select value={form.area} onValueChange={(v) => setForm({ ...form, area: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{AREAS.map(a => <SelectItem key={a} value={a} className="capitalize">{a}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div><Label>Valor meta</Label><Input type="number" value={form.valor_meta} onChange={(e) => setForm({ ...form, valor_meta: +e.target.value })} /></div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
          <Button
            disabled={!form.meta || !form.indicador || create.isPending}
            onClick={async () => {
              await create.mutateAsync({
                campanha_id: campanhaId,
                meta: form.meta,
                indicador: form.indicador,
                area: form.area as never,
                fase: form.fase as never,
                valor_meta: form.valor_meta,
              });
              setForm({ meta: "", indicador: "", area: "campo", fase: "pre_campanha", valor_meta: 100 });
              setOpen(false);
            }}
          >
            {create.isPending ? "Salvando..." : "Adicionar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function ObservacoesPopover({ id, value, canManage, onSave }: { id: string; value: string; canManage: boolean; onSave: (v: string) => void }) {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState(value);
  return (
    <Popover open={open} onOpenChange={(o) => { setOpen(o); if (o) setText(value); }}>
      <PopoverTrigger asChild>
        <button
          className="text-muted-foreground hover:text-foreground p-0.5 disabled:opacity-40"
          disabled={!canManage}
          title={value ? "Ver/editar observações" : "Adicionar observações"}
        >
          <MessageSquare className={`h-3 w-3 ${value ? "text-info" : ""}`} />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-80" align="end">
        <Label className="text-xs">Observações da meta</Label>
        <Textarea
          rows={4}
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="mt-1 text-xs"
          placeholder="Contexto, justificativa, dependências, riscos..."
          disabled={!canManage}
        />
        <div className="flex justify-end gap-1 mt-2">
          <Button size="sm" variant="ghost" onClick={() => setOpen(false)}>Cancelar</Button>
          <Button size="sm" onClick={() => { onSave(text); setOpen(false); }} disabled={!canManage}>Salvar</Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}

export function MetasFases({ campanhaId }: { campanhaId: string }) {
  const { data: fases = [] } = useFases(campanhaId);
  const { data: metas = [] } = useMetas(campanhaId);
  const canManage = useCanManage();
  const update = useUpdateMeta();
  const remove = useDeleteMeta();

  const metasPorFase = (faseKey: string) => metas.filter((m) => m.fase === faseKey);

  // Saúde global
  const totalMeta = metas.reduce((s, m) => s + (Number(m.valor_meta) || 0), 0);
  const totalReal = metas.reduce((s, m) => s + (Number(m.valor_realizado) || 0), 0);
  const pctGlobal = totalMeta > 0 ? Math.round((totalReal / totalMeta) * 100) : 0;
  const metasAtingidas = metas.filter((m) => Number(m.valor_meta) > 0 && Number(m.valor_realizado) >= Number(m.valor_meta)).length;
  const metasRisco = metas.filter((m) => {
    const p = Number(m.valor_meta) > 0 ? (Number(m.valor_realizado) / Number(m.valor_meta)) : 0;
    return p > 0 && p < 0.5;
  }).length;

  return (
    <div className="space-y-4">
      {/* SAÚDE GERAL */}
      {metas.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Card>
            <CardContent className="p-3">
              <div className="flex items-center gap-2 mb-1"><TrendingUp className="h-4 w-4 text-primary" /><span className="text-xs text-muted-foreground">Saúde geral</span></div>
              <div className="text-2xl font-bold">{pctGlobal}%</div>
              <Progress value={pctGlobal} className="h-1.5 mt-1" />
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3">
              <div className="flex items-center gap-2 mb-1"><Target className="h-4 w-4 text-info" /><span className="text-xs text-muted-foreground">Metas</span></div>
              <div className="text-2xl font-bold">{metas.length}</div>
              <p className="text-[10px] text-muted-foreground">{fases.length} fases</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3">
              <div className="flex items-center gap-2 mb-1"><CheckCircle2 className="h-4 w-4 text-success" /><span className="text-xs text-muted-foreground">Atingidas</span></div>
              <div className="text-2xl font-bold text-success">{metasAtingidas}</div>
              <p className="text-[10px] text-muted-foreground">de {metas.length}</p>
            </CardContent>
          </Card>
          <Card className={metasRisco > 0 ? "border-destructive/40" : ""}>
            <CardContent className="p-3">
              <div className="flex items-center gap-2 mb-1"><AlertTriangle className={`h-4 w-4 ${metasRisco > 0 ? "text-destructive" : "text-muted-foreground"}`} /><span className="text-xs text-muted-foreground">Em risco (&lt;50%)</span></div>
              <div className={`text-2xl font-bold ${metasRisco > 0 ? "text-destructive" : ""}`}>{metasRisco}</div>
              <p className="text-[10px] text-muted-foreground">priorizar</p>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-muted-foreground">
          Edite título, indicador, fase, área, meta, realizado e observações diretamente nos cards.
          {!canManage && " Seu perfil está em modo somente leitura."}
        </p>
        <NovaMetaDialog campanhaId={campanhaId} canManage={canManage} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {fases.map((f) => {
          const ms = metasPorFase(f.fase);
          const total = ms.reduce((acc, m) => acc + (Number(m.valor_meta) || 0), 0);
          const realizado = ms.reduce((acc, m) => acc + (Number(m.valor_realizado) || 0), 0);
          const pct = total > 0 ? Math.min(100, Math.round((realizado / total) * 100)) : 0;
          return (
            <Card key={f.id}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between gap-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Flag className="h-4 w-4 text-primary" />
                    {f.nome}
                  </CardTitle>
                  <Badge variant="outline" className={faseColors[f.fase]}>{faseLabels[f.fase]}</Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {new Date(f.data_inicio).toLocaleDateString("pt-BR")} → {new Date(f.data_fim).toLocaleDateString("pt-BR")}
                  {" · "}{Math.max(0, Math.ceil((new Date(f.data_fim).getTime() - new Date(f.data_inicio).getTime()) / 86400000))} dias
                </p>
                {f.foco && <p className="text-xs text-muted-foreground italic">{f.foco}</p>}
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-muted-foreground">Progresso geral · {ms.length} metas</span>
                    <span className={`font-medium ${pct >= 80 ? "text-success" : pct >= 50 ? "" : pct > 0 ? "text-warning" : "text-muted-foreground"}`}>{pct}%</span>
                  </div>
                  <Progress value={pct} className="h-2" />
                </div>
                <div className="space-y-2">
                  {ms.map((m) => {
                    const p = Number(m.valor_meta) > 0 ? Math.min(100, Math.round((Number(m.valor_realizado) / Number(m.valor_meta)) * 100)) : 0;
                    const tone = p >= 100 ? "bg-success/10 text-success border-success/30"
                      : p >= 50 ? "bg-info/10 text-info border-info/30"
                      : p > 0 ? "bg-warning/10 text-warning border-warning/30"
                      : "bg-muted text-muted-foreground";
                    return (
                      <div key={m.id} className="border border-border rounded-md p-2.5 space-y-2">
                        <div className="flex items-start justify-between gap-2 mb-1.5">
                          <div className="min-w-0">
                            <p className="text-[10px] text-muted-foreground">Meta editável · clique para editar</p>
                          </div>
                          <div className="flex items-center gap-1 shrink-0">
                            <Badge variant="outline" className={`text-[10px] ${tone}`}>{p}%</Badge>
                            <ObservacoesPopover
                              id={m.id}
                              value={m.observacoes ?? ""}
                              canManage={canManage}
                              onSave={(v) => update.mutate({ id: m.id, observacoes: v || null } as never)}
                            />
                            <button
                              onClick={() => canManage && confirm(`Remover meta "${m.meta}"?`) && remove.mutate(m.id)}
                              disabled={!canManage}
                              className="text-muted-foreground hover:text-destructive p-0.5 disabled:opacity-40 disabled:cursor-not-allowed"
                              title="Remover meta"
                            >
                              <Trash2 className="h-3 w-3" />
                            </button>
                          </div>
                        </div>
                        <div className="grid gap-2 md:grid-cols-2">
                          <div>
                            <Label className="text-[10px] text-muted-foreground">Meta (descrição)</Label>
                            <Input
                              className="h-8 text-xs"
                              defaultValue={m.meta}
                              disabled={!canManage}
                              onBlur={(e) => {
                                const v = e.target.value.trim();
                                if (v && v !== m.meta) update.mutate({ id: m.id, meta: v });
                              }}
                            />
                          </div>
                          <div>
                            <Label className="text-[10px] text-muted-foreground">Indicador</Label>
                            <Input
                              className="h-8 text-xs"
                              defaultValue={m.indicador}
                              disabled={!canManage}
                              onBlur={(e) => {
                                const v = e.target.value.trim();
                                if (v && v !== m.indicador) update.mutate({ id: m.id, indicador: v });
                              }}
                            />
                          </div>
                        </div>
                        <div className="grid gap-2 md:grid-cols-4">
                          <div>
                            <Label className="text-[10px] text-muted-foreground">Fase</Label>
                            <Select value={m.fase} onValueChange={(v) => canManage && update.mutate({ id: m.id, fase: v as never })} disabled={!canManage}>
                              <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                              <SelectContent>{FASES.map(f => <SelectItem key={f} value={f}>{faseLabels[f]}</SelectItem>)}</SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label className="text-[10px] text-muted-foreground">Área</Label>
                            <Select value={m.area} onValueChange={(v) => canManage && update.mutate({ id: m.id, area: v as never })} disabled={!canManage}>
                              <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                              <SelectContent>{AREAS.map(a => <SelectItem key={a} value={a} className="capitalize">{a}</SelectItem>)}</SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label className="text-[10px] text-muted-foreground">Valor meta</Label>
                            <Input
                              type="number"
                              className="h-8 text-xs"
                              defaultValue={Number(m.valor_meta)}
                              disabled={!canManage}
                              onBlur={(e) => {
                                const v = Number(e.target.value);
                                if (v !== Number(m.valor_meta)) update.mutate({ id: m.id, valor_meta: v });
                              }}
                            />
                          </div>
                          <div>
                            <Label className="text-[10px] text-muted-foreground">Realizado</Label>
                            <Input
                              type="number"
                              className="h-8 text-xs"
                              defaultValue={Number(m.valor_realizado)}
                              disabled={!canManage}
                              onBlur={(e) => {
                                const v = Number(e.target.value);
                                if (v !== Number(m.valor_realizado)) update.mutate({ id: m.id, valor_realizado: v });
                              }}
                            />
                          </div>
                        </div>
                        {m.observacoes && (
                          <p className="text-[10px] text-muted-foreground italic border-l-2 border-info pl-1.5">
                            💬 {m.observacoes}
                          </p>
                        )}
                      </div>
                    );
                  })}
                  {ms.length === 0 && <p className="text-xs text-muted-foreground text-center py-2">Sem metas nesta fase</p>}
                </div>
              </CardContent>
            </Card>
          );
        })}
        {fases.length === 0 && (
          <Card className="lg:col-span-2">
            <CardContent className="py-12 text-center text-sm text-muted-foreground">
              <Target className="h-8 w-8 mx-auto mb-2 opacity-50" />
              Nenhuma fase configurada. Crie uma campanha para gerar o plano automaticamente.
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

export function PlanejamentoSemanal({ campanhaId }: { campanhaId: string }) {
  const { data: semanas = [] } = useSemanas(campanhaId);

  return (
    <div className="space-y-2">
      {semanas.map((s) => (
        <Card key={s.id}>
          <CardContent className="p-3">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-semibold">Semana {s.numero_semana}</span>
                  <Badge variant="outline" className={faseColors[s.fase]}>{faseLabels[s.fase]}</Badge>
                  <span className="text-[10px] text-muted-foreground">
                    {new Date(s.data_inicio).toLocaleDateString("pt-BR")} → {new Date(s.data_fim).toLocaleDateString("pt-BR")}
                  </span>
                </div>
                <p className="text-sm font-medium text-foreground/90">{s.foco_principal}</p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mt-2 text-[11px]">
                  {s.meta_campo && <div className="bg-success/5 text-foreground p-1.5 rounded border border-success/20"><span className="font-medium text-success">Campo: </span>{s.meta_campo}</div>}
                  {s.meta_digital && <div className="bg-info/5 text-foreground p-1.5 rounded border border-info/20"><span className="font-medium text-info">Digital: </span>{s.meta_digital}</div>}
                  {s.meta_financeiro && <div className="bg-warning/5 text-foreground p-1.5 rounded border border-warning/20"><span className="font-medium text-warning">Financeiro: </span>{s.meta_financeiro}</div>}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
      {semanas.length === 0 && <p className="text-sm text-muted-foreground text-center py-8">Sem semanas configuradas.</p>}
    </div>
  );
}
