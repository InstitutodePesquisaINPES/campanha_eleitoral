import { useMemo, useState } from "react";
import { useCaptacao, useUpsertDoador, useDeleteDoador } from "@/hooks/usePesquisasCaptacao";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Trash2, Pencil, Phone, Mail, ArrowRight, DollarSign, Upload, BarChart3, LayoutGrid, Clock, AlertTriangle } from "lucide-react";
import { CaptacaoImportDialog } from "./CaptacaoImportDialog";
import { CaptacaoRelatorio } from "./CaptacaoRelatorio";

// SLA em dias por etapa (limite antes de alertar)
const SLA_DIAS: Record<string, number> = {
  prospect: 5, contatado: 5, negociando: 10, confirmado: 15, recebido: 0, recusado: 0,
};

function diasParado(updatedAt: string): number {
  if (!updatedAt) return 0;
  const diff = Date.now() - new Date(updatedAt).getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

function slaLevel(status: string, updatedAt: string): "ok" | "alerta" | "estourado" {
  const limite = SLA_DIAS[status] ?? 0;
  if (limite === 0) return "ok";
  const d = diasParado(updatedAt);
  if (d > limite) return "estourado";
  if (d > limite * 0.7) return "alerta";
  return "ok";
}


type Status = "prospect" | "contatado" | "negociando" | "confirmado" | "recebido" | "recusado";

const STAGES: { key: Status; label: string; color: string; hint: string }[] = [
  { key: "prospect", label: "Prospect", color: "bg-slate-500/10 text-slate-300 border-slate-500/30", hint: "Identificado, ainda não abordado" },
  { key: "contatado", label: "Contatado", color: "bg-blue-500/10 text-blue-300 border-blue-500/30", hint: "Primeiro contato realizado" },
  { key: "negociando", label: "Negociando", color: "bg-amber-500/10 text-amber-300 border-amber-500/30", hint: "Em conversa / proposta" },
  { key: "confirmado", label: "Comprometido", color: "bg-purple-500/10 text-purple-300 border-purple-500/30", hint: "Compromisso firmado" },
  { key: "recebido", label: "Recebido", color: "bg-emerald-500/10 text-emerald-300 border-emerald-500/30", hint: "Valor efetivamente recebido" },
  { key: "recusado", label: "Recusado", color: "bg-red-500/10 text-red-300 border-red-500/30", hint: "Sem interesse" },
];

const emptyForm = {
  id: "",
  nome: "",
  documento: "",
  email: "",
  telefone: "",
  status: "prospect" as Status,
  valor_estimado: "",
  valor_confirmado: "",
  valor_recebido: "",
  observacoes: "",
};

function fmt(n: number) {
  return `R$ ${Number(n || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`;
}

export function CaptacaoPipeline() {
  const { data: doadores = [], isLoading } = useCaptacao();
  const upsert = useUpsertDoador();
  const del = useDeleteDoador();

  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);

  const grouped = useMemo(() => {
    const g: Record<Status, any[]> = { prospect: [], contatado: [], negociando: [], confirmado: [], recebido: [], recusado: [] };
    (doadores as any[]).forEach((d) => { if (g[d.status as Status]) g[d.status as Status].push(d); });
    return g;
  }, [doadores]);

  const totals = useMemo(() => {
    return (doadores as any[]).reduce(
      (acc, d) => {
        acc.estimado += Number(d.valor_estimado || 0);
        acc.confirmado += Number(d.valor_confirmado || 0);
        acc.recebido += Number(d.valor_recebido || 0);
        return acc;
      },
      { estimado: 0, confirmado: 0, recebido: 0 }
    );
  }, [doadores]);

  function openNew() {
    setForm(emptyForm);
    setOpen(true);
  }
  function openEdit(d: any) {
    setForm({
      id: d.id,
      nome: d.nome || "",
      documento: d.documento || "",
      email: d.email || "",
      telefone: d.telefone || "",
      status: d.status,
      valor_estimado: d.valor_estimado?.toString() || "",
      valor_confirmado: d.valor_confirmado?.toString() || "",
      valor_recebido: d.valor_recebido?.toString() || "",
      observacoes: d.observacoes || "",
    });
    setOpen(true);
  }

  async function submit() {
    if (!form.nome.trim()) return;
    const payload: any = {
      nome: form.nome.trim(),
      documento: form.documento || null,
      email: form.email || null,
      telefone: form.telefone || null,
      status: form.status,
      valor_estimado: form.valor_estimado ? Number(form.valor_estimado) : 0,
      valor_confirmado: form.valor_confirmado ? Number(form.valor_confirmado) : 0,
      valor_recebido: form.valor_recebido ? Number(form.valor_recebido) : 0,
      observacoes: form.observacoes || null,
    };
    if (form.id) payload.id = form.id;
    // stamp progression dates
    const today = new Date().toISOString().slice(0, 10);
    if (form.status === "contatado" || form.status === "negociando") payload.data_contato = today;
    if (form.status === "confirmado") payload.data_confirmacao = today;
    if (form.status === "recebido") payload.data_recebimento = today;

    await upsert.mutateAsync(payload);
    setOpen(false);
  }

  async function moveStage(d: any, next: Status) {
    const patch: any = { id: d.id, status: next };
    const today = new Date().toISOString().slice(0, 10);
    if (next === "contatado" && !d.data_contato) patch.data_contato = today;
    if (next === "confirmado" && !d.data_confirmacao) patch.data_confirmacao = today;
    if (next === "recebido" && !d.data_recebimento) patch.data_recebimento = today;
    await upsert.mutateAsync(patch);
  }

  function nextStage(s: Status): Status | null {
    const order: Status[] = ["prospect", "contatado", "negociando", "confirmado", "recebido"];
    const i = order.indexOf(s);
    if (i === -1 || i === order.length - 1) return null;
    return order[i + 1];
  }

  return (
    <div className="space-y-4">
      {/* Totais */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card><CardContent className="pt-4"><p className="text-[10px] text-muted-foreground">Estimado</p><p className="text-lg font-bold">{fmt(totals.estimado)}</p></CardContent></Card>
        <Card><CardContent className="pt-4"><p className="text-[10px] text-muted-foreground">Comprometido</p><p className="text-lg font-bold text-purple-300">{fmt(totals.confirmado)}</p></CardContent></Card>
        <Card><CardContent className="pt-4"><p className="text-[10px] text-muted-foreground">Recebido</p><p className="text-lg font-bold text-emerald-400">{fmt(totals.recebido)}</p></CardContent></Card>
        <Card><CardContent className="pt-4"><p className="text-[10px] text-muted-foreground">Doadores</p><p className="text-lg font-bold">{(doadores as any[]).length}</p></CardContent></Card>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold">Pipeline de Captação</h3>
          <p className="text-xs text-muted-foreground">Prospect → Contatado → Negociando → Comprometido → Recebido</p>
        </div>
        <Button size="sm" onClick={openNew}><Plus className="h-3 w-3 mr-1" /> Novo doador</Button>
      </div>

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Carregando...</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-6 gap-3">
          {STAGES.map((s) => {
            const items = grouped[s.key];
            const total = items.reduce((acc: number, d: any) =>
              acc + Number(s.key === "recebido" ? d.valor_recebido : s.key === "confirmado" ? d.valor_confirmado : d.valor_estimado || 0), 0);
            return (
              <Card key={s.key} className="min-h-[300px]">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center justify-between">
                    <span>{s.label}</span>
                    <Badge variant="outline" className={s.color}>{items.length}</Badge>
                  </CardTitle>
                  <p className="text-[10px] text-muted-foreground">{s.hint}</p>
                  <p className="text-[11px] font-medium text-foreground/80">{fmt(total)}</p>
                </CardHeader>
                <CardContent className="space-y-2">
                  {items.length === 0 && <p className="text-[11px] text-muted-foreground italic">Vazio</p>}
                  {items.map((d: any) => {
                    const nxt = nextStage(d.status);
                    return (
                      <div key={d.id} className="rounded-md border border-border/50 bg-card/50 p-2 space-y-1">
                        <div className="flex items-start justify-between gap-1">
                          <button className="text-xs font-medium text-left hover:underline flex-1" onClick={() => openEdit(d)}>
                            {d.nome}
                          </button>
                          <div className="flex gap-1">
                            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => openEdit(d)}><Pencil className="h-3 w-3" /></Button>
                            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => { if (confirm(`Remover ${d.nome}?`)) del.mutate(d.id); }}><Trash2 className="h-3 w-3 text-red-400" /></Button>
                          </div>
                        </div>
                        {d.telefone && <p className="text-[10px] text-muted-foreground flex items-center gap-1"><Phone className="h-2.5 w-2.5" />{d.telefone}</p>}
                        {d.email && <p className="text-[10px] text-muted-foreground flex items-center gap-1"><Mail className="h-2.5 w-2.5" />{d.email}</p>}
                        <p className="text-[10px] flex items-center gap-1"><DollarSign className="h-2.5 w-2.5" />
                          {s.key === "recebido" ? fmt(d.valor_recebido) : s.key === "confirmado" ? fmt(d.valor_confirmado) : fmt(d.valor_estimado)}
                        </p>
                        <div className="flex gap-1 pt-1">
                          <Select value={d.status} onValueChange={(v) => moveStage(d, v as Status)}>
                            <SelectTrigger className="h-6 text-[10px] flex-1"><SelectValue /></SelectTrigger>
                            <SelectContent>
                              {STAGES.map((st) => <SelectItem key={st.key} value={st.key} className="text-xs">{st.label}</SelectItem>)}
                            </SelectContent>
                          </Select>
                          {nxt && (
                            <Button size="icon" variant="outline" className="h-6 w-6" title={`Mover para ${STAGES.find(s2 => s2.key === nxt)?.label}`} onClick={() => moveStage(d, nxt)}>
                              <ArrowRight className="h-3 w-3" />
                            </Button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{form.id ? "Editar doador" : "Novo doador"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label className="text-xs">Nome *</Label>
              <Input value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label className="text-xs">Documento (CPF/CNPJ)</Label>
                <Input value={form.documento} onChange={(e) => setForm({ ...form, documento: e.target.value })} />
              </div>
              <div>
                <Label className="text-xs">Telefone</Label>
                <Input value={form.telefone} onChange={(e) => setForm({ ...form, telefone: e.target.value })} />
              </div>
            </div>
            <div>
              <Label className="text-xs">E-mail</Label>
              <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            </div>
            <div>
              <Label className="text-xs">Etapa</Label>
              <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v as Status })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {STAGES.map((st) => <SelectItem key={st.key} value={st.key}>{st.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div>
                <Label className="text-xs">Estimado (R$)</Label>
                <Input type="number" step="0.01" value={form.valor_estimado} onChange={(e) => setForm({ ...form, valor_estimado: e.target.value })} />
              </div>
              <div>
                <Label className="text-xs">Comprometido (R$)</Label>
                <Input type="number" step="0.01" value={form.valor_confirmado} onChange={(e) => setForm({ ...form, valor_confirmado: e.target.value })} />
              </div>
              <div>
                <Label className="text-xs">Recebido (R$)</Label>
                <Input type="number" step="0.01" value={form.valor_recebido} onChange={(e) => setForm({ ...form, valor_recebido: e.target.value })} />
              </div>
            </div>
            <div>
              <Label className="text-xs">Observações</Label>
              <Textarea value={form.observacoes} onChange={(e) => setForm({ ...form, observacoes: e.target.value })} rows={3} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
            <Button onClick={submit} disabled={upsert.isPending || !form.nome.trim()}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
