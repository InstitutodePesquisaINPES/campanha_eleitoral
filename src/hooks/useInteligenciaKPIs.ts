import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/apiClient";

export function useInteligenciaKPIs(campanhaId?: string, uf = "BA", ano = 2024) {
  return useQuery({
    queryKey: ["inteligencia-kpis", campanhaId, uf, ano],
    enabled: !!campanhaId,
    queryFn: async () => {
      const data = await api.get<any>(`/inteligencia/kpis?campanhaId=${campanhaId}&uf=${uf}&ano=${ano}`);
      return data;
    },
  });
}
