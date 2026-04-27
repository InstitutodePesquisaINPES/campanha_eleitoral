import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

/**
 * Agregador de KPIs reais para o dashboard inicial e visões executivas.
 * Cobre: territorial, CRM, demandas, agenda, financeiro, comunicação,
 * plano de campanha, comando e itens do usuário logado.
 */
export interface DashboardKPIs {
  // Volume
  municipios: number;
  pessoas: number;
  materiais: number;
  // Demandas
  demandasTotal: number;
  demandasAbertas: number;
  demandasUrgentes: number;
  demandasResolvidasMes: number;
  // Agenda
  eventosFuturos: number;
  eventosHoje: number;
  // Plano
  campanhaId: string | null;
  campanhaNome: string | null;
  metaVotos: number | null;
  diasParaEleicao: number | null;
  pctExecucao: number;
  tarefasAtrasadas: number;
  tarefasTotal: number;
  proximoMarcoTitulo: string | null;
  proximoMarcoDias: number | null;
  // Financeiro
  totalGasto: number;
  orcamentoTotal: number;
  pctOrcamento: number;
  contratosVencendo: number;
  // Comunicação
  pecasPendentes: number;
  mencoesAbertas: number;
  // Inteligência
  liderancasA: number;
}

export function useDashboardKPIs() {
  const qc = useQueryClient();

  // Realtime: invalida quando qualquer tabela relevante muda
  useEffect(() => {
    const tables = [
      "demandas", "agenda", "campanha_tarefas", "campanhas",
      "despesas", "contratos", "comunicacao_pecas", "comunicacao_mencoes",
      "pessoas", "materiais",
    ];
    const ch = supabase.channel("dashboard-realtime");
    tables.forEach((t) => {
      ch.on("postgres_changes" as any, { event: "*", schema: "public", table: t }, () => {
        qc.invalidateQueries({ queryKey: ["dashboard-kpis"] });
      });
    });
    ch.subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [qc]);

  return useQuery<DashboardKPIs>({
    queryKey: ["dashboard-kpis"],
    queryFn: async () => {
      const hoje = new Date();
      const fimDoDia = new Date(hoje); fimDoDia.setHours(23, 59, 59, 999);
      const inicioMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1).toISOString();
      const proximos30 = new Date(hoje.getTime() + 30 * 86400000).toISOString();

      const [
        municipios, pessoas, materiais,
        demandasTotal, demandasAbertas, demandasUrgentes, demandasResolvidasMes,
        eventosFuturos, eventosHoje,
        campanhaAtiva,
        despesas, orcamentoRow, contratosVencendo,
        pecasPendentes, mencoesAbertas,
        liderancasA,
      ] = await Promise.all([
        supabase.from("municipios").select("id", { count: "exact", head: true }),
        supabase.from("pessoas").select("id", { count: "exact", head: true }),
        supabase.from("materiais").select("id", { count: "exact", head: true }).eq("ativo", true),
        supabase.from("demandas").select("id", { count: "exact", head: true }),
        supabase.from("demandas").select("id", { count: "exact", head: true })
          .in("status", ["aberta", "triagem", "encaminhada", "em_andamento"]),
        supabase.from("demandas").select("id", { count: "exact", head: true }).eq("prioridade", "urgente")
          .in("status", ["aberta", "triagem", "encaminhada", "em_andamento"]),
        supabase.from("demandas").select("id", { count: "exact", head: true })
          .eq("status", "resolvida").gte("data_resolucao", inicioMes),
        supabase.from("agenda").select("id", { count: "exact", head: true }).gte("data_inicio", hoje.toISOString()),
        supabase.from("agenda").select("id", { count: "exact", head: true })
          .gte("data_inicio", hoje.toISOString()).lte("data_inicio", fimDoDia.toISOString()),
        supabase.from("campanhas").select("id, nome, meta_votos, data_eleicao, orcamento_total")
          .eq("ativa", true).order("created_at", { ascending: false }).limit(1).maybeSingle(),
        supabase.from("despesas").select("valor").gte("data_despesa", inicioMes),
        supabase.from("campanhas").select("orcamento_total").eq("ativa", true).limit(1).maybeSingle(),
        (supabase as any).from("contratos").select("id", { count: "exact", head: true })
          .lte("data_fim", proximos30).eq("status", "vigente"),
        (supabase as any).from("comunicacao_pecas").select("id", { count: "exact", head: true })
          .in("status", ["rascunho", "em_revisao", "aprovacao_juridica"]),
        (supabase as any).from("comunicacao_mencoes").select("id", { count: "exact", head: true })
          .in("status", ["novo", "em_analise", "escalado"]),
        (supabase as any).from("liderancas_locais").select("id", { count: "exact", head: true })
          .eq("classificacao", "A"),
      ]);

      // Plano da campanha ativa
      let pctExecucao = 0, tarefasAtrasadas = 0, tarefasTotal = 0;
      let proximoMarcoTitulo: string | null = null;
      let proximoMarcoDias: number | null = null;
      let diasParaEleicao: number | null = null;

      if (campanhaAtiva.data?.id) {
        diasParaEleicao = Math.ceil(
          (new Date(campanhaAtiva.data.data_eleicao).getTime() - hoje.getTime()) / 86400000,
        );
        const { data: tarefas } = await supabase
          .from("campanha_tarefas")
          .select("id, status, data_prevista, titulo, is_marco" as any)
          .eq("campanha_id", campanhaAtiva.data.id);
        const all = (tarefas || []) as any[];
        tarefasTotal = all.length;
        const concluidas = all.filter((t) => t.status === "concluida").length;
        pctExecucao = tarefasTotal > 0 ? Math.round((concluidas / tarefasTotal) * 100) : 0;
        tarefasAtrasadas = all.filter(
          (t) => t.status !== "concluida" && new Date(t.data_prevista) < hoje,
        ).length;
        const proximoMarco = all
          .filter((t) => t.is_marco && t.status !== "concluida" && new Date(t.data_prevista) >= hoje)
          .sort((a, b) => new Date(a.data_prevista).getTime() - new Date(b.data_prevista).getTime())[0];
        if (proximoMarco) {
          proximoMarcoTitulo = proximoMarco.titulo;
          proximoMarcoDias = Math.ceil(
            (new Date(proximoMarco.data_prevista).getTime() - hoje.getTime()) / 86400000,
          );
        }
      }

      const totalGasto = (despesas.data || []).reduce((s, d: any) => s + Number(d.valor || 0), 0);
      const orcamentoTotal = Number(orcamentoRow.data?.orcamento_total ?? 0);
      const pctOrcamento = orcamentoTotal > 0 ? Math.min(100, (totalGasto / orcamentoTotal) * 100) : 0;

      return {
        municipios: municipios.count ?? 0,
        pessoas: pessoas.count ?? 0,
        materiais: materiais.count ?? 0,
        demandasTotal: demandasTotal.count ?? 0,
        demandasAbertas: demandasAbertas.count ?? 0,
        demandasUrgentes: demandasUrgentes.count ?? 0,
        demandasResolvidasMes: demandasResolvidasMes.count ?? 0,
        eventosFuturos: eventosFuturos.count ?? 0,
        eventosHoje: eventosHoje.count ?? 0,
        campanhaId: campanhaAtiva.data?.id ?? null,
        campanhaNome: campanhaAtiva.data?.nome ?? null,
        metaVotos: campanhaAtiva.data?.meta_votos ?? null,
        diasParaEleicao,
        pctExecucao,
        tarefasAtrasadas,
        tarefasTotal,
        proximoMarcoTitulo,
        proximoMarcoDias,
        totalGasto,
        orcamentoTotal,
        pctOrcamento,
        contratosVencendo: contratosVencendo.count ?? 0,
        pecasPendentes: pecasPendentes.count ?? 0,
        mencoesAbertas: mencoesAbertas.count ?? 0,
        liderancasA: liderancasA.count ?? 0,
      };
    },
    staleTime: 30_000,
  });
}

/**
 * Itens do usuário logado: demandas atribuídas, eventos próprios, tarefas onde é responsável.
 */
export function useMeusItens() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["meus-itens", user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      const [demandas, eventos] = await Promise.all([
        supabase.from("demandas")
          .select("id, titulo, status, prioridade, data_prazo, protocolo")
          .eq("responsavel_id", user!.id)
          .in("status", ["aberta", "triagem", "encaminhada", "em_andamento"])
          .order("data_prazo", { ascending: true, nullsFirst: false })
          .limit(5),
        supabase.from("agenda")
          .select("id, titulo, data_inicio, tipo, local")
          .eq("responsavel_id", user!.id)
          .gte("data_inicio", new Date().toISOString())
          .order("data_inicio").limit(5),
      ]);
      return {
        demandas: demandas.data || [],
        eventos: eventos.data || [],
      };
    },
    staleTime: 30_000,
  });
}
