import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useBIStats() {
  return useQuery({
    queryKey: ["bi_stats"],
    queryFn: async () => {
      const [pessoasRes, demandasRes, agendaRes, despesasRes, receitasRes, bairrosRes, municipiosRes] = await Promise.all([
        supabase.from("pessoas").select("id, nivel_relacionamento, created_at"),
        supabase.from("demandas").select("id, status, categoria, prioridade, data_abertura, data_resolucao"),
        supabase.from("agenda").select("id, tipo, status, data_inicio"),
        supabase.from("despesas").select("id, valor, categoria, status, data_despesa"),
        supabase.from("receitas").select("id, valor, tipo, data"),
        supabase.from("bairros").select("id, classificacao"),
        supabase.from("municipios").select("id"),
      ]);

      const pessoas = pessoasRes.data || [];
      const demandas = demandasRes.data || [];
      const agenda = agendaRes.data || [];
      const despesas = despesasRes.data || [];
      const receitas = receitasRes.data || [];
      const bairros = bairrosRes.data || [];
      const municipios = municipiosRes.data || [];

      // Pessoas por nível
      const pessoasPorNivel = pessoas.reduce((acc: Record<string, number>, p) => {
        acc[p.nivel_relacionamento] = (acc[p.nivel_relacionamento] || 0) + 1;
        return acc;
      }, {});

      // Demandas por status
      const demandasPorStatus = demandas.reduce((acc: Record<string, number>, d) => {
        acc[d.status] = (acc[d.status] || 0) + 1;
        return acc;
      }, {});

      // Demandas por categoria
      const demandasPorCategoria = demandas.reduce((acc: Record<string, number>, d) => {
        acc[d.categoria] = (acc[d.categoria] || 0) + 1;
        return acc;
      }, {});

      // Agenda por tipo
      const agendaPorTipo = agenda.reduce((acc: Record<string, number>, a) => {
        acc[a.tipo] = (acc[a.tipo] || 0) + 1;
        return acc;
      }, {});

      // Despesas por categoria
      const despesasPorCategoria = despesas.reduce((acc: Record<string, number>, d) => {
        const val = Number(d.valor) || 0;
        acc[d.categoria] = (acc[d.categoria] || 0) + val;
        return acc;
      }, {});

      // Receitas por tipo
      const receitasPorTipo = receitas.reduce((acc: Record<string, number>, r) => {
        const val = Number(r.valor) || 0;
        acc[r.tipo] = (acc[r.tipo] || 0) + val;
        return acc;
      }, {});

      // Bairros por classificação
      const bairrosPorClassificacao = bairros.reduce((acc: Record<string, number>, b) => {
        const key = b.classificacao || "sem_classificacao";
        acc[key] = (acc[key] || 0) + 1;
        return acc;
      }, {});

      // Financeiro totais
      const totalDespesas = despesas.reduce((s, d) => s + (Number(d.valor) || 0), 0);
      const totalReceitas = receitas.reduce((s, r) => s + (Number(r.valor) || 0), 0);

      // Demandas resolvidas vs abertas
      const demandasResolvidas = demandas.filter(d => d.status === "resolvida").length;
      const demandasAbertas = demandas.filter(d => ["aberta", "triagem", "encaminhada", "em_andamento"].includes(d.status)).length;

      // Monthly trend (últimos 6 meses)
      const now = new Date();
      const monthlyTrend = Array.from({ length: 6 }, (_, i) => {
        const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
        const monthKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
        const label = d.toLocaleString("pt-BR", { month: "short", year: "2-digit" });
        const pessoasCount = pessoas.filter(p => p.created_at?.startsWith(monthKey)).length;
        const demandasCount = demandas.filter(dd => dd.data_abertura?.startsWith(monthKey)).length;
        const eventosCount = agenda.filter(a => a.data_inicio?.startsWith(monthKey)).length;
        return { label, pessoas: pessoasCount, demandas: demandasCount, eventos: eventosCount };
      });

      return {
        totals: {
          pessoas: pessoas.length,
          demandas: demandas.length,
          agenda: agenda.length,
          municipios: municipios.length,
          bairros: bairros.length,
          totalDespesas,
          totalReceitas,
          saldo: totalReceitas - totalDespesas,
          demandasResolvidas,
          demandasAbertas,
        },
        pessoasPorNivel,
        demandasPorStatus,
        demandasPorCategoria,
        agendaPorTipo,
        despesasPorCategoria,
        receitasPorTipo,
        bairrosPorClassificacao,
        monthlyTrend,
      };
    },
  });
}
