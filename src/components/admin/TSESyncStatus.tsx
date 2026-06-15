import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Download, Loader2, CheckCircle2, AlertTriangle, Activity, FileText } from "lucide-react";
import { useTSECsvArquivos, type TseCsvArquivo } from "@/hooks/useTSECsvArquivos";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

const statusMeta = {
  aguardando:  { label: "Na fila / Baixando", icon: Download,      cls: "bg-amber-500/15 text-amber-400 border-amber-500/30" },
  processando: { label: "Processando",        icon: Loader2,       cls: "bg-primary/15 text-primary border-primary/30", spin: true },
  concluido:   { label: "Concluído",          icon: CheckCircle2,  cls: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30" },
  erro:        { label: "Erro",               icon: AlertTriangle, cls: "bg-destructive/15 text-destructive border-destructive/30" },
} as const;

export function TSESyncStatus() {
  const { data: arquivos = [], isLoading } = useTSECsvArquivos();

  const stats = useMemo(() => {
    const by: Record<string, TseCsvArquivo[]> = { aguardando: [], processando: [], concluido: [], erro: [], pausado: [] };
    for (const a of arquivos) (by[a.status] ||= []).push(a);
    const totalLinhas = arquivos.reduce((s, a) => s + (a.total_linhas ?? 0), 0);
    const processadas = arquivos.reduce((s, a) => s + (a.linhas_processadas ?? 0), 0);
    const pctGeral = totalLinhas > 0 ? Math.min(100, Math.round((processadas / totalLinhas) * 100)) : 0;
    return { by, totalLinhas, processadas, pctGeral };
  }, [arquivos]);

  const recentes = useMemo(
    () =>
      [...arquivos]
        .sort((a, b) => new Date(b.ultima_atividade_em ?? b.updated_at ?? b.created_at).getTime() -
                       new Date(a.ultima_atividade_em ?? a.updated_at ?? a.created_at).getTime())
        .slice(0, 8),
    [arquivos],
  );

  return (
    <Card className="border-primary/20">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-primary" />
            Status da sincronização TSE
          </CardTitle>
          <Badge variant="outline" className="text-xs">
            Atualizando a cada 3s · {arquivos.length} arquivo(s)
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* Cards por status */}
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {(["aguardando", "processando", "concluido", "erro"] as const).map((s) => {
            const meta = statusMeta[s];
            const Icon = meta.icon;
            const list = stats.by[s] ?? [];
            return (
              <div key={s} className={`rounded-xl border p-4 ${meta.cls}`}>
                <div className="flex items-center justify-between">
                  <div className="text-xs font-semibold uppercase tracking-wide opacity-80">{meta.label}</div>
                  <Icon className={`h-4 w-4 ${"spin" in meta && meta.spin && list.length > 0 ? "animate-spin" : ""}`} />
                </div>
                <div className="mt-2 text-3xl font-extrabold">{list.length}</div>
                <div className="mt-1 text-[11px] opacity-70">
                  {list.reduce((s, a) => s + (a.linhas_processadas ?? 0), 0).toLocaleString("pt-BR")} linhas
                </div>
              </div>
            );
          })}
        </div>

        {/* Progresso global */}
        <div className="rounded-lg border bg-muted/30 p-4">
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="font-semibold">Progresso global</span>
            <span className="tabular-nums text-muted-foreground">
              {stats.processadas.toLocaleString("pt-BR")} / {stats.totalLinhas.toLocaleString("pt-BR")} linhas · {stats.pctGeral}%
            </span>
          </div>
          <Progress value={stats.pctGeral} className="h-3" />
        </div>

        {/* Últimos registros */}
        <div>
          <div className="flex items-center gap-2 text-sm font-semibold mb-2">
            <FileText className="h-4 w-4 text-muted-foreground" />
            Últimos arquivos com atividade
          </div>
          {isLoading ? (
            <div className="text-sm text-muted-foreground flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" /> Carregando…
            </div>
          ) : recentes.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nenhum arquivo importado ainda.</p>
          ) : (
            <div className="rounded-lg border divide-y">
              {recentes.map((a) => {
                const meta = statusMeta[a.status as keyof typeof statusMeta] ?? statusMeta.aguardando;
                const Icon = meta.icon;
                const when = a.ultima_atividade_em ?? a.updated_at ?? a.created_at;
                return (
                  <div key={a.id} className="flex items-center gap-3 p-3">
                    <div className={`rounded-md border p-1.5 ${meta.cls}`}>
                      <Icon className={`h-4 w-4 ${"spin" in meta && meta.spin && a.status === "processando" ? "animate-spin" : ""}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate">{a.nome_original}</div>
                      <div className="text-[11px] text-muted-foreground flex flex-wrap gap-x-2">
                        <span>{a.tipo}</span>
                        <span>· {a.uf}/{a.ano}</span>
                        <span>· {(a.linhas_processadas ?? 0).toLocaleString("pt-BR")} linhas</span>
                        {when && (
                          <span>
                            · {formatDistanceToNow(new Date(when), { addSuffix: true, locale: ptBR })}
                          </span>
                        )}
                        {a.error_msg && a.status === "erro" && (
                          <span className="text-destructive truncate max-w-[300px]">· {a.error_msg}</span>
                        )}
                      </div>
                    </div>
                    <div className="w-32 hidden sm:block">
                      <Progress value={a.progress_pct ?? 0} className="h-2" />
                      <div className="text-[10px] text-right text-muted-foreground mt-0.5 tabular-nums">
                        {a.progress_pct ?? 0}%
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
