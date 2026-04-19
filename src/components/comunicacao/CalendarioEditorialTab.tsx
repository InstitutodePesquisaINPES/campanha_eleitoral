import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Calendar as CalendarIcon, Plus, Loader2 } from "lucide-react";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { usePautas, useCreatePauta, useUpdatePauta, type PautaCanal, type PautaStatus, type Pauta } from "@/hooks/useComunicacao360";

const STATUS_VAR: Record<PautaStatus, "default" | "secondary" | "outline" | "destructive"> = {
  ideia: "outline", aprovada: "secondary", em_producao: "secondary", agendada: "default", publicada: "default", cancelada: "destructive",
};
const STATUS_LABEL: Record<PautaStatus, string> = {
  ideia: "Ideia", aprovada: "Aprovada", em_producao: "Em produção", agendada: "Agendada", publicada: "Publicada", cancelada: "Cancelada",
};
const CANAIS: PautaCanal[] = ["instagram", "facebook", "tiktok", "youtube", "whatsapp", "site", "imprensa", "radio", "tv", "outdoor", "outros"];

export function CalendarioEditorialTab() {
  const { data: pautas = [], isLoading } = usePautas();
  const createPauta = useCreatePauta();
  const updatePauta = useUpdatePauta();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ titulo: "", descricao: "", canal: "instagram" as PautaCanal, data_publicacao: "" });
  const [filterStatus, setFilterStatus] = useState<string>("all");

  const filtered = pautas.filter((p) => filterStatus === "all" || p.status === filterStatus);

  const handleCreate = async () => {
    if (!form.titulo.trim()) return;
    await createPauta.mutateAsync({
      titulo: form.titulo,
      descricao: form.descricao || null,
      canal: form.canal,
      data_publicacao: form.data_publicacao ? new Date(form.data_publicacao).toISOString() : null,
    });
    setForm({ titulo: "", descricao: "", canal: "instagram", data_publicacao: "" });
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
            <Button size="sm" className="gap-2"><Plus className="h-4 w-4" />Nova pauta</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Nova pauta editorial</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <Input placeholder="Título" value={form.titulo} onChange={(e) => setForm({ ...form, titulo: e.target.value })} />
              <Textarea placeholder="Descrição / briefing" value={form.descricao} onChange={(e) => setForm({ ...form, descricao: e.target.value })} />
              <div className="grid grid-cols-2 gap-2">
                <Select value={form.canal} onValueChange={(v) => setForm({ ...form, canal: v as PautaCanal })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{CANAIS.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                </Select>
                <Input type="datetime-local" value={form.data_publicacao} onChange={(e) => setForm({ ...form, data_publicacao: e.target.value })} />
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleCreate} disabled={createPauta.isPending}>
                {createPauta.isPending && <Loader2 className="h-4 w-4 animate-spin mr-2" />}Criar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
      ) : filtered.length === 0 ? (
        <Card><CardContent className="py-12 text-center text-sm text-muted-foreground">
          <CalendarIcon className="h-8 w-8 mx-auto mb-2 opacity-40" />
          Nenhuma pauta. Crie a primeira para começar o calendário editorial.
        </CardContent></Card>
      ) : (
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((p: Pauta) => (
            <Card key={p.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="text-sm leading-snug">{p.titulo}</CardTitle>
                  <Badge variant={STATUS_VAR[p.status]} className="text-[10px] shrink-0">{STATUS_LABEL[p.status]}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                {p.descricao && <p className="text-xs text-muted-foreground line-clamp-2">{p.descricao}</p>}
                <div className="flex items-center justify-between text-xs">
                  <Badge variant="outline" className="text-[10px]">{p.canal}</Badge>
                  {p.data_publicacao && (
                    <span className="text-muted-foreground">
                      {format(parseISO(p.data_publicacao), "dd/MM HH:mm", { locale: ptBR })}
                    </span>
                  )}
                </div>
                <Select value={p.status} onValueChange={(v) => updatePauta.mutate({ id: p.id, status: v as PautaStatus })}>
                  <SelectTrigger className="h-7 text-xs"><SelectValue /></SelectTrigger>
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
