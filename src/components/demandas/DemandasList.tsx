import { useMemo, useState } from "react";
import {
  useDemandas, useCreateDemanda, useDeleteDemanda,
  categoriaLabels, prioridadeLabels, prioridadeColors, statusLabels, statusColors, origemLabels,
} from "@/hooks/useDemandas";
import { usePessoas } from "@/hooks/usePessoas";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Plus, Trash2, Eye, AlertTriangle, Clock, Search, Download, Filter, X, UserX, FileText } from "lucide-react";
import { exportToExcel } from "@/lib/export/excelExport";

export function DemandasList({ onSelect }: { onSelect: (id: string) => void }) {
  const { toast } = useToast();
  const [statusFilter, setStatusFilter] = useState("all");
  const [prioridadeFilter, setPrioridadeFilter] = useState("all");
  const [categoriaFilter, setCategoriaFilter] = useState("all");
  const [origemFilter, setOrigemFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [vencidas, setVencidas] = useState(false);
  const [semResp, setSemResp] = useState(false);
  const [sortBy, setSortBy] = useState<"data" | "prioridade" | "prazo">("data");

  const { data: demandasRaw = [], isLoading } = useDemandas({
    status: statusFilter, prioridade: prioridadeFilter, categoria: categoriaFilter,
    origem: origemFilter, search, vencidas, semResponsavel: semResp,
  });

  const demandas = useMemo(() => {
    const arr = [...demandasRaw];
    const prioOrder: Record<string, number> = { urgente: 0, alta: 1, media: 2, baixa: 3 };
    if (sortBy === "prioridade") arr.sort((a, b) => (prioOrder[a.prioridade] ?? 9) - (prioOrder[b.prioridade] ?? 9));
    else if (sortBy === "prazo") arr.sort((a, b) => {
      if (!a.data_prazo) return 1; if (!b.data_prazo) return -1;
      return new Date(a.data_prazo).getTime() - new Date(b.data_prazo).getTime();
    });
    return arr;
  }, [demandasRaw, sortBy]);

  const createDemanda = useCreateDemanda();
  const deleteDemanda = useDeleteDemanda();

  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<any>({
    titulo: "", descricao: "", categoria: "outros", prioridade: "media", origem: "", pessoa_id: "", data_prazo: "",
  });

  const [pessoaSearch, setPessoaSearch] = useState("");
  const { data: pessoaResults = [] } = usePessoas(pessoaSearch || undefined);
  const [exporting, setExporting] = useState(false);

  const handleCreate = async () => {
    if (!form.titulo.trim()) { toast({ variant: "destructive", title: "Informe o título" }); return; }
    try {
      const d = await createDemanda.mutateAsync({
        titulo: form.titulo.trim(),
        descricao: form.descricao || undefined,
        categoria: form.categoria,
        prioridade: form.prioridade,
        origem: form.origem || undefined,
        pessoa_id: form.pessoa_id || undefined,
        data_prazo: form.data_prazo || undefined,
      });
      toast({ title: `✅ Demanda criada — ${d.protocolo}`, description: `SLA: ${d.data_prazo ? new Date(d.data_prazo).toLocaleDateString("pt-BR") : "—"}` });
      setOpen(false);
      setForm({ titulo: "", descricao: "", categoria: "outros", prioridade: "media", origem: "", pessoa_id: "", data_prazo: "" });
      setPessoaSearch("");
      onSelect(d.id);
    } catch (e: any) { toast({ variant: "destructive", title: "Erro", description: e.message }); }
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      await exportToExcel(
        [{ name: "demandas", label: "Demandas", dateField: "created_at", group: "campo" }],
        {},
        `demandas_${new Date().toISOString().slice(0, 10)}.xlsx`,
      );
      toast({ title: "✅ Exportado", description: `${demandas.length} demandas` });
    } catch (e: any) {
      toast({ variant: "destructive", title: "Erro", description: e.message });
    } finally {
      setExporting(false);
    }
  };

  const clearFilters = () => {
    setStatusFilter("all"); setPrioridadeFilter("all"); setCategoriaFilter("all");
    setOrigemFilter("all"); setSearch(""); setVencidas(false); setSemResp(false);
  };

  const isOverdue = (d: any) => d.status !== "resolvida" && d.status !== "arquivada" && d.data_prazo && new Date(d.data_prazo) < new Date();
  const daysToPrazo = (d: any) => d.data_prazo ? Math.ceil((new Date(d.data_prazo).getTime() - Date.now()) / 86400000) : null;

  const activeFilters = [statusFilter !== "all", prioridadeFilter !== "all", categoriaFilter !== "all", origemFilter !== "all", !!search, vencidas, semResp].filter(Boolean).length;

  return (
    <Card>
      <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <CardTitle className="flex items-center gap-2">Demandas <Badge variant="secondary">{demandas.length}</Badge></CardTitle>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={handleExport} disabled={exporting}>
            {exporting ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <Download className="h-4 w-4 mr-1" />}
            Excel
          </Button>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild><Button size="sm"><Plus className="h-4 w-4 mr-1" />Nova Demanda</Button></DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader><DialogTitle>Abrir Demanda</DialogTitle></DialogHeader>
              <div className="space-y-3">
                <div className="space-y-1"><Label>Título *</Label><Input value={form.titulo} onChange={(e) => setForm({ ...form, titulo: e.target.value })} /></div>
                <div className="space-y-1"><Label>Descrição</Label><Textarea value={form.descricao} onChange={(e) => setForm({ ...form, descricao: e.target.value })} rows={3} /></div>
                <div className="grid grid-cols-3 gap-2">
                  <div className="space-y-1">
                    <Label>Categoria</Label>
                    <Select value={form.categoria} onValueChange={(v) => setForm({ ...form, categoria: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>{Object.entries(categoriaLabels).map(([k, v]) => (<SelectItem key={k} value={k}>{v}</SelectItem>))}</SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1">
                    <Label>Prioridade</Label>
                    <Select value={form.prioridade} onValueChange={(v) => setForm({ ...form, prioridade: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>{Object.entries(prioridadeLabels).map(([k, v]) => (<SelectItem key={k} value={k}>{v}</SelectItem>))}</SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1">
                    <Label>Origem</Label>
                    <Select value={form.origem} onValueChange={(v) => setForm({ ...form, origem: v })}>
                      <SelectTrigger><SelectValue placeholder="—" /></SelectTrigger>
                      <SelectContent>{Object.entries(origemLabels).map(([k, v]) => (<SelectItem key={k} value={k}>{v}</SelectItem>))}</SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-1">
                  <Label>Prazo SLA <span className="text-muted-foreground text-xs">(automático pela prioridade se vazio)</span></Label>
                  <Input type="date" value={form.data_prazo} onChange={(e) => setForm({ ...form, data_prazo: e.target.value })} />
                </div>
                <div className="space-y-1">
                  <Label>Pessoa vinculada</Label>
                  <Input placeholder="Buscar pessoa por nome..." value={pessoaSearch} onChange={(e) => setPessoaSearch(e.target.value)} />
                  {pessoaSearch && pessoaResults.length > 0 && (
                    <div className="border rounded max-h-32 overflow-auto">
                      {pessoaResults.slice(0, 5).map((p: any) => (
                        <button key={p.id} className="w-full text-left px-3 py-1.5 text-sm hover:bg-accent/50" onClick={() => { setForm({ ...form, pessoa_id: p.id }); setPessoaSearch(p.full_name); }}>
                          {p.full_name}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <DialogFooter>
                <Button onClick={handleCreate} disabled={createDemanda.isPending}>
                  {createDemanda.isPending && <Loader2 className="h-4 w-4 mr-1 animate-spin" />}Abrir Demanda
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Filtros */}
        <div className="space-y-3">
          <div className="flex flex-col md:flex-row gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Buscar por título, protocolo ou descrição..." className="pl-8" value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
            <Select value={sortBy} onValueChange={(v: any) => setSortBy(v)}>
              <SelectTrigger className="md:w-44"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="data">Mais recentes</SelectItem>
                <SelectItem value="prioridade">Por prioridade</SelectItem>
                <SelectItem value="prazo">Prazo mais próximo</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-wrap gap-2 items-center">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-36 h-8 text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos status</SelectItem>
                {Object.entries(statusLabels).map(([k, v]) => (<SelectItem key={k} value={k}>{v}</SelectItem>))}
              </SelectContent>
            </Select>
            <Select value={prioridadeFilter} onValueChange={setPrioridadeFilter}>
              <SelectTrigger className="w-36 h-8 text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas prioridades</SelectItem>
                {Object.entries(prioridadeLabels).map(([k, v]) => (<SelectItem key={k} value={k}>{v}</SelectItem>))}
              </SelectContent>
            </Select>
            <Select value={categoriaFilter} onValueChange={setCategoriaFilter}>
              <SelectTrigger className="w-36 h-8 text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas categorias</SelectItem>
                {Object.entries(categoriaLabels).map(([k, v]) => (<SelectItem key={k} value={k}>{v}</SelectItem>))}
              </SelectContent>
            </Select>
            <Select value={origemFilter} onValueChange={setOrigemFilter}>
              <SelectTrigger className="w-36 h-8 text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas origens</SelectItem>
                {Object.entries(origemLabels).map(([k, v]) => (<SelectItem key={k} value={k}>{v}</SelectItem>))}
              </SelectContent>
            </Select>
            <label className="flex items-center gap-1.5 text-xs cursor-pointer px-2 py-1 rounded border bg-card">
              <Switch checked={vencidas} onCheckedChange={setVencidas} />
              <AlertTriangle className="h-3 w-3 text-destructive" /> Vencidas
            </label>
            <label className="flex items-center gap-1.5 text-xs cursor-pointer px-2 py-1 rounded border bg-card">
              <Switch checked={semResp} onCheckedChange={setSemResp} />
              <UserX className="h-3 w-3" /> Sem responsável
            </label>
            {activeFilters > 0 && (
              <Button variant="ghost" size="sm" onClick={clearFilters} className="h-8 text-xs">
                <X className="h-3 w-3 mr-1" /> Limpar ({activeFilters})
              </Button>
            )}
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
        ) : demandas.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <FileText className="h-10 w-10 mx-auto mb-2 opacity-30" />
            <p className="text-sm">Nenhuma demanda encontrada com esses filtros.</p>
          </div>
        ) : (
          <div className="overflow-auto max-h-[600px] rounded-md border">
            <Table>
              <TableHeader className="sticky top-0 bg-card z-10">
                <TableRow>
                  <TableHead>Protocolo</TableHead>
                  <TableHead>Título</TableHead>
                  <TableHead>Pessoa / Local</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead>Prioridade</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>SLA</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {demandas.map((d: any) => {
                  const days = daysToPrazo(d);
                  const overdue = isOverdue(d);
                  return (
                    <TableRow key={d.id} className="cursor-pointer hover:bg-accent/50" onClick={() => onSelect(d.id)}>
                      <TableCell className="font-mono text-xs">{d.protocolo}</TableCell>
                      <TableCell className="font-medium max-w-[260px]">
                        <div className="truncate">{d.titulo}</div>
                        {d.descricao && <div className="text-xs text-muted-foreground truncate">{d.descricao}</div>}
                      </TableCell>
                      <TableCell className="text-xs">
                        <div>{d.pessoas?.full_name || "—"}</div>
                        {d.bairros?.nome && <div className="text-muted-foreground">{d.bairros.nome}{d.municipios?.nome ? ` · ${d.municipios.nome}` : ""}</div>}
                      </TableCell>
                      <TableCell><Badge variant="outline" className="text-[10px]">{categoriaLabels[d.categoria] || d.categoria}</Badge></TableCell>
                      <TableCell><Badge variant="outline" className={`text-[10px] ${prioridadeColors[d.prioridade] || ""}`}>{prioridadeLabels[d.prioridade]}</Badge></TableCell>
                      <TableCell><Badge variant="outline" className={`text-[10px] ${statusColors[d.status] || ""}`}>{statusLabels[d.status]}</Badge></TableCell>
                      <TableCell>
                        {overdue ? (
                          <Badge variant="destructive" className="text-[10px] gap-1"><AlertTriangle className="h-3 w-3" />{Math.abs(days!)}d atraso</Badge>
                        ) : d.data_prazo ? (
                          <span className={`text-[10px] flex items-center gap-1 ${days! <= 3 ? "text-warning" : "text-muted-foreground"}`}>
                            <Clock className="h-3 w-3" />{days}d
                          </span>
                        ) : "—"}
                      </TableCell>
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => onSelect(d.id)}><Eye className="h-4 w-4" /></Button>
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={async () => {
                            if (!confirm(`Excluir "${d.protocolo}"?`)) return;
                            try { await deleteDemanda.mutateAsync(d.id); toast({ title: "Demanda excluída!" }); }
                            catch (err: any) { toast({ variant: "destructive", description: err.message }); }
                          }}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
