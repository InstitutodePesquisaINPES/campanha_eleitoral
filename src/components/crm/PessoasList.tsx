import { useState } from "react";
import { usePessoas, useCreatePessoa, useDeletePessoa, type PessoaInput } from "@/hooks/usePessoas";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Plus, Trash2, Search, Eye, Building2, User, Wand2 } from "lucide-react";
import { fetchCnpj } from "@/lib/api/brasilapi";

const nivelColors: Record<string, string> = {
  desconhecido: "bg-muted text-muted-foreground",
  frio: "bg-info/15 text-info",
  morno: "bg-warning/15 text-warning",
  quente: "bg-orange-500/15 text-orange-500",
  aliado: "bg-success/15 text-success",
  lideranca: "bg-primary/15 text-primary",
};

const nivelLabels: Record<string, string> = {
  desconhecido: "Desconhecido", frio: "Frio", morno: "Morno", quente: "Quente", aliado: "Aliado", lideranca: "Liderança",
};

const porteLabels: Record<string, string> = {
  mei: "MEI", me: "ME", epp: "EPP", medio: "Médio", grande: "Grande",
};

type NivelRelacionamento = "desconhecido" | "frio" | "morno" | "quente" | "aliado" | "lideranca";
type TipoPessoa = "pf" | "pj";

const emptyForm: PessoaInput = {
  full_name: "", tipo_pessoa: "pf", cpf: "", cnpj: "", razao_social: "", nome_fantasia: "",
  inscricao_estadual: "", porte: undefined, segmento: "", site: "", responsavel_legal: "",
  genero: "", nivel_relacionamento: "desconhecido",
};

export function PessoasList({ onSelect }: { onSelect: (id: string) => void }) {
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [nivelFilter, setNivelFilter] = useState<string>("all");
  const [tipoFilter, setTipoFilter] = useState<string>("all");
  const { data: pessoas = [], isLoading } = usePessoas(search || undefined, nivelFilter !== "all" ? nivelFilter : undefined, tipoFilter !== "all" ? tipoFilter : undefined);
  const createPessoa = useCreatePessoa();
  const deletePessoa = useDeletePessoa();

  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<PessoaInput>(emptyForm);
  const [lookingUp, setLookingUp] = useState(false);

  const isPJ = form.tipo_pessoa === "pj";

  const handleLookupCnpj = async () => {
    if (!form.cnpj || form.cnpj.replace(/\D/g, "").length !== 14) {
      toast({ variant: "destructive", title: "CNPJ inválido", description: "Informe os 14 dígitos." });
      return;
    }
    setLookingUp(true);
    const data = await fetchCnpj(form.cnpj);
    setLookingUp(false);
    if (!data) {
      toast({ variant: "destructive", title: "CNPJ não encontrado" });
      return;
    }
    setForm((f) => ({
      ...f,
      razao_social: data.razao_social || f.razao_social,
      nome_fantasia: data.nome_fantasia || f.nome_fantasia,
      full_name: data.nome_fantasia || data.razao_social || f.full_name,
    }));
    toast({ title: "Dados preenchidos pela BrasilAPI" });
  };

  const handleCreate = async () => {
    const nome = isPJ ? (form.nome_fantasia?.trim() || form.razao_social?.trim()) : form.full_name.trim();
    if (!nome) {
      toast({ variant: "destructive", title: isPJ ? "Informe a razão social ou nome fantasia" : "Informe o nome" });
      return;
    }
    if (isPJ && !form.cnpj) {
      toast({ variant: "destructive", title: "Informe o CNPJ" });
      return;
    }
    try {
      const payload: PessoaInput = {
        ...form,
        full_name: nome!,
        cpf: isPJ ? undefined : (form.cpf || undefined),
        cnpj: isPJ ? form.cnpj?.replace(/\D/g, "") : undefined,
      };
      const p = await createPessoa.mutateAsync(payload);
      toast({ title: isPJ ? "Empresa cadastrada!" : "Pessoa cadastrada!" });
      setOpen(false);
      setForm(emptyForm);
      onSelect(p.id);
    } catch (e: any) { toast({ variant: "destructive", title: "Erro", description: e.message }); }
  };

  const maskCpf = (cpf: string | null) => {
    if (!cpf) return "—";
    if (cpf.length >= 11) return `***.***${cpf.slice(6, 9)}-${cpf.slice(9, 11)}`;
    return "***";
  };

  const fmtCnpj = (cnpj: string | null) => {
    if (!cnpj) return "—";
    const c = cnpj.replace(/\D/g, "").padStart(14, "0");
    return `${c.slice(0,2)}.${c.slice(2,5)}.${c.slice(5,8)}/${c.slice(8,12)}-${c.slice(12,14)}`;
  };

  const totalPF = pessoas.filter((p: any) => p.tipo_pessoa !== "pj").length;
  const totalPJ = pessoas.filter((p: any) => p.tipo_pessoa === "pj").length;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between flex-wrap gap-2">
        <div>
          <CardTitle>CRM 360º · {pessoas.length} cadastros</CardTitle>
          <p className="text-xs text-muted-foreground mt-1">
            <User className="h-3 w-3 inline mr-1" />{totalPF} PF · <Building2 className="h-3 w-3 inline ml-2 mr-1" />{totalPJ} PJ
          </p>
        </div>
        <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) setForm(emptyForm); }}>
          <DialogTrigger asChild><Button size="sm"><Plus className="h-4 w-4 mr-1" />Novo Cadastro</Button></DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Cadastrar {isPJ ? "Pessoa Jurídica" : "Pessoa Física"}</DialogTitle>
            </DialogHeader>

            <Tabs value={form.tipo_pessoa} onValueChange={(v) => setForm({ ...form, tipo_pessoa: v as TipoPessoa })}>
              <TabsList className="grid grid-cols-2 w-full">
                <TabsTrigger value="pf"><User className="h-4 w-4 mr-1" />Pessoa Física</TabsTrigger>
                <TabsTrigger value="pj"><Building2 className="h-4 w-4 mr-1" />Pessoa Jurídica</TabsTrigger>
              </TabsList>
            </Tabs>

            {!isPJ ? (
              <div className="space-y-3 mt-2">
                <div className="space-y-1"><Label>Nome completo *</Label><Input value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} /></div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1"><Label>CPF</Label><Input value={form.cpf} onChange={(e) => setForm({ ...form, cpf: e.target.value.replace(/\D/g, "").slice(0, 11) })} placeholder="Somente números" /></div>
                  <div className="space-y-1">
                    <Label>Gênero</Label>
                    <Select value={form.genero} onValueChange={(v) => setForm({ ...form, genero: v })}>
                      <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="masculino">Masculino</SelectItem>
                        <SelectItem value="feminino">Feminino</SelectItem>
                        <SelectItem value="outro">Outro</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1"><Label>Data de nascimento</Label><Input type="date" value={form.data_nascimento || ""} onChange={(e) => setForm({ ...form, data_nascimento: e.target.value || undefined })} /></div>
                  <div className="space-y-1"><Label>Escolaridade</Label><Input value={form.escolaridade || ""} onChange={(e) => setForm({ ...form, escolaridade: e.target.value })} placeholder="Ex: Ensino médio" /></div>
                </div>
              </div>
            ) : (
              <div className="space-y-3 mt-2">
                <div className="space-y-1">
                  <Label>CNPJ *</Label>
                  <div className="flex gap-2">
                    <Input value={form.cnpj} onChange={(e) => setForm({ ...form, cnpj: e.target.value.replace(/\D/g, "").slice(0, 14) })} placeholder="14 dígitos" />
                    <Button type="button" variant="outline" size="sm" onClick={handleLookupCnpj} disabled={lookingUp}>
                      {lookingUp ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wand2 className="h-4 w-4 mr-1" />}
                      Buscar
                    </Button>
                  </div>
                  <p className="text-[11px] text-muted-foreground">Preenche automaticamente via BrasilAPI</p>
                </div>
                <div className="space-y-1"><Label>Razão social *</Label><Input value={form.razao_social || ""} onChange={(e) => setForm({ ...form, razao_social: e.target.value })} /></div>
                <div className="space-y-1"><Label>Nome fantasia</Label><Input value={form.nome_fantasia || ""} onChange={(e) => setForm({ ...form, nome_fantasia: e.target.value })} /></div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1"><Label>Inscrição estadual</Label><Input value={form.inscricao_estadual || ""} onChange={(e) => setForm({ ...form, inscricao_estadual: e.target.value })} /></div>
                  <div className="space-y-1"><Label>Inscrição municipal</Label><Input value={form.inscricao_municipal || ""} onChange={(e) => setForm({ ...form, inscricao_municipal: e.target.value })} /></div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label>Porte</Label>
                    <Select value={form.porte || ""} onValueChange={(v) => setForm({ ...form, porte: v as any })}>
                      <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                      <SelectContent>{Object.entries(porteLabels).map(([k, v]) => (<SelectItem key={k} value={k}>{v}</SelectItem>))}</SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1"><Label>Segmento</Label><Input value={form.segmento || ""} onChange={(e) => setForm({ ...form, segmento: e.target.value })} placeholder="Ex: Construção civil" /></div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1"><Label>Site</Label><Input value={form.site || ""} onChange={(e) => setForm({ ...form, site: e.target.value })} placeholder="https://" /></div>
                  <div className="space-y-1"><Label>Data de fundação</Label><Input type="date" value={form.data_fundacao || ""} onChange={(e) => setForm({ ...form, data_fundacao: e.target.value || undefined })} /></div>
                </div>
                <div className="space-y-1"><Label>Responsável legal</Label><Input value={form.responsavel_legal || ""} onChange={(e) => setForm({ ...form, responsavel_legal: e.target.value })} placeholder="Nome do responsável" /></div>
              </div>
            )}

            <div className="space-y-1 mt-2">
              <Label>Nível de Relacionamento</Label>
              <Select value={form.nivel_relacionamento} onValueChange={(v) => setForm({ ...form, nivel_relacionamento: v as NivelRelacionamento })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.entries(nivelLabels).map(([k, v]) => (<SelectItem key={k} value={k}>{v}</SelectItem>))}
                </SelectContent>
              </Select>
            </div>

            <DialogFooter>
              <Button onClick={handleCreate} disabled={createPessoa.isPending}>
                {createPessoa.isPending && <Loader2 className="h-4 w-4 mr-1 animate-spin" />}Salvar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-3 flex-wrap">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Buscar por nome, razão social, CPF ou CNPJ..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-8" />
          </div>
          <Select value={tipoFilter} onValueChange={setTipoFilter}>
            <SelectTrigger className="w-36"><SelectValue placeholder="Tipo" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">PF + PJ</SelectItem>
              <SelectItem value="pf">Pessoa Física</SelectItem>
              <SelectItem value="pj">Pessoa Jurídica</SelectItem>
            </SelectContent>
          </Select>
          <Select value={nivelFilter} onValueChange={setNivelFilter}>
            <SelectTrigger className="w-44"><SelectValue placeholder="Nível" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os níveis</SelectItem>
              {Object.entries(nivelLabels).map(([k, v]) => (<SelectItem key={k} value={k}>{v}</SelectItem>))}
            </SelectContent>
          </Select>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
        ) : pessoas.length === 0 ? (
          <p className="text-muted-foreground text-sm text-center py-8">Nenhum cadastro encontrado.</p>
        ) : (
          <div className="overflow-auto max-h-[560px]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Nome / Razão social</TableHead>
                  <TableHead>Documento</TableHead>
                  <TableHead>Nível</TableHead>
                  <TableHead>Papéis</TableHead>
                  <TableHead>Tags</TableHead>
                  <TableHead>Contato</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pessoas.map((p: any) => {
                  const isPj = p.tipo_pessoa === "pj";
                  return (
                    <TableRow key={p.id} className="cursor-pointer hover:bg-accent/50" onClick={() => onSelect(p.id)}>
                      <TableCell>
                        {isPj
                          ? <Badge variant="outline" className="text-[10px] gap-1"><Building2 className="h-3 w-3" />PJ</Badge>
                          : <Badge variant="outline" className="text-[10px] gap-1"><User className="h-3 w-3" />PF</Badge>}
                      </TableCell>
                      <TableCell className="font-medium">
                        {isPj ? (p.nome_fantasia || p.razao_social || p.full_name) : p.full_name}
                        {isPj && p.nome_fantasia && p.razao_social && p.nome_fantasia !== p.razao_social && (
                          <p className="text-[10px] text-muted-foreground">{p.razao_social}</p>
                        )}
                      </TableCell>
                      <TableCell className="text-xs font-mono">{isPj ? fmtCnpj(p.cnpj) : maskCpf(p.cpf)}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={nivelColors[p.nivel_relacionamento] || ""}>{nivelLabels[p.nivel_relacionamento] || p.nivel_relacionamento}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1 flex-wrap">
                          {(p.pessoas_papeis || []).filter((pp: any) => pp.ativo).slice(0, 2).map((pp: any, i: number) => (
                            <Badge key={i} variant="secondary" className="text-[10px]">{pp.papel}</Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1 flex-wrap">
                          {(p.pessoas_tags || []).slice(0, 3).map((pt: any, i: number) => (
                            <Badge key={i} variant="outline" className="text-[10px]" style={{ borderColor: pt.tags?.cor, color: pt.tags?.cor }}>{pt.tags?.nome}</Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell className="text-xs">
                        {(p.pessoas_contatos || []).find((c: any) => c.principal)?.valor || (p.pessoas_contatos || [])[0]?.valor || "—"}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={(e) => { e.stopPropagation(); onSelect(p.id); }}>
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={async (e) => {
                            e.stopPropagation();
                            const label = isPj ? (p.nome_fantasia || p.razao_social) : p.full_name;
                            if (!confirm(`Excluir "${label}"?`)) return;
                            try { await deletePessoa.mutateAsync(p.id); toast({ title: "Cadastro excluído!" }); }
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
