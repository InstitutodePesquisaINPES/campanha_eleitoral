import { useEffect, useMemo, useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useCandidatoHistorico, useCandidatoMatchPessoa } from "@/hooks/useEleitoralTSE";
import { useCampanhaRelacionadaAoCandidato, useUpdateCampanha } from "@/hooks/useCampanhas";
import { useCanManage } from "@/hooks/useUserRoles";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CampanhaEscopoForm, type CargoEleitoral } from "@/components/plano/CampanhaEscopoForm";
import { useNavigate } from "react-router-dom";
import { Trophy, User, Vote, ExternalLink, Calendar, Briefcase, Pencil, Save } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

const CARGOS: { value: CargoEleitoral; label: string }[] = [
  { value: "vereador", label: "Vereador" },
  { value: "prefeito", label: "Prefeito" },
  { value: "vice_prefeito", label: "Vice-Prefeito" },
  { value: "deputado_estadual", label: "Deputado Estadual" },
  { value: "deputado_federal", label: "Deputado Federal" },
  { value: "senador", label: "Senador" },
  { value: "governador", label: "Governador" },
  { value: "vice_governador", label: "Vice-Governador" },
  { value: "presidente", label: "Presidente" },
];

export function CandidatoDrawer360({ candidato, onClose }: { candidato: any | null; onClose: () => void }) {
  const navigate = useNavigate();
  const canManage = useCanManage();
  const { data: historico = [] } = useCandidatoHistorico(candidato?.nome_completo ?? null, candidato?.cpf ?? null);
  const { data: pessoaMatch } = useCandidatoMatchPessoa(candidato?.nome_completo ?? null, candidato?.cpf ?? null);
  const { data: campanhaRelacionada } = useCampanhaRelacionadaAoCandidato({
    nome: candidato?.nome_urna ?? candidato?.nome_completo,
    numeroUrna: candidato?.numero_urna ?? null,
    cargo: candidato?.cargo ?? null,
    ano: candidato?.ano ?? null,
  });
  const updateCampanha = useUpdateCampanha();
  const [editandoCampanha, setEditandoCampanha] = useState(false);
  const [form, setForm] = useState<any | null>(null);

  useEffect(() => {
    if (campanhaRelacionada) {
      setForm({
        nome: campanhaRelacionada.nome ?? "",
        cargo: campanhaRelacionada.cargo,
        partido_sigla: campanhaRelacionada.partido_sigla ?? "",
        numero_urna: campanhaRelacionada.numero_urna ?? "",
        meta_votos: campanhaRelacionada.meta_votos ?? 0,
        orcamento_total: Number(campanhaRelacionada.orcamento_total ?? 0),
        data_eleicao: campanhaRelacionada.data_eleicao,
        data_inicio_plano: campanhaRelacionada.data_inicio_plano,
        observacoes: campanhaRelacionada.observacoes ?? "",
        estado_id: campanhaRelacionada.estado_id ?? "",
        municipio_id: campanhaRelacionada.municipio_id ?? "",
        municipios_foco_ids: campanhaRelacionada.municipios_foco_ids ?? [],
        ativa: campanhaRelacionada.ativa,
      });
    } else {
      setForm(null);
    }
    setEditandoCampanha(false);
  }, [campanhaRelacionada?.id]);

  const resumoEscopo = useMemo(() => {
    if (!campanhaRelacionada) return null;
    return campanhaRelacionada.municipios?.nome ?? campanhaRelacionada.estados?.nome ?? "Escopo não definido";
  }, [campanhaRelacionada]);

  if (!candidato) return null;

  const historicoExibicao = historico.length > 0 ? historico : [{
    ...candidato,
    municipio_nome: candidato.municipio_nome ?? candidato.cod_municipio_tse,
  }];

  const trend = [...historicoExibicao].reverse().map((h: any) => ({ ano: h.ano, votos: h.votos_recebidos, eleito: h.eleito }));
  const totalVotos = historicoExibicao.reduce((s: number, h: any) => s + (h.votos_recebidos ?? 0), 0);
  const eleicoes = historicoExibicao.length;
  const vitorias = historicoExibicao.filter((h: any) => h.eleito).length;

  return (
    <Sheet open={!!candidato} onOpenChange={(o) => !o && onClose()}>
      <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
        <SheetHeader className="space-y-2">
          <div className="flex items-start gap-3">
            <div className="h-12 w-12 rounded-full bg-primary/10 text-primary flex items-center justify-center text-lg font-bold">
              {(candidato.nome_urna ?? candidato.nome_completo ?? "?").charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <SheetTitle className="text-xl">{candidato.nome_urna ?? candidato.nome_completo}</SheetTitle>
              <p className="text-xs text-muted-foreground">{candidato.nome_completo}</p>
              <div className="flex flex-wrap gap-1.5 mt-2">
                <Badge variant="outline">{candidato.partido_sigla} · {candidato.numero_urna}</Badge>
                <Badge variant="outline">{candidato.cargo}</Badge>
                {candidato.eleito && <Badge className="bg-success text-success-foreground"><Trophy className="h-3 w-3 mr-1" />Eleito {candidato.ano}</Badge>}
              </div>
            </div>
          </div>
        </SheetHeader>

        <div className="space-y-4 mt-6">
          {campanhaRelacionada && (
            <Card className="border-warning/40 bg-warning/5">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between gap-2">
                  <CardTitle className="text-sm">Cadastro interno do candidato</CardTitle>
                  {canManage && !editandoCampanha && (
                    <Button size="sm" variant="outline" onClick={() => setEditandoCampanha(true)}>
                      <Pencil className="h-3.5 w-3.5 mr-1" />Editar tudo
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {editandoCampanha && form ? (
                  <>
                    <div className="grid gap-3 md:grid-cols-2">
                      <div className="space-y-1.5"><Label>Nome</Label><Input value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} /></div>
                      <div className="space-y-1.5">
                        <Label>Cargo</Label>
                        <Select value={form.cargo} onValueChange={(v) => setForm({ ...form, cargo: v as CargoEleitoral, estado_id: "", municipio_id: "", municipios_foco_ids: [] })}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>{CARGOS.map((cargo) => <SelectItem key={cargo.value} value={cargo.value}>{cargo.label}</SelectItem>)}</SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-1.5"><Label>Partido</Label><Input value={form.partido_sigla} onChange={(e) => setForm({ ...form, partido_sigla: e.target.value.toUpperCase() })} /></div>
                      <div className="space-y-1.5"><Label>Número de urna</Label><Input value={form.numero_urna} onChange={(e) => setForm({ ...form, numero_urna: e.target.value })} /></div>
                      <div className="space-y-1.5"><Label>Meta de votos</Label><Input type="number" value={form.meta_votos} onChange={(e) => setForm({ ...form, meta_votos: Number(e.target.value) })} /></div>
                      <div className="space-y-1.5"><Label>Orçamento total</Label><Input type="number" value={form.orcamento_total} onChange={(e) => setForm({ ...form, orcamento_total: Number(e.target.value) })} /></div>
                      <div className="space-y-1.5"><Label>Data da eleição</Label><Input type="date" value={form.data_eleicao} onChange={(e) => setForm({ ...form, data_eleicao: e.target.value })} /></div>
                      <div className="space-y-1.5"><Label>Início do plano</Label><Input type="date" value={form.data_inicio_plano} onChange={(e) => setForm({ ...form, data_inicio_plano: e.target.value })} /></div>
                    </div>

                    <CampanhaEscopoForm
                      cargo={form.cargo}
                      estadoId={form.estado_id}
                      municipioId={form.municipio_id}
                      municipiosFoco={form.municipios_foco_ids}
                      onChange={(patch) => setForm((prev: any) => ({ ...prev, ...patch }))}
                    />

                    <div className="space-y-1.5">
                      <Label>Observações</Label>
                      <Textarea value={form.observacoes} onChange={(e) => setForm({ ...form, observacoes: e.target.value })} />
                    </div>

                    <div className="flex justify-end gap-2">
                      <Button variant="outline" onClick={() => { setEditandoCampanha(false); setForm((current: any) => current ? { ...current, ...{
                        nome: campanhaRelacionada.nome ?? "",
                        cargo: campanhaRelacionada.cargo,
                        partido_sigla: campanhaRelacionada.partido_sigla ?? "",
                        numero_urna: campanhaRelacionada.numero_urna ?? "",
                        meta_votos: campanhaRelacionada.meta_votos ?? 0,
                        orcamento_total: Number(campanhaRelacionada.orcamento_total ?? 0),
                        data_eleicao: campanhaRelacionada.data_eleicao,
                        data_inicio_plano: campanhaRelacionada.data_inicio_plano,
                        observacoes: campanhaRelacionada.observacoes ?? "",
                        estado_id: campanhaRelacionada.estado_id ?? "",
                        municipio_id: campanhaRelacionada.municipio_id ?? "",
                        municipios_foco_ids: campanhaRelacionada.municipios_foco_ids ?? [],
                        ativa: campanhaRelacionada.ativa,
                      }} : current); }}>Cancelar</Button>
                      <Button onClick={() => updateCampanha.mutate({ id: campanhaRelacionada.id, ...form }, { onSuccess: () => setEditandoCampanha(false) })} disabled={updateCampanha.isPending}>
                        <Save className="h-3.5 w-3.5 mr-1" />Salvar alterações
                      </Button>
                    </div>
                  </>
                ) : (
                  <div className="grid gap-2 text-xs md:grid-cols-2">
                    <div><span className="text-muted-foreground">Campanha: </span>{campanhaRelacionada.nome}</div>
                    <div><span className="text-muted-foreground">Escopo: </span>{resumoEscopo}</div>
                    <div><span className="text-muted-foreground">Cargo interno: </span>{String(campanhaRelacionada.cargo).replace(/_/g, " ")}</div>
                    <div><span className="text-muted-foreground">Meta: </span>{campanhaRelacionada.meta_votos?.toLocaleString("pt-BR") ?? "—"}</div>
                    <div><span className="text-muted-foreground">Número: </span>{campanhaRelacionada.numero_urna ?? "—"}</div>
                    <div><span className="text-muted-foreground">Partido: </span>{campanhaRelacionada.partido_sigla ?? "—"}</div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {pessoaMatch && (
            <Card className="border-primary/40 bg-primary/5">
              <CardContent className="p-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-primary" />
                  <div>
                    <p className="text-xs font-medium">Cadastrado no CRM</p>
                    <p className="text-[10px] text-muted-foreground">{pessoaMatch.pessoa_nome}</p>
                  </div>
                </div>
                <Button size="sm" variant="outline" onClick={() => navigate(`/pessoas`)}>
                  Abrir ficha <ExternalLink className="h-3 w-3 ml-1" />
                </Button>
              </CardContent>
            </Card>
          )}

          <div className="grid grid-cols-3 gap-2">
            <Card><CardContent className="p-3 text-center"><Vote className="h-4 w-4 mx-auto text-primary mb-1" /><p className="text-lg font-bold">{totalVotos.toLocaleString("pt-BR")}</p><p className="text-[10px] text-muted-foreground">Total votos</p></CardContent></Card>
            <Card><CardContent className="p-3 text-center"><Calendar className="h-4 w-4 mx-auto text-info mb-1" /><p className="text-lg font-bold">{eleicoes}</p><p className="text-[10px] text-muted-foreground">Eleições</p></CardContent></Card>
            <Card><CardContent className="p-3 text-center"><Trophy className="h-4 w-4 mx-auto text-success mb-1" /><p className="text-lg font-bold">{vitorias}</p><p className="text-[10px] text-muted-foreground">Vitórias</p></CardContent></Card>
          </div>

          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm">Dados pessoais</CardTitle></CardHeader>
            <CardContent className="grid grid-cols-2 gap-2 text-xs">
              <div><span className="text-muted-foreground">Nascimento: </span>{candidato.data_nascimento ?? "—"}</div>
              <div><span className="text-muted-foreground">Gênero: </span>{candidato.genero ?? "—"}</div>
              <div className="col-span-2 flex items-start gap-1"><Briefcase className="h-3 w-3 mt-0.5 text-muted-foreground" /><span>{candidato.ocupacao ?? "—"}</span></div>
              <div><span className="text-muted-foreground">CPF: </span>{candidato.cpf ?? "—"}</div>
              <div><span className="text-muted-foreground">Situação: </span>{candidato.situacao_eleicao ?? "—"}</div>
            </CardContent>
          </Card>

          {trend.length > 1 && (
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm">Evolução de votos</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={180}>
                  <LineChart data={trend}>
                    <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                    <XAxis dataKey="ano" tick={{ fontSize: 10 }} />
                    <YAxis tick={{ fontSize: 10 }} tickFormatter={(v) => v >= 1000 ? `${(v/1000).toFixed(0)}k` : v} />
                    <Tooltip formatter={(v: number) => v.toLocaleString("pt-BR")} contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }} />
                    <Line type="monotone" dataKey="votos" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ r: 4 }} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm">Histórico completo de candidaturas</CardTitle></CardHeader>
            <CardContent className="space-y-1.5">
              {historicoExibicao.map((h: any) => (
                <div key={`${h.ano}-${h.cod_municipio_tse}-${h.cargo}`} className="flex items-center justify-between gap-2 text-xs p-2 rounded hover:bg-muted/50">
                  <div>
                    <span className="font-bold">{h.ano}</span> · {h.cargo} · {h.municipio_nome ?? h.cod_municipio_tse}
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-[10px]">{h.partido_sigla} {h.numero_urna}</Badge>
                    <span className="font-mono font-medium">{(h.votos_recebidos ?? 0).toLocaleString("pt-BR")}</span>
                    {h.eleito && <Trophy className="h-3 w-3 text-success" />}
                  </div>
                </div>
              ))}
              {historico.length === 0 && <p className="text-xs text-muted-foreground text-center py-4">Mostrando os dados disponíveis desta candidatura.</p>}
            </CardContent>
          </Card>
        </div>
      </SheetContent>
    </Sheet>
  );
}
