import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useTSEComparativo } from "@/hooks/useEleitoralTSE";
import { Bar, BarChart, CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { TrendingDown, TrendingUp, Minus } from "lucide-react";

const fmt = (n: number) => (n ?? 0).toLocaleString("pt-BR");

function Trend({ atual, anterior }: { atual: number; anterior?: number }) {
  if (!anterior) return <Minus className="h-3 w-3 text-muted-foreground inline" />;
  const diff = ((atual - anterior) / anterior) * 100;
  if (Math.abs(diff) < 0.5) return <span className="text-muted-foreground text-xs">≈</span>;
  const Icon = diff > 0 ? TrendingUp : TrendingDown;
  const color = diff > 0 ? "text-success" : "text-destructive";
  return <span className={`inline-flex items-center gap-0.5 text-xs ${color}`}><Icon className="h-3 w-3" />{diff > 0 ? "+" : ""}{diff.toFixed(1)}%</span>;
}

export function ComparativoTab({ uf, municipio, cargo }: { uf: string; municipio?: string; cargo?: string }) {
  const { data: rows = [], isLoading } = useTSEComparativo(uf, municipio, cargo);

  if (isLoading) return <Skeleton className="h-96" />;
  if (!rows.length) return <Card><CardContent className="py-12 text-center text-sm text-muted-foreground">Sem histórico para o filtro selecionado.</CardContent></Card>;

  const escopo = [municipio && `município ${municipio}`, cargo && `cargo ${cargo}`].filter(Boolean).join(" · ") || `${uf} (estado)`;

  return (
    <div className="space-y-4">
      <p className="text-xs text-muted-foreground">Comparando todas eleições disponíveis · escopo: <strong>{escopo}</strong></p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm">Evolução do eleitorado</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={rows}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis dataKey="ano" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} tickFormatter={(v) => v >= 1000 ? `${(v/1000).toFixed(0)}k` : v} />
                <Tooltip formatter={(v: number) => fmt(v)} contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }} />
                <Line type="monotone" dataKey="total_eleitores" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ r: 4 }} name="Eleitores" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm">Candidatos × Eleitos por ano</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={rows}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis dataKey="ano" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip formatter={(v: number) => fmt(v)} contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="total_candidatos" fill="hsl(var(--warning))" name="Candidatos" radius={[4, 4, 0, 0]} />
                <Bar dataKey="total_eleitos" fill="hsl(var(--success))" name="Eleitos" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-sm">Tabela comparativa (com variação ano a ano)</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Ano</TableHead>
                <TableHead className="text-right">Eleitores</TableHead>
                <TableHead className="text-right">Δ</TableHead>
                <TableHead className="text-right">Candidatos</TableHead>
                <TableHead className="text-right">Eleitos</TableHead>
                <TableHead className="text-right">% Eleitos</TableHead>
                <TableHead className="text-right">Votos nominais</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((r, i) => {
                const prev = rows[i - 1];
                const pctEleitos = r.total_candidatos ? (r.total_eleitos / r.total_candidatos) * 100 : 0;
                return (
                  <TableRow key={r.ano}>
                    <TableCell className="font-bold">{r.ano}</TableCell>
                    <TableCell className="text-right font-mono tabular-nums">{fmt(r.total_eleitores)}</TableCell>
                    <TableCell className="text-right"><Trend atual={r.total_eleitores} anterior={prev?.total_eleitores} /></TableCell>
                    <TableCell className="text-right font-mono tabular-nums">{fmt(r.total_candidatos)}</TableCell>
                    <TableCell className="text-right font-mono tabular-nums text-success">{fmt(r.total_eleitos)}</TableCell>
                    <TableCell className="text-right text-xs text-muted-foreground">{pctEleitos.toFixed(1)}%</TableCell>
                    <TableCell className="text-right font-mono tabular-nums">{fmt(r.total_votos_nominais)}</TableCell>
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
