import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/apiClient";

export interface BIStatsResponse {
  totals: {
    pessoas: number;
    demandas: number;
    agenda: number;
    municipios: number;
    bairros: number;
    totalDespesas: number;
    totalReceitas: number;
    saldo: number;
    demandasResolvidas: number;
    demandasAbertas: number;
  };
  pessoasPorNivel: Record<string, number>;
  demandasPorStatus: Record<string, number>;
  demandasPorCategoria: Record<string, number>;
  agendaPorTipo: Record<string, number>;
  despesasPorCategoria: Record<string, number>;
  receitasPorTipo: Record<string, number>;
  bairrosPorClassificacao: Record<string, number>;
  monthlyTrend: Array<{ label: string; pessoas: number; demandas: number; eventos: number }>;
}

export function useBIStats() {
  return useQuery({
    queryKey: ["bi_stats_overview"],
    queryFn: async () => {
      const data = await api.get<BIStatsResponse>('/dashboard/overview');
      return data;
    },
  });
}
