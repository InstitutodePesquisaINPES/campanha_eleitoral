import { useEffect, useState } from "react";
import {
  useCampanhaParametros,
  useUpdateCampanhaParametros,
  useRegerarPlano,
  DEFAULTS_PARAMETROS,
  type TarefaTemplate,
} from "@/hooks/useCampanhaParametros";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trash2, Plus, RefreshCw, Save, RotateCcw, Settings2, Scale, Calculator, Gavel, MapPin, Briefcase } from "lucide-react";
import { toast } from "sonner";

const AREAS = ["organizacao","campo","digital","comunicacao","financeiro","juridico","logistica","dados"];
const PRIORIDADES = ["baixa","media","alta","urgente"];
const FASES = ["pre_campanha","lancamento","consolidacao","reta_final"];

function NumberField({ label, value, onChange, step = 1, hint }: { label: string; value: number; onChange: (v: number) => void; step?: number; hint?: string }) {
  return (
    <div className="grid gap-1">
      <Label className="text-xs">{label}</Label>
      <Input type="number" step={step} value={value ?? 0} onChange={(e) => onChange(Number(e.target.value))} className="h-8" />
      {hint && <span className="text-[10px] text-muted-foreground">{hint}</span>}
    </div>
  );
}

function TarefasEditor({
  titulo, icone, tarefas, onChange, allowFase, hint,
}: { titulo: string; icone: React.ReactNode; tarefas: TarefaTemplate[]; onChange: (t: TarefaTemplate[]) => void; allowFase?: boolean; hint?: string }) {
  const update = (i: number, patch: Partial<TarefaTemplate>) => {
    const next = [...tarefas]; next[i] = { ...next[i], ...patch }; onChange(next);
  };
  const add = () => onChange([...tarefas, { dia: 1, semana: 1, area: "organizacao", titulo: "Nova tarefa", prioridade: "alta", ...(allowFase ? { fase: "lancamento" } : {}) }]);
  const remove = (i: number) => onChange(tarefas.filter((_, j) => j !== i));

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">{icone}{titulo}<Badge variant="outline" className="ml-auto">{tarefas.length}</Badge></CardTitle>
        {hint && <CardDescription className="text-xs">{hint}</CardDescription>}
      </CardHeader>
      <CardContent className="space-y-2">
        {tarefas.map((t, i) => (
          <div key={i} className="grid grid-cols-12 gap-2 items-end border rounded-md p-2 bg-muted/30">
            <div className="col-span-1"><Label className="text-[10px]">Dia</Label><Input type="number" className="h-8" value={t.dia} onChange={(e) => update(i, { dia: +e.target.value })} /></div>
            <div className="col-span-1"><Label className="text-[10px]">Sem.</Label><Input type="number" className="h-8" value={t.semana} onChange={(e) => update(i, { semana: +e.target.value })} /></div>
            <div className="col-span-2">
              <Label className="text-[10px]">Área</Label>
              <Select value={t.area} onValueChange={(v) => update(i, { area: v })}>
                <SelectTrigger className="h-8"><SelectValue /></SelectTrigger>
                <SelectContent>{AREAS.map((a) => <SelectItem key={a} value={a}>{a}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className={allowFase ? "col-span-4" : "col-span-6"}>
              <Label className="text-[10px]">Título {allowFase && <span className="text-muted-foreground">(use {"{municipio}"})</span>}</Label>
              <Input className="h-8" value={t.titulo} onChange={(e) => update(i, { titulo: e.target.value })} />
            </div>
            <div className="col-span-2">
              <Label className="text-[10px]">Prioridade</Label>
              <Select value={t.prioridade} onValueChange={(v) => update(i, { prioridade: v })}>
                <SelectTrigger className="h-8"><SelectValue /></SelectTrigger>
                <SelectContent>{PRIORIDADES.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            {allowFase && (
              <div className="col-span-1">
                <Label className="text-[10px]">Fase</Label>
                <Select value={t.fase ?? "lancamento"} onValueChange={(v) => update(i, { fase: v })}>
                  <SelectTrigger className="h-8"><SelectValue /></SelectTrigger>
                  <SelectContent>{FASES.map((f) => <SelectItem key={f} value={f}>{f.replace("_"," ")}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            )}
            <div className="col-span-1 flex justify-end">
              <Button size="icon" variant="ghost" onClick={() => remove(i)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
            </div>
          </div>
        ))}
        <Button size="sm" variant="outline" onClick={add} className="gap-1"><Plus className="h-3 w-3" /> Adicionar</Button>
      </CardContent>
    </Card>
  );
}

export function ParametrosGerador({ campanhaId }: { campanhaId: string }) {
  const { data, isLoading } = useCampanhaParametros(campanhaId);
  const update = useUpdateCampanhaParametros();
  const regerar = useRegerarPlano();
  const [form, setForm] = useState<any>(null);

  useEffect(() => { if (data) setForm({ ...data }); }, [data]);

  if (isLoading || !form) return <div className="text-sm text-muted-foreground">Carregando parâmetros...</div>;

  const set = (patch: any) => setForm((f: any) => ({ ...f, ...patch }));
  const restaurar = () => { setForm({ ...form, ...DEFAULTS_PARAMETROS }); toast.info("Defaults aplicados — clique em Salvar"); };

  const salvar = async () => {
    const { id, campanha_id, created_at, updated_at, ...payload } = form;
    await update.mutateAsync({ campanha_id: campanhaId, ...payload });
  };
  const salvarERegerar = async () => {
    await salvar();
    await regerar.mutateAsync(campanhaId);
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2"><Settings2 className="h-4 w-4 text-primary" /> Parâmetros do gerador de plano 90 dias</CardTitle>
          <CardDescription>Tudo o que o gerador usa: escalas, fórmulas, marcos legais e tarefas extras. Edite e regenere quando quiser.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <Button size="sm" onClick={salvar} disabled={update.isPending} className="gap-1"><Save className="h-4 w-4" /> Salvar</Button>
          <Button size="sm" variant="default" onClick={salvarERegerar} disabled={update.isPending || regerar.isPending} className="gap-1"><RefreshCw className="h-4 w-4" /> Salvar e regerar plano</Button>
          <Button size="sm" variant="outline" onClick={restaurar} className="gap-1"><RotateCcw className="h-4 w-4" /> Restaurar defaults</Button>
          <div className="ml-auto flex items-center gap-2">
            <Switch checked={form.preservar_concluidas} onCheckedChange={(v) => set({ preservar_concluidas: v })} />
            <Label className="text-xs">Preservar tarefas concluídas ao regerar</Label>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2"><Scale className="h-4 w-4" /> Escala de ações por cargo</CardTitle>
          <CardDescription className="text-xs">Multiplica volumes (equipe, seguidores, orçamento). 1.0 = vereador padrão.</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          <NumberField label="Vereador" step={0.1} value={form.escala_vereador} onChange={(v) => set({ escala_vereador: v })} />
          <NumberField label="Vice-prefeito" step={0.1} value={form.escala_vice_prefeito} onChange={(v) => set({ escala_vice_prefeito: v })} />
          <NumberField label="Prefeito" step={0.1} value={form.escala_prefeito} onChange={(v) => set({ escala_prefeito: v })} />
          <NumberField label="Dep. Estadual" step={0.1} value={form.escala_deputado_estadual} onChange={(v) => set({ escala_deputado_estadual: v })} />
          <NumberField label="Dep. Federal" step={0.1} value={form.escala_deputado_federal} onChange={(v) => set({ escala_deputado_federal: v })} />
          <NumberField label="Senador" step={0.1} value={form.escala_senador} onChange={(v) => set({ escala_senador: v })} />
          <NumberField label="Vice-governador" step={0.1} value={form.escala_vice_governador} onChange={(v) => set({ escala_vice_governador: v })} />
          <NumberField label="Governador" step={0.1} value={form.escala_governador} onChange={(v) => set({ escala_governador: v })} />
          <NumberField label="Presidente" step={0.1} value={form.escala_presidente} onChange={(v) => set({ escala_presidente: v })} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2"><Calculator className="h-4 w-4" /> Fórmulas a partir da meta de votos</CardTitle>
          <CardDescription className="text-xs">Define como cadastros, visitas, fiscais e orçamento são calculados.</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <NumberField label="% cadastros / votos" step={0.01} value={form.pct_cadastro_sobre_votos} onChange={(v) => set({ pct_cadastro_sobre_votos: v })} hint="Ex: 0.30 = 30%" />
          <NumberField label="% visitas / votos" step={0.01} value={form.pct_visitas_sobre_votos} onChange={(v) => set({ pct_visitas_sobre_votos: v })} hint="Ex: 0.50 = 50%" />
          <NumberField label="Votos por fiscal" value={form.votos_por_fiscal} onChange={(v) => set({ votos_por_fiscal: v })} hint="1 fiscal a cada N votos meta" />
          <NumberField label="Custo por voto (R$)" step={0.5} value={form.custo_por_voto_reais} onChange={(v) => set({ custo_por_voto_reais: v })} hint="× votos × escala" />
          <Separator className="col-span-full my-1" />
          <NumberField label="Mín. cadastros" value={form.min_cadastro} onChange={(v) => set({ min_cadastro: v })} />
          <NumberField label="Mín. visitas total" value={form.min_visitas} onChange={(v) => set({ min_visitas: v })} />
          <NumberField label="Mín. visitas/semana" value={form.min_visitas_semana} onChange={(v) => set({ min_visitas_semana: v })} />
          <NumberField label="Mín. fiscais" value={form.min_fiscais} onChange={(v) => set({ min_fiscais: v })} />
          <NumberField label="Orçamento mínimo (R$)" value={form.min_orcamento_reais} onChange={(v) => set({ min_orcamento_reais: v })} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2"><Gavel className="h-4 w-4" /> Marcos legais TSE</CardTitle>
          <CardDescription className="text-xs">Dias antes da eleição (D-x). Desligue marcos que não se aplicam.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          {[
            ["tse_registro", "Registro de candidatura"],
            ["tse_propaganda", "Início da propaganda eleitoral"],
            ["tse_hgpe", "Início HGPE (rádio e TV)"],
            ["tse_prestacao", "Prestação de contas parcial"],
            ["tse_debates", "Período de debates oficiais"],
          ].map(([k, label]) => (
            <div key={k} className="flex items-center gap-3 border rounded-md p-2">
              <Switch checked={form[`${k}_ativo`]} onCheckedChange={(v) => set({ [`${k}_ativo`]: v })} />
              <div className="flex-1 text-sm">{label}</div>
              <Label className="text-xs text-muted-foreground">D-</Label>
              <Input type="number" className="h-8 w-20" value={form[`${k}_dias`]} onChange={(e) => set({ [`${k}_dias`]: +e.target.value })} />
            </div>
          ))}
        </CardContent>
      </Card>

      <TarefasEditor
        titulo="Tarefas extras — cargos executivos"
        icone={<Briefcase className="h-4 w-4" />}
        tarefas={(form.tarefas_executivo ?? []) as TarefaTemplate[]}
        onChange={(t) => set({ tarefas_executivo: t })}
        hint="Aplicadas para prefeito, vice-prefeito, governador, vice-governador e presidente."
      />

      <TarefasEditor
        titulo="Tarefas extras — cargos legislativos"
        icone={<Briefcase className="h-4 w-4" />}
        tarefas={(form.tarefas_legislativo ?? []) as TarefaTemplate[]}
        onChange={(t) => set({ tarefas_legislativo: t })}
        hint="Aplicadas para deputado estadual, deputado federal e senador."
      />

      <TarefasEditor
        titulo="Tarefas por município de foco"
        icone={<MapPin className="h-4 w-4" />}
        tarefas={(form.tarefas_municipio_foco ?? []) as TarefaTemplate[]}
        onChange={(t) => set({ tarefas_municipio_foco: t })}
        allowFase
        hint="Replicadas para cada município marcado como foco. Use {municipio} no título."
      />

      <div className="flex justify-end gap-2 sticky bottom-2 bg-background/80 backdrop-blur p-2 rounded-md border">
        <Button size="sm" variant="outline" onClick={restaurar} className="gap-1"><RotateCcw className="h-4 w-4" /> Defaults</Button>
        <Button size="sm" onClick={salvar} disabled={update.isPending} className="gap-1"><Save className="h-4 w-4" /> Salvar</Button>
        <Button size="sm" variant="default" onClick={salvarERegerar} disabled={update.isPending || regerar.isPending} className="gap-1"><RefreshCw className="h-4 w-4" /> Salvar e regerar plano</Button>
      </div>
    </div>
  );
}
