import { useMemo, useState } from "react";
import { useCaptacao } from "@/hooks/usePesquisasCaptacao";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from "recharts";
import { Download } from "lucide-react";

const STAGE_ORDER = ["prospect", "contatado", "negociando", "confirmado", "recebido"] as const;
const STAGE_LABEL: Record<string, string> = {
  prospect: "Prospect", contatado: "Contatado", negociando: "Negociando",
  confirmado: "Comprometido", recebido: "Recebido", recusado: "Recusado",
};

// weight for pipeline forecast (probability of closing)
const STAGE_WEIGHT: Record<string, number> = {
  prospect: 0.1, contatado: 0.25, negociando: 0.45, confirmado: 0.80, recebido: 1.0, recusado: 0,
};

function fmt(n: number) { return `R$ ${Number(n || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`; }
function ymd(d: Date) { return d.toISOString().slice(0, 10); }

export function CaptacaoRelatorio() {
  const { data: doadores = [], isLoading } = useCaptacao();
  const [periodo, setPeriodo] = useState<"30" | "90" | "ytd" | "all">("90");
  const [grupo, setGrupo] = useState<"mes" | "trimestre">("mes");

  const { inicio, fim } = useMemo(() => {
    const now = new Date();
    if (periodo === "all") return { inicio: new Date(2000, 0, 1), fim: new Date(2100, 0, 1) };
    if (periodo === "ytd") return { inicio: new Date(now.getFullYear(), 0, 1), fim: now };
    const days = periodo === "30" ? 30 : 90;
    const start = new Date(now); start.setDate(start.getDate() - days);
    return { inicio: start, fim: now };
  }, [periodo]);

  const filtrados = useMemo(() => {
    return (doadores as any[]).filter(d => {
      const ref = d.data_recebimento ?? d.data_confirmacao ?? d.data_contato ?? d.created_at;
      if (!ref) return true;
      const dt = new Date(ref);
      return dt >= inicio && dt <= fim;
    });
  }, [doadores, inicio, fim]);

  // Funil
  const funil = useMemo(() => {
    return STAGE_ORDER.map(s => {
      const rows = filtrados.filter(d => d.status === s);
      const total = rows.reduce((a: number, d: any) => a + Number(
        s === "recebido" ? d.valor_recebido : s === "confirmado" ? d.valor_confirmado : d.valor_estimado || 0
      ), 0);
      return { etapa: STAGE_LABEL[s], key: s, count: rows.length, valor: total };
    });
  }, [filtrados]);

  const conversoes = useMemo(() => {
    const r: { de: string; para: string; taxa: number }[] = [];
    for (let i = 0; i < STAGE_ORDER.length - 1; i++) {
      const a = funil[i].count, b = funil[i + 1].count;
      r.push({ de: STAGE_LABEL[STAGE_ORDER[i]], para: STAGE_LABEL[STAGE_ORDER[i + 1]], taxa: a > 0 ? b / a : 0 });
    }
    return r;
  }, [funil]);

  // Previsão por período
  const previsao = useMemo(() => {
    const buckets: Record<string, { label: string; recebido: number; comprometido: number; ponderado: number; count: number }> = {};
    function keyOf(d: Date) {
      if (grupo === "trimestre") return `${d.getFullYear()}-T${Math.floor(d.getMonth() / 3) + 1}`;
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    }
    filtrados.forEach((d: any) => {
      const ref = d.data_recebimento ?? d.data_confirmacao ?? d.data_contato ?? d.created_at;
      const dt = new Date(ref);
      const k = keyOf(dt);
      if (!buckets[k]) buckets[k] = { label: k, recebido: 0, comprometido: 0, ponderado: 0, count: 0 };
      buckets[k].recebido += Number(d.valor_recebido || 0);
      if (d.status === "confirmado") buckets[k].comprometido += Number(d.valor_confirmado || 0);
      buckets[k].ponderado += Number((d.valor_estimado || d.valor_confirmado || 0)) * (STAGE_WEIGHT[d.status] ?? 0);
      buckets[k].count += 1;
    });
    return Object.values(buckets).sort((a, b) => a.label.localeCompare(b.label));
  }, [filtrados, grupo]);

  // Por responsável
  const porResponsavel = useMemo(() => {
    const map: Record<string, any> = {};
    filtrados.forEach((d: any) => {
      const k = d.responsavel_id ?? "__none__";
      if (!map[k]) map[k] = { responsavel_id: k, total: 0, prospect: 0, recebido_count: 0, valor_estimado: 0, valor_confirmado: 0, valor_recebido: 0 };
      map[k].total += 1;
      if (d.status === "prospect") map[k].prospect += 1;
      if (d.status === "recebido") map[k].recebido_count += 1;
      map[k].valor_estimado += Number(d.valor_estimado || 0);
      map[k].valor_confirmado += Number(d.valor_confirmado || 0);
      map[k].valor_recebido += Number(d.valor_recebido || 0);
    });
    return Object.values(map).sort((a: any, b: any) => b.valor_recebido - a.valor_recebido);
  }, [filtrados]);

  function exportCSV() {
    const linhas: string[] = [];
    linhas.push("FUNIL");
    linhas.push("Etapa;Qtd;Valor");
    funil.forEach(f => linhas.push(`${f.etapa};${f.count};${f.valor.toFixed(2)}`));
    linhas.push("");
    linhas.push("CONVERSOES");
    linhas.push("De;Para;Taxa");
    conversoes.forEach(c => linhas.push(`${c.de};${c.para};${(c.taxa * 100).toFixed(1)}%`));
    linhas.push("");
    linhas.push("PREVISAO_POR_PERIODO");
    linhas.push("Periodo;Recebido;Comprometido;Ponderado;Qtd");
    previsao.forEach(p => linhas.push(`${p.label};${p.recebido.toFixed(2)};${p.comprometido.toFixed(2)};${p.ponderado.toFixed(2)};${p.count}`));
    linhas.push("");
    linhas.push("POR_RESPONSAVEL");
    linhas.push("Responsavel;Qtd;Estimado;Comprometido;Recebido;TaxaConversao");
    porResponsavel.forEach((r: any) => {
      const tx = r.total > 0 ? (r.recebido_count / r.total * 100).toFixed(1) + "%" : "0%";
      linhas.push(`${r.responsavel_id};${r.total};${r.valor_estimado.toFixed(2)};${r.valor_confirmado.toFixed(2)};${r.valor_recebido.toFixed(2)};${tx}`);
    });
    const blob = new Blob([linhas.join("\n")], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `captacao-relatorio-${ymd(new Date())}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  if (isLoading) return <p className="text-sm text-muted-foreground">Carregando...</p>;

  const maxCount = Math.max(...funil.map(f => f.count), 1);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <Select value={periodo} onValueChange={(v: any) => setPeriodo(v)}>
          <SelectTrigger className="w-40 h-8 text-xs"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="30">Últimos 30 dias</SelectItem>
            <SelectItem value="90">Últimos 90 dias</SelectItem>
            <SelectItem value="ytd">Ano atual (YTD)</SelectItem>
            <SelectItem value="all">Todo o histórico</SelectItem>
          </SelectContent>
        </Select>
        <Select value={grupo} onValueChange={(v: any) => setGrupo(v)}>
          <SelectTrigger className="w-32 h-8 text-xs"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="mes">Por mês</SelectItem>
            <SelectItem value="trimestre">Por trimestre</SelectItem>
          </SelectContent>
        </Select>
        <div className="flex-1" />
        <Button variant="outline" size="sm" onClick={exportCSV}><Download className="h-3 w-3 mr-1" />Exportar CSV</Button>
      </div>

      {/* Funil */}
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-sm">Funil de captação</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {funil.map((f, i) => {
            const w = (f.count / maxCount) * 100;
            const prev = i > 0 ? funil[i - 1].count : null;
            const taxa = prev && prev > 0 ? (f.count / prev * 100).toFixed(1) + "%" : null;
            return (
              <div key={f.key} className="flex items-center gap-2">
                <div className="w-28 text-xs">{f.etapa}</div>
                <div className="flex-1 relative h-6 bg-muted rounded">
                  <div className="h-full bg-primary rounded flex items-center px-2" style={{ width: `${Math.max(w, 5)}%` }}>
                    <span className="text-[10px] text-primary-foreground font-medium">{f.count}</span>
                  </div>
                </div>
                <div className="w-24 text-xs text-right">{fmt(f.valor)}</div>
                <div className="w-16 text-xs text-right text-muted-foreground">{taxa ?? "—"}</div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Previsão */}
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-sm">Previsão de arrecadação por {grupo === "mes" ? "mês" : "trimestre"}</CardTitle></CardHeader>
        <CardContent>
          {previsao.length === 0 ? (
            <p className="text-xs text-muted-foreground">Sem dados no período.</p>
          ) : (
            <div style={{ width: "100%", height: 260 }}>
              <ResponsiveContainer>
                <BarChart data={previsao}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                  <XAxis dataKey="label" fontSize={10} />
                  <YAxis fontSize={10} tickFormatter={(v) => `R$${(v / 1000).toFixed(0)}k`} />
                  <Tooltip formatter={(v: any) => fmt(v)} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Bar dataKey="recebido" fill="hsl(var(--primary))" name="Recebido" />
                  <Bar dataKey="comprometido" fill="#a855f7" name="Comprometido" />
                  <Bar dataKey="ponderado" fill="#f59e0b" name="Previsão ponderada" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Por responsável */}
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-sm">Performance por responsável</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-xs">Responsável (ID)</TableHead>
                <TableHead className="text-xs text-right">Qtd</TableHead>
                <TableHead className="text-xs text-right">Estimado</TableHead>
                <TableHead className="text-xs text-right">Comprometido</TableHead>
                <TableHead className="text-xs text-right">Recebido</TableHead>
                <TableHead className="text-xs text-right">Conversão</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {porResponsavel.length === 0 && (
                <TableRow><TableCell colSpan={6} className="text-xs text-muted-foreground text-center">Sem dados</TableCell></TableRow>
              )}
              {porResponsavel.map((r: any) => {
                const tx = r.total > 0 ? (r.recebido_count / r.total * 100) : 0;
                return (
                  <TableRow key={r.responsavel_id}>
                    <TableCell className="text-xs font-mono">{r.responsavel_id === "__none__" ? <span className="text-muted-foreground italic">sem responsável</span> : r.responsavel_id.slice(0, 8)}</TableCell>
                    <TableCell className="text-xs text-right">{r.total}</TableCell>
                    <TableCell className="text-xs text-right">{fmt(r.valor_estimado)}</TableCell>
                    <TableCell className="text-xs text-right text-purple-300">{fmt(r.valor_confirmado)}</TableCell>
                    <TableCell className="text-xs text-right text-emerald-400">{fmt(r.valor_recebido)}</TableCell>
                    <TableCell className="text-xs text-right">
                      <Badge variant="outline" className={tx >= 30 ? "bg-emerald-500/10 text-emerald-300" : tx >= 10 ? "bg-amber-500/10 text-amber-300" : "bg-red-500/10 text-red-300"}>
                        {tx.toFixed(1)}%
                      </Badge>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
