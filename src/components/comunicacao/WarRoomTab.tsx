import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { AlertTriangle, Plus, Loader2, Radio, ThumbsUp, ThumbsDown, Flame, Send, ExternalLink } from "lucide-react";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useMencoes, useCreateMencao, useResponderMencao, useWarRoomKPIs, type MencaoCanal, type MencaoSentimento, type MencaoStatus, type Mencao } from "@/hooks/useComunicacao360";

const SENT_LABEL: Record<MencaoSentimento, string> = { positivo: "Positivo", neutro: "Neutro", negativo: "Negativo", crise: "Crise" };
const SENT_VAR: Record<MencaoSentimento, "default" | "secondary" | "outline" | "destructive"> = {
  positivo: "default", neutro: "outline", negativo: "secondary", crise: "destructive",
};
const STATUS_LABEL: Record<MencaoStatus, string> = {
  novo: "Novo", em_analise: "Em análise", respondido: "Respondido", escalado: "Escalado", arquivado: "Arquivado",
};
const CANAIS: MencaoCanal[] = ["instagram", "facebook", "twitter", "tiktok", "youtube", "whatsapp", "imprensa", "blog", "grupo", "outros"];

function KPICard({ icon: Icon, label, value, tone }: { icon: any; label: string; value: number; tone: string }) {
  return (
    <Card>
      <CardContent className="p-4 flex items-center gap-3">
        <div className={`p-2 rounded-lg ${tone}`}><Icon className="h-4 w-4" /></div>
        <div>
          <div className="text-2xl font-bold leading-none">{value}</div>
          <div className="text-[11px] text-muted-foreground mt-1">{label}</div>
        </div>
      </CardContent>
    </Card>
  );
}

export function WarRoomTab() {
  const { data: mencoes = [], isLoading } = useMencoes();
  const { data: kpis } = useWarRoomKPIs();
  const createMencao = useCreateMencao();
  const responder = useResponderMencao();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ canal: "instagram" as MencaoCanal, autor: "", url: "", conteudo: "", sentimento: "neutro" as MencaoSentimento, alcance: "" });
  const [respondingId, setRespondingId] = useState<string | null>(null);
  const [resposta, setResposta] = useState("");
  const [filterSent, setFilterSent] = useState("all");

  const filtered = mencoes.filter((m) => filterSent === "all" || m.sentimento === filterSent);

  const handleCreate = async () => {
    if (!form.conteudo.trim()) return;
    await createMencao.mutateAsync({
      canal: form.canal, autor: form.autor || null, url: form.url || null,
      conteudo: form.conteudo, sentimento: form.sentimento,
      alcance_estimado: form.alcance ? parseInt(form.alcance) : null,
    });
    setForm({ canal: "instagram", autor: "", url: "", conteudo: "", sentimento: "neutro", alcance: "" });
    setOpen(false);
  };

  const handleResponder = async (id: string) => {
    if (!resposta.trim()) return;
    await responder.mutateAsync({ id, resposta, status: "respondido" });
    setResposta(""); setRespondingId(null);
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <KPICard icon={Radio} label="Menções novas" value={kpis?.mencoes_novas ?? 0} tone="bg-primary/10 text-primary" />
        <KPICard icon={Flame} label="Crises ativas" value={kpis?.crises_ativas ?? 0} tone="bg-destructive/10 text-destructive" />
        <KPICard icon={ThumbsDown} label="Negativas (24h)" value={kpis?.negativas_24h ?? 0} tone="bg-orange-500/10 text-orange-600" />
        <KPICard icon={ThumbsUp} label="Positivas (24h)" value={kpis?.positivas_24h ?? 0} tone="bg-emerald-500/10 text-emerald-600" />
        <KPICard icon={AlertTriangle} label="Total (7 dias)" value={kpis?.total_7d ?? 0} tone="bg-muted text-muted-foreground" />
      </div>

      <div className="flex items-center justify-between gap-2">
        <Select value={filterSent} onValueChange={setFilterSent}>
          <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os sentimentos</SelectItem>
            {Object.entries(SENT_LABEL).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
          </SelectContent>
        </Select>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-2"><Plus className="h-4 w-4" />Registrar menção</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Nova menção monitorada</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <Select value={form.canal} onValueChange={(v) => setForm({ ...form, canal: v as MencaoCanal })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{CANAIS.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                </Select>
                <Select value={form.sentimento} onValueChange={(v) => setForm({ ...form, sentimento: v as MencaoSentimento })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{Object.entries(SENT_LABEL).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <Input placeholder="Autor / perfil" value={form.autor} onChange={(e) => setForm({ ...form, autor: e.target.value })} />
              <Input placeholder="URL (opcional)" value={form.url} onChange={(e) => setForm({ ...form, url: e.target.value })} />
              <Textarea placeholder="Conteúdo da menção" value={form.conteudo} onChange={(e) => setForm({ ...form, conteudo: e.target.value })} />
              <Input type="number" placeholder="Alcance estimado" value={form.alcance} onChange={(e) => setForm({ ...form, alcance: e.target.value })} />
            </div>
            <DialogFooter>
              <Button onClick={handleCreate} disabled={createMencao.isPending}>
                {createMencao.isPending && <Loader2 className="h-4 w-4 animate-spin mr-2" />}Registrar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
      ) : filtered.length === 0 ? (
        <Card><CardContent className="py-12 text-center text-sm text-muted-foreground">
          <Radio className="h-8 w-8 mx-auto mb-2 opacity-40" />
          Nenhuma menção registrada. O War Room ficará ativo conforme o monitoramento alimentar dados.
        </CardContent></Card>
      ) : (
        <div className="space-y-3">
          {filtered.map((m: Mencao) => (
            <Card key={m.id} className={m.sentimento === "crise" ? "border-destructive" : ""}>
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2 text-xs">
                    <Badge variant={SENT_VAR[m.sentimento]} className="text-[10px]">{SENT_LABEL[m.sentimento]}</Badge>
                    <Badge variant="outline" className="text-[10px]">{m.canal}</Badge>
                    <Badge variant="secondary" className="text-[10px]">{STATUS_LABEL[m.status]}</Badge>
                    {m.autor && <span className="text-muted-foreground">@{m.autor}</span>}
                  </div>
                  <span className="text-xs text-muted-foreground">{format(parseISO(m.data_mencao), "dd/MM HH:mm", { locale: ptBR })}</span>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-sm">{m.conteudo}</p>
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  {m.alcance_estimado && <span>Alcance ~{m.alcance_estimado.toLocaleString("pt-BR")}</span>}
                  {m.url && (
                    <a href={m.url} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-primary hover:underline">
                      <ExternalLink className="h-3 w-3" />Origem
                    </a>
                  )}
                </div>
                {m.resposta ? (
                  <div className="bg-muted/50 rounded p-2 text-xs">
                    <span className="font-semibold">Resposta:</span> {m.resposta}
                  </div>
                ) : respondingId === m.id ? (
                  <div className="space-y-2">
                    <Textarea value={resposta} onChange={(e) => setResposta(e.target.value)} placeholder="Resposta oficial..." className="text-xs" />
                    <div className="flex gap-2">
                      <Button size="sm" onClick={() => handleResponder(m.id)} disabled={responder.isPending}>
                        <Send className="h-3 w-3 mr-1" />Enviar
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => { setRespondingId(null); setResposta(""); }}>Cancelar</Button>
                    </div>
                  </div>
                ) : (
                  <Button size="sm" variant="outline" onClick={() => setRespondingId(m.id)}>Responder</Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
