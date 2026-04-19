import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Library, Plus, Loader2, ShieldCheck, Clock, FileText } from "lucide-react";
import { usePecas, useCreatePeca, useUpdatePecaStatus, type PecaTipo, type PecaStatus, type Peca } from "@/hooks/useComunicacao360";

const STATUS_LABEL: Record<PecaStatus, string> = {
  rascunho: "Rascunho", em_revisao: "Em revisão", aprovacao_juridica: "Aprovação jurídica",
  aprovada: "Aprovada", reprovada: "Reprovada", publicada: "Publicada",
};
const STATUS_VAR: Record<PecaStatus, "default" | "secondary" | "outline" | "destructive"> = {
  rascunho: "outline", em_revisao: "secondary", aprovacao_juridica: "secondary",
  aprovada: "default", reprovada: "destructive", publicada: "default",
};
const TIPOS: PecaTipo[] = ["post", "video", "reels", "story", "jingle", "santinho", "adesivo", "outdoor", "release", "spot", "outros"];

export function BibliotecaPecasTab() {
  const { data: pecas = [], isLoading } = usePecas();
  const createPeca = useCreatePeca();
  const updateStatus = useUpdatePecaStatus();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ titulo: "", tipo: "post" as PecaTipo, arquivo_url: "", texto_legenda: "" });
  const [filterStatus, setFilterStatus] = useState("all");

  const filtered = pecas.filter((p) => filterStatus === "all" || p.status === filterStatus);

  const handleCreate = async () => {
    if (!form.titulo.trim()) return;
    await createPeca.mutateAsync({
      titulo: form.titulo, tipo: form.tipo,
      arquivo_url: form.arquivo_url || null,
      texto_legenda: form.texto_legenda || null,
    });
    setForm({ titulo: "", tipo: "post", arquivo_url: "", texto_legenda: "" });
    setOpen(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os status</SelectItem>
            {Object.entries(STATUS_LABEL).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
          </SelectContent>
        </Select>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-2"><Plus className="h-4 w-4" />Nova peça</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Nova peça de comunicação</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <Input placeholder="Título" value={form.titulo} onChange={(e) => setForm({ ...form, titulo: e.target.value })} />
              <Select value={form.tipo} onValueChange={(v) => setForm({ ...form, tipo: v as PecaTipo })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{TIPOS.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
              </Select>
              <Input placeholder="URL do arquivo (opcional)" value={form.arquivo_url} onChange={(e) => setForm({ ...form, arquivo_url: e.target.value })} />
              <Textarea placeholder="Legenda / texto" value={form.texto_legenda} onChange={(e) => setForm({ ...form, texto_legenda: e.target.value })} />
            </div>
            <DialogFooter>
              <Button onClick={handleCreate} disabled={createPeca.isPending}>
                {createPeca.isPending && <Loader2 className="h-4 w-4 animate-spin mr-2" />}Criar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
      ) : filtered.length === 0 ? (
        <Card><CardContent className="py-12 text-center text-sm text-muted-foreground">
          <Library className="h-8 w-8 mx-auto mb-2 opacity-40" />
          Nenhuma peça cadastrada. Adicione ativos para iniciar o fluxo de aprovação.
        </CardContent></Card>
      ) : (
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((p: Peca) => (
            <Card key={p.id}>
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="text-sm leading-snug">{p.titulo}</CardTitle>
                  <Badge variant={STATUS_VAR[p.status]} className="text-[10px] shrink-0">{STATUS_LABEL[p.status]}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <FileText className="h-3 w-3" />
                  <span>{p.tipo}</span>
                  <span>· v{p.versao}</span>
                </div>
                {p.texto_legenda && <p className="text-xs text-muted-foreground line-clamp-3">{p.texto_legenda}</p>}
                {p.arquivo_url && (
                  <a href={p.arquivo_url} target="_blank" rel="noreferrer" className="text-xs text-primary hover:underline truncate block">
                    Ver arquivo →
                  </a>
                )}
                {p.aprovado_em && (
                  <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                    <ShieldCheck className="h-3 w-3 text-primary" />
                    Aprovada em {new Date(p.aprovado_em).toLocaleDateString("pt-BR")}
                  </div>
                )}
                <Select value={p.status} onValueChange={(v) => updateStatus.mutate({ id: p.id, status: v as PecaStatus })}>
                  <SelectTrigger className="h-7 text-xs"><Clock className="h-3 w-3 mr-1" /><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(STATUS_LABEL).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
