import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/apiClient";
import { toast } from "sonner";

// ============== TIPOS ==============
export type ClassificacaoEstrategica = "reduto" | "disputa" | "expansao" | "perdido" | "neutro";
export type LiderancaClassificacao = "A" | "B" | "C" | "D";
export type LiderancaStatus = "mapeado" | "contactado" | "reuniao_marcada" | "comprometido" | "aliado" | "neutro" | "adversario";
export type LiderancaTipo = "religiosa" | "associativa" | "politica" | "comunitaria" | "empresarial" | "sindical" | "cultural" | "esportiva" | "familiar" | "profissional";
export type VereadorAlinhamento = "aliado" | "simpatizante" | "neutro" | "adversario" | "desconhecido";
export type FaixaVotos = "ate_150" | "f_150_500" | "f_500_1000" | "f_1000_2000" | "f_2000_5000" | "acima_5000";

export const FAIXA_LABEL: Record<FaixaVotos, string> = {
  ate_150: "Até 150",
  f_150_500: "150 a 500",
  f_500_1000: "500 a 1.000",
  f_1000_2000: "1.000 a 2.000",
  f_2000_5000: "2.000 a 5.000",
  acima_5000: "Acima de 5.000",
};

export const CLASS_LABEL: Record<ClassificacaoEstrategica, string> = {
  reduto: "Reduto",
  disputa: "Em Disputa",
  expansao: "Expansão",
  perdido: "Perdido",
  neutro: "Neutro",
};

export const CLASS_COLOR: Record<ClassificacaoEstrategica, string> = {
  reduto: "bg-success/10 text-success border-success/30",
  disputa: "bg-warning/10 text-warning border-warning/30",
  expansao: "bg-info/10 text-info border-info/30",
  perdido: "bg-destructive/10 text-destructive border-destructive/30",
  neutro: "bg-muted text-muted-foreground border-muted",
};

// ============== MUNICÍPIOS ESTRATÉGICOS ==============
export function useMunicipiosEstrategicos(campanhaId?: string) {
  return useQuery({
    queryKey: ["municipios-estrategicos", campanhaId],
    enabled: !!campanhaId,
    queryFn: async () => {
      const data = await api.get<any[]>(`/territorio/municipios/strategic?campanhaId=${campanhaId}`);
      return data || [];
    },
  });
}

export function useUpsertMunicipioEstrategico() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: any) => {
      const data = await api.post('/territorio/municipios/strategic', payload);
      return data;
    },
    onSuccess: (_d, vars: any) => {
      qc.invalidateQueries({ queryKey: ["municipios-estrategicos", vars.campanha_id] });
      toast.success("Município atualizado");
    },
    onError: (e: any) => toast.error(e.message),
  });
}

export function useDeleteMunicipioEstrategico() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/territorio/municipios/strategic/${id}`);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["municipios-estrategicos"] });
      toast.success("Removido");
    },
  });
}

// ============== BAIRROS ESTRATÉGICOS ==============
export function useBairrosEstrategicos(campanhaId?: string, municipioId?: string) {
  return useQuery({
    queryKey: ["bairros-estrategicos", campanhaId, municipioId],
    enabled: !!campanhaId,
    queryFn: async () => {
      let url = `/inteligencia/bairros-estrategicos?campanhaId=${campanhaId}`;
      if (municipioId) url += `&municipioId=${municipioId}`;
      const data = await api.get<any[]>(url);
      return data || [];
    },
  });
}

export function useUpsertBairroEstrategico() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: any) => {
      const data = await api.post('/inteligencia/bairros-estrategicos', payload);
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["bairros-estrategicos"] });
      toast.success("Bairro atualizado");
    },
    onError: (e: any) => toast.error(e.message),
  });
}

// ============== LIDERANÇAS ==============
export function useLiderancas(filters?: { campanhaId?: string; municipioId?: string; classificacao?: LiderancaClassificacao; status?: LiderancaStatus; tipo?: LiderancaTipo }) {
  return useQuery({
    queryKey: ["liderancas", filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters?.campanhaId) params.append('campanhaId', filters.campanhaId);
      if (filters?.municipioId) params.append('municipioId', filters.municipioId);
      if (filters?.classificacao) params.append('classificacao', filters.classificacao);
      if (filters?.status) params.append('status', filters.status);
      if (filters?.tipo) params.append('tipo', filters.tipo);
      
      const data = await api.get<any[]>(`/inteligencia/liderancas?${params.toString()}`);
      return data || [];
    },
  });
}

export function useLiderancaStats(campanhaId?: string) {
  return useQuery({
    queryKey: ["liderancas-stats", campanhaId],
    queryFn: async () => {
      const url = campanhaId ? `/inteligencia/liderancas/stats?campanhaId=${campanhaId}` : `/inteligencia/liderancas/stats`;
      const data = await api.get<any>(url);
      return data;
    },
  });
}

export function useUpsertLideranca() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: any) => {
      if (payload.id) {
        return await api.put(`/inteligencia/liderancas/${payload.id}`, payload);
      } else {
        return await api.post(`/inteligencia/liderancas`, payload);
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["liderancas"] });
      qc.invalidateQueries({ queryKey: ["liderancas-stats"] });
      toast.success("Liderança salva");
    },
    onError: (e: any) => toast.error(e.message),
  });
}

export function useDeleteLideranca() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/inteligencia/liderancas/${id}`);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["liderancas"] });
      qc.invalidateQueries({ queryKey: ["liderancas-stats"] });
      toast.success("Removido");
    },
  });
}

// ============== VEREADORES HISTÓRICOS ==============
export function useVereadoresHistoricos(filters?: { uf?: string; ano?: number; municipioId?: string; faixa?: FaixaVotos; alinhamento?: VereadorAlinhamento }) {
  return useQuery({
    queryKey: ["vereadores-historicos", filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters?.uf) params.append('uf', filters.uf);
      if (filters?.ano) params.append('ano', String(filters.ano));
      if (filters?.municipioId) params.append('municipioId', filters.municipioId);
      if (filters?.faixa) params.append('faixa', filters.faixa);
      if (filters?.alinhamento) params.append('alinhamento', filters.alinhamento);
      
      const data = await api.get<any[]>(`/inteligencia/vereadores?${params.toString()}`);
      return data || [];
    },
  });
}

export function useVereadorStats(uf = "BA", ano = 2024) {
  return useQuery({
    queryKey: ["vereadores-stats", uf, ano],
    queryFn: async () => {
      const data = await api.get<any>(`/inteligencia/vereadores/stats?uf=${uf}&ano=${ano}`);
      return data;
    },
  });
}

export function usePopularVereadores() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ uf = "BA", ano = 2024, votosMin = 150 }: { uf?: string; ano?: number; votosMin?: number }) => {
      const data = await api.post(`/inteligencia/vereadores/popular`, { uf, ano, votosMin });
      return data;
    },
    onSuccess: (count) => {
      qc.invalidateQueries({ queryKey: ["vereadores-historicos"] });
      qc.invalidateQueries({ queryKey: ["vereadores-stats"] });
      toast.success(`${count} vereadores importados`);
    },
    onError: (e: any) => toast.error(e.message),
  });
}

export function useUpdateVereador() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: any) => {
      const data = await api.put(`/inteligencia/vereadores/${payload.id}`, payload);
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["vereadores-historicos"] });
      toast.success("Vereador atualizado");
    },
  });
}
