import { useState } from "react";
import {
  useDemanda, useUpdateDemanda, useEncaminhamentos, useCreateEncaminhamento,
  useAnexos, useCreateAnexo, useDemandaSLA,
  statusLabels, statusColors, prioridadeLabels, prioridadeColors, categoriaLabels, origemLabels,
} from "@/hooks/useDemandas";
import { DemandaSLABadge } from "./DemandaSLABadge";
import { DemandaHistoricoTimeline } from "./DemandaHistoricoTimeline";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Loader2, Send, FileText, Clock, AlertTriangle, Paperclip, Star, Save, ExternalLink } from "lucide-react";

export function DemandaDetail({ demandaId, onBack }: { demandaId: string; onBack: () => void }) {
  const { toast } = useToast();
  const { data: demanda, isLoading } = useDemanda(demandaId);
  const updateDemanda = useUpdateDemanda();
  const { data: encaminhamentos = [] } = useEncaminhamentos(demandaId);
  const createEncaminhamento = useCreateEncaminhamento();
  const { data: anexos = [] } = useAnexos(demandaId);
  const createAnexo = useCreateAnexo();
  const { data: sla } = useDemandaSLA(demandaId);

  const [encObs, setEncObs] = useState("");
  const [resDescricao, setResDescricao] = useState("");
  const [satisfacao, setSatisfacao] = useState<number>(0);
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState<any>({});
  const [anexoUrl, setAnexoUrl] = useState("");
  const [anexoDesc, setAnexoDesc] = useState("");

  if (isLoading || !demanda) {
    return <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  const isOverdue = demanda.status !== "resolvida" && demanda.status !== "arquivada" && demanda.data_prazo && new Date(demanda.data_prazo) < new Date();
  const days = demanda.data_prazo ? Math.ceil((new Date(demanda.data_prazo).getTime() - Date.now()) / 86400000) : null;

  const startEdit = () => {
    setEditForm({
      titulo: demanda.titulo,
      descricao: demanda.descricao || "",
      categoria: demanda.categoria,
      prioridade: demanda.prioridade,
      origem: demanda.origem || "",
      data_prazo: demanda.data_prazo ? demanda.data_prazo.slice(0, 10) : "",
    });
    setEditing(true);
  };

  const saveEdit = async () => {
    try {
      await updateDemanda.mutateAsync({
        id: demandaId,
        ...editForm,
        data_prazo: editForm.data_prazo ? new Date(editForm.data_prazo).toISOString() : undefined,
        origem: editForm.origem || undefined,
      });
      toast({ title: "✅ Demanda atualizada" });
      setEditing(false);
    } catch (e: any) { toast({ variant: "destructive", description: e.message }); }
  };

  const handleStatusChange = async (status: string) => {
    try {
      const updates: any = { id: demandaId, status };
      if (status === "resolvida") updates.data_resolucao = new Date().toISOString();
      await updateDemanda.mutateAsync(updates);
      toast({ title: `Status: ${statusLabels[status]}` });
    } catch (e: any) { toast({ variant: "destructive", description: e.message }); }
  };

  const handleEncaminhamento = async () => {
    if (!encObs.trim()) return;
    try {
      await createEncaminhamento.mutateAsync({ demanda_id: demandaId, observacao: encObs.trim() });
      setEncObs("");
      toast({ title: "Encaminhamento registrado!" });
    } catch (e: any) { toast({ variant: "destructive", description: e.message }); }
  };

  const handleResolve = async () => {
    try {
      await updateDemanda.mutateAsync({
        id: demandaId, status: "resolvida" as any,
        resolucao_descricao: resDescricao || undefined,
        satisfacao_cidadao: satisfacao || undefined,
        data_resolucao: new Date().toISOString(),
      });
      toast({ title: "✅ Demanda resolvida!" });
    } catch (e: any) { toast({ variant: "destructive", description: e.message }); }
  };

  const handleAnexo = async () => {
    if (!anexoUrl.trim()) return;
    try {
      await createAnexo.mutateAsync({ demanda_id: demandaId, arquivo_url: anexoUrl.trim(), descricao: anexoDesc || undefined });
      setAnexoUrl(""); setAnexoDesc("");
      toast({ title: "Anexo adicionado!" });
    } catch (e: any) { toast({ variant: "destructive", description: e.message }); }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-start gap-3">
        <Button variant="ghost" size="icon" onClick={onBack}><ArrowLeft className="h-5 w-5" /></Button>
        <div className="flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="text-xl font-bold">{demanda.titulo}</h2>
            {sla && <DemandaSLABadge situacao={sla.situacao_sla} horasRestantes={sla.horas_restantes} />}
          </div>
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            <Badge variant="outline" className="font-mono text-[10px]">{demanda.protocolo}</Badge>
            <Badge variant="outline" className={`text-[10px] ${prioridadeColors[demanda.prioridade]}`}>{prioridadeLabels[demanda.prioridade]}</Badge>
            <Badge variant="outline" className={`text-[10px] ${statusColors[demanda.status]}`}>{statusLabels[demanda.status]}</Badge>
            {demanda.categoria && <Badge variant="secondary" className="text-[10px]">{categoriaLabels[demanda.categoria]}</Badge>}
            {demanda.origem && <Badge variant="outline" className="text-[10px]">📞 {origemLabels[demanda.origem]}</Badge>}
          </div>
        </div>
        <Select value={demanda.status} onValueChange={handleStatusChange}>
          <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
          <SelectContent>{Object.entries(statusLabels).map(([k, v]) => (<SelectItem key={k} value={k}>{v}</SelectItem>))}</SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card><CardContent className="pt-4">
          <p className="text-[10px] text-muted-foreground">Pessoa</p>
          <p className="text-sm font-medium truncate">{(demanda as any).pessoas?.full_name || "—"}</p>
        </CardContent></Card>
        <Card><CardContent className="pt-4">
          <p className="text-[10px] text-muted-foreground">Local</p>
          <p className="text-sm font-medium truncate">{(demanda as any).bairros?.nome || (demanda as any).municipios?.nome || "—"}</p>
        </CardContent></Card>
        <Card><CardContent className="pt-4">
          <p className="text-[10px] text-muted-foreground">Abertura</p>
          <p className="text-sm font-medium">{new Date(demanda.data_abertura).toLocaleDateString("pt-BR")}</p>
        </CardContent></Card>
        <Card><CardContent className="pt-4">
          <p className="text-[10px] text-muted-foreground">Prazo SLA</p>
          <p className={`text-sm font-medium ${isOverdue ? "text-destructive" : days !== null && days <= 3 ? "text-warning" : ""}`}>
            {demanda.data_prazo ? `${new Date(demanda.data_prazo).toLocaleDateString("pt-BR")} (${days}d)` : "—"}
          </p>
        </CardContent></Card>
      </div>

      <Tabs defaultValue="detalhes">
        <TabsList>
          <TabsTrigger value="detalhes"><FileText className="h-3 w-3 mr-1" />Detalhes</TabsTrigger>
          <TabsTrigger value="encaminhamentos"><Send className="h-3 w-3 mr-1" />Encaminhamentos ({encaminhamentos.length})</TabsTrigger>
          <TabsTrigger value="anexos"><Paperclip className="h-3 w-3 mr-1" />Anexos ({anexos.length})</TabsTrigger>
          <TabsTrigger value="resolucao"><Clock className="h-3 w-3 mr-1" />Resolução</TabsTrigger>
        </TabsList>

        <TabsContent value="detalhes">
          <Card>
            <CardHeader className="pb-3 flex-row items-center justify-between">
              <CardTitle className="text-base">Informações</CardTitle>
              {!editing ? (
                <Button size="sm" variant="outline" onClick={startEdit}>Editar</Button>
              ) : (
                <div className="flex gap-2">
                  <Button size="sm" variant="ghost" onClick={() => setEditing(false)}>Cancelar</Button>
                  <Button size="sm" onClick={saveEdit} disabled={updateDemanda.isPending}>
                    {updateDemanda.isPending ? <Loader2 className="h-3 w-3 mr-1 animate-spin" /> : <Save className="h-3 w-3 mr-1" />}Salvar
                  </Button>
                </div>
              )}
            </CardHeader>
            <CardContent className="space-y-3">
              {editing ? (
                <>
                  <div className="space-y-1"><Label>Título</Label><Input value={editForm.titulo} onChange={(e) => setEditForm({ ...editForm, titulo: e.target.value })} /></div>
                  <div className="space-y-1"><Label>Descrição</Label><Textarea value={editForm.descricao} onChange={(e) => setEditForm({ ...editForm, descricao: e.target.value })} rows={4} /></div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    <div className="space-y-1"><Label>Categoria</Label>
                      <Select value={editForm.categoria} onValueChange={(v) => setEditForm({ ...editForm, categoria: v })}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>{Object.entries(categoriaLabels).map(([k, v]) => (<SelectItem key={k} value={k}>{v}</SelectItem>))}</SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1"><Label>Prioridade</Label>
                      <Select value={editForm.prioridade} onValueChange={(v) => setEditForm({ ...editForm, prioridade: v })}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>{Object.entries(prioridadeLabels).map(([k, v]) => (<SelectItem key={k} value={k}>{v}</SelectItem>))}</SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1"><Label>Origem</Label>
                      <Select value={editForm.origem || ""} onValueChange={(v) => setEditForm({ ...editForm, origem: v })}>
                        <SelectTrigger><SelectValue placeholder="—" /></SelectTrigger>
                        <SelectContent>{Object.entries(origemLabels).map(([k, v]) => (<SelectItem key={k} value={k}>{v}</SelectItem>))}</SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1"><Label>Prazo</Label><Input type="date" value={editForm.data_prazo} onChange={(e) => setEditForm({ ...editForm, data_prazo: e.target.value })} /></div>
                  </div>
                </>
              ) : (
                <>
                  {demanda.descricao ? (
                    <div><Label className="text-xs text-muted-foreground">Descrição</Label><p className="text-sm mt-1 whitespace-pre-wrap">{demanda.descricao}</p></div>
                  ) : (
                    <p className="text-sm text-muted-foreground italic">Sem descrição.</p>
                  )}
                  <div className="grid grid-cols-2 gap-3 text-sm pt-2 border-t">
                    <div><span className="text-muted-foreground text-xs">Município:</span> {(demanda as any).municipios?.nome || "—"}</div>
                    <div><span className="text-muted-foreground text-xs">Bairro:</span> {(demanda as any).bairros?.nome || "—"}</div>
                    <div><span className="text-muted-foreground text-xs">Criado em:</span> {new Date(demanda.created_at).toLocaleString("pt-BR")}</div>
                    <div><span className="text-muted-foreground text-xs">Atualizado:</span> {new Date(demanda.updated_at).toLocaleString("pt-BR")}</div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="encaminhamentos">
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-base">Histórico de Encaminhamentos</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div className="flex gap-2">
                <Input className="flex-1" placeholder="Observação do encaminhamento..." value={encObs} onChange={(e) => setEncObs(e.target.value)} />
                <Button size="sm" onClick={handleEncaminhamento} disabled={createEncaminhamento.isPending || !encObs.trim()}>
                  <Send className="h-4 w-4 mr-1" />Encaminhar
                </Button>
              </div>
              <div className="space-y-2 max-h-[400px] overflow-auto">
                {encaminhamentos.map((enc: any) => (
                  <div key={enc.id} className="p-3 rounded bg-accent/30 border-l-2 border-primary">
                    <span className="text-[10px] text-muted-foreground">{new Date(enc.created_at).toLocaleString("pt-BR")}</span>
                    <p className="text-sm mt-1">{enc.observacao}</p>
                  </div>
                ))}
                {encaminhamentos.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">Nenhum encaminhamento.</p>}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="anexos">
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-base">Documentos & Anexos</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                <Input className="md:col-span-2" placeholder="URL do arquivo (https://...)" value={anexoUrl} onChange={(e) => setAnexoUrl(e.target.value)} />
                <Input placeholder="Descrição (opcional)" value={anexoDesc} onChange={(e) => setAnexoDesc(e.target.value)} />
              </div>
              <Button size="sm" onClick={handleAnexo} disabled={!anexoUrl.trim() || createAnexo.isPending}>
                <Paperclip className="h-4 w-4 mr-1" />Anexar
              </Button>
              <div className="space-y-2">
                {anexos.map((a: any) => (
                  <div key={a.id} className="flex items-center justify-between p-2 rounded border">
                    <div className="flex-1 min-w-0">
                      <a href={a.arquivo_url} target="_blank" rel="noreferrer" className="text-sm text-primary hover:underline truncate flex items-center gap-1">
                        <ExternalLink className="h-3 w-3" />{a.descricao || a.arquivo_url}
                      </a>
                      <p className="text-[10px] text-muted-foreground">{new Date(a.created_at).toLocaleString("pt-BR")}</p>
                    </div>
                  </div>
                ))}
                {anexos.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">Nenhum anexo.</p>}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="resolucao">
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-base">Resolução</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {demanda.status === "resolvida" ? (
                <div className="space-y-3">
                  <Badge variant="default" className="bg-success/15 text-success">
                    Resolvida em {demanda.data_resolucao ? new Date(demanda.data_resolucao).toLocaleDateString("pt-BR") : "—"}
                  </Badge>
                  {demanda.resolucao_descricao && <p className="text-sm whitespace-pre-wrap">{demanda.resolucao_descricao}</p>}
                  {demanda.satisfacao_cidadao && (
                    <div className="flex items-center gap-1">
                      <span className="text-xs text-muted-foreground mr-1">Satisfação:</span>
                      {[1, 2, 3, 4, 5].map((n) => (
                        <Star key={n} className={`h-4 w-4 ${n <= demanda.satisfacao_cidadao! ? "fill-warning text-warning" : "text-muted-foreground"}`} />
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="space-y-1">
                    <Label>Descrição da resolução</Label>
                    <Textarea value={resDescricao} onChange={(e) => setResDescricao(e.target.value)} rows={4} placeholder="Descreva como a demanda foi resolvida..." />
                  </div>
                  <div className="space-y-1">
                    <Label>Satisfação do cidadão (opcional)</Label>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((n) => (
                        <button key={n} type="button" onClick={() => setSatisfacao(n === satisfacao ? 0 : n)}>
                          <Star className={`h-6 w-6 ${n <= satisfacao ? "fill-warning text-warning" : "text-muted-foreground hover:text-warning"}`} />
                        </button>
                      ))}
                    </div>
                  </div>
                  <Button onClick={handleResolve} disabled={updateDemanda.isPending}>
                    {updateDemanda.isPending && <Loader2 className="h-4 w-4 mr-1 animate-spin" />}Marcar como Resolvida
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
