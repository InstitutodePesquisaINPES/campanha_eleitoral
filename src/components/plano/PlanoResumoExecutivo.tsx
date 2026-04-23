import { useMemo } from "react";
import { useTarefas, useFases, useMetas, useSemanas, useCampanha } from "@/hooks/useCampanhas";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Activity, Flag, Calendar, Target, AlertTriangle, ShieldAlert, TrendingUp } from "lucide-react";

/**
 * Resumo executivo do plano: saúde geral, fase corrente, semana atual,
 * próximos marcos críticos, metas em risco e gap de ritmo.
 * Tudo derivado dos dados reais — sem mocks.
 */
export function PlanoResumoExecutivo({ campanhaId }: { campanhaId: string }) {
  const { data: campanha } = useCampanha(campanhaId);
  const { data: tarefas = [] } = useTarefas(campanhaId);
  const { data: fases = [] } = useFases(campanhaId);
  const { data: metas = [] } = useMetas(campanhaId);
  const { data: semanas = [] } = useSemanas(campanhaId);

  const insights = useMemo(() => {
    if (!campanha) return null;
    const hoje = new Date();
    const inicio = new Date(campanha.data_inicio_plano);
    const eleicao = new Date(campanha.data_eleicao);
    const duracao = Math.max(1, Math.ceil((eleicao.getTime() - inicio.getTime()) / 86400000));
    const decorridos = Math.max(0, Math.ceil((hoje.getTime() - inicio.getTime()) / 86400000));
    const pctTempo = Math.min(100, Math.round((decorridos / duracao) * 100));

    const total = tarefas.length;
    const concluidas = tarefas.filter((t) => t.status === "concluida").length;
    const pctExec = total ? Math.round((concluidas / total) * 100) : 0;
    const atrasadas = tarefas.filter((t) => t.status !== "concluida" && new Date(t.data_prevista) < hoje).length;
    const gapRitmo = pctTempo - pctExec;

    const faseAtual = fases.find((f) => new Date(f.data_inicio) <= hoje && new Date(f.data_fim) >= hoje) ?? fases[fases.length - 1];
    const semanaAtual = semanas.find((s) => new Date(s.data_inicio) <= hoje && new Date(s.data_fim) >= hoje) ?? semanas[0];

    const proximosMarcos = (tarefas as any[])
      .filter((t) => t.is_marco && t.status !== "concluida" && new Date(t.data_prevista) >= hoje)
      .sort((a, b) => new Date(a.data_prevista).getTime() - new Date(b.data_prevista).getTime())
      .slice(0, 5);

    const metasRisco = metas.filter((m) => m.valor_meta > 0 && (m.valor_realizado / m.valor_meta) < 0.5);

    const tarefasFaseAtual = faseAtual ? tarefas.filter((t) => t.fase_id === faseAtual.id) : [];
    const tarefasFaseConcluidas = tarefasFaseAtual.filter((t) => t.status === "concluida").length;
    const pctFase = tarefasFaseAtual.length ? Math.round((tarefasFaseConcluidas / tarefasFaseAtual.length) * 100) : 0;

    return {
      pctTempo, pctExec, gapRitmo, atrasadas,
      faseAtual, semanaAtual, pctFase,
      proximosMarcos, metasRisco,
      diasParaEleicao: Math.max(0, Math.ceil((eleicao.getTime() - hoje.getTime()) / 86400000)),
    };
  }, [campanha, tarefas, fases, metas, semanas]);

  if (!insights) return null;

  const saudeGeral =
    insights.atrasadas > 10 || insights.gapRitmo > 20 ? { label: "Crítica", tone: "destructive" }
    : insights.atrasadas > 3 || insights.gapRitmo > 10 ? { label: "Atenção", tone: "warning" }
    : { label: "Saudável", tone: "success" };

  const toneClass: Record<string, string> = {
    destructive: "bg-destructive/10 text-destructive border-destructive/30",
    warning: "bg-warning/10 text-warning border-warning/30",
    success: "bg-success/10 text-success border-success/30",
  };

  return (
    <div className="space-y-4">
      {/* Saúde geral */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <Activity className="h-4 w-4 text-primary" /> Saúde do plano
            <Badge variant="outline" className={`ml-auto ${toneClass[saudeGeral.tone]}`}>{saudeGeral.label}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <ResumoBox label="Tempo decorrido" value={`${insights.pctTempo}%`} progress={insights.pctTempo} />
          <ResumoBox label="Execução" value={`${insights.pctExec}%`} progress={insights.pctExec}
            tone={insights.gapRitmo > 10 ? "destructive" : "success"} />
          <ResumoBox label="Tarefas atrasadas" value={String(insights.atrasadas)}
            tone={insights.atrasadas > 0 ? "destructive" : "success"} />
          <ResumoBox label="D-eleição" value={String(insights.diasParaEleicao)}
            tone={insights.diasParaEleicao < 30 ? "destructive" : "primary"} />
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Fase atual */}
        {insights.faseAtual && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm">
                <TrendingUp className="h-4 w-4 text-primary" /> Fase atual
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div>
                <p className="font-semibold text-sm">{insights.faseAtual.nome}</p>
                <p className="text-xs text-muted-foreground">{insights.faseAtual.foco}</p>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">
                  {new Date(insights.faseAtual.data_inicio).toLocaleDateString("pt-BR")} → {new Date(insights.faseAtual.data_fim).toLocaleDateString("pt-BR")}
                </span>
                <span className="font-medium">{insights.pctFase}% concluído</span>
              </div>
              <Progress value={insights.pctFase} className="h-1.5" />
              {insights.semanaAtual && (
                <div className="mt-3 pt-3 border-t border-border">
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Semana corrente</p>
                  <p className="text-sm font-medium">Semana {insights.semanaAtual.numero_semana}</p>
                  <p className="text-xs text-muted-foreground">{insights.semanaAtual.foco_principal}</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Próximos marcos */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm">
              <Flag className="h-4 w-4 text-warning" /> Próximos marcos críticos
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-1.5">
            {insights.proximosMarcos.length === 0 ? (
              <p className="text-xs text-muted-foreground py-3 text-center">Nenhum marco futuro.</p>
            ) : (
              insights.proximosMarcos.map((m: any) => {
                const dias = Math.ceil((new Date(m.data_prevista).getTime() - Date.now()) / 86400000);
                return (
                  <div key={m.id} className="flex items-center justify-between gap-2 text-xs py-1.5 px-2 rounded hover:bg-muted/40">
                    <div className="flex items-center gap-1.5 min-w-0">
                      {m.fase_legal === "campanha_oficial"
                        ? <ShieldAlert className="h-3 w-3 text-warning shrink-0" />
                        : <Flag className="h-3 w-3 text-info shrink-0" />}
                      <span className="truncate">{m.titulo}</span>
                    </div>
                    <Badge variant="outline" className={`text-[10px] shrink-0 ${dias <= 7 ? "bg-destructive/10 text-destructive border-destructive/30" : ""}`}>
                      D-{dias}
                    </Badge>
                  </div>
                );
              })
            )}
          </CardContent>
        </Card>

        {/* Metas em risco */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm">
              <Target className="h-4 w-4 text-destructive" /> Metas em risco (&lt; 50% realizado)
              {insights.metasRisco.length > 0 && (
                <Badge variant="outline" className="ml-auto text-[10px] bg-destructive/10 text-destructive border-destructive/30">
                  {insights.metasRisco.length}
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {insights.metasRisco.length === 0 ? (
              <p className="text-xs text-muted-foreground py-3 text-center">Todas as metas estão acima de 50%.</p>
            ) : (
              <div className="grid sm:grid-cols-2 gap-2">
                {insights.metasRisco.map((m) => {
                  const pct = m.valor_meta ? Math.round((m.valor_realizado / m.valor_meta) * 100) : 0;
                  return (
                    <div key={m.id} className="rounded border border-border p-2.5">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <p className="text-xs font-medium truncate">{m.meta}</p>
                        <Badge variant="outline" className="text-[10px] shrink-0 capitalize">{m.area}</Badge>
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-muted-foreground mb-1">
                        <span>{m.valor_realizado.toLocaleString("pt-BR")} / {m.valor_meta.toLocaleString("pt-BR")}</span>
                        <span className="font-medium">{pct}%</span>
                      </div>
                      <Progress value={pct} className="h-1" />
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function ResumoBox({ label, value, progress, tone = "primary" }: {
  label: string; value: string; progress?: number; tone?: "primary" | "success" | "warning" | "destructive";
}) {
  const cls = {
    primary: "text-primary", success: "text-success", warning: "text-warning", destructive: "text-destructive",
  }[tone];
  return (
    <div className="rounded-md border border-border p-3">
      <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className={`text-2xl font-bold mt-1 ${cls}`}>{value}</p>
      {typeof progress === "number" && <Progress value={progress} className="mt-2 h-1" />}
    </div>
  );
}
