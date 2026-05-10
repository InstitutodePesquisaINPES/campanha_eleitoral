import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/apiClient";
import { useAuth } from "@/contexts/AuthContext";

type TipoMaterial = "grafico" | "brinde" | "camiseta" | "adesivo" | "banner" | "santinho" | "outros";
type TipoMovimentacao = "entrada" | "saida" | "transferencia" | "perda";

export const tipoMaterialLabels: Record<string, string> = {
  grafico: "Gráfico", brinde: "Brinde", camiseta: "Camiseta", adesivo: "Adesivo",
  banner: "Banner", santinho: "Santinho", outros: "Outros",
};

export const tipoMovimentacaoLabels: Record<string, string> = {
  entrada: "Entrada", saida: "Saída", transferencia: "Transferência", perda: "Perda",
};

// ---- MATERIAIS ----
export function useMateriais() {
  return useQuery({
    queryKey: ["materiais"],
    queryFn: async () => {
      const data = await api.get<any[]>('/materiais');
      // Map camelCase from backend to snake_case for frontend
      return (data || []).map(m => ({
        ...m,
        custo_unitario: m.custoUnitario,
        created_at: m.createdAt,
        updated_at: m.updatedAt,
      }));
    },
  });
}

export function useCreateMaterial() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (values: { nome: string; tipo?: TipoMaterial; descricao?: string; custo_unitario?: number }) => {
      const payload = {
        nome: values.nome,
        tipo: values.tipo,
        descricao: values.descricao,
        custoUnitario: values.custo_unitario,
      };
      const data = await api.post('/materiais', payload);
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["materiais"] }),
  });
}

export function useDeleteMaterial() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/materiais/${id}`);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["materiais"] }),
  });
}

// ---- ESTOQUES ----
export function useEstoques() {
  return useQuery({
    queryKey: ["estoques"],
    queryFn: async () => {
      const data = await api.get<any[]>('/materiais/estoques');
      return (data || []).map(e => ({
        ...e,
        material_id: e.materialId,
        centro_distribuicao: e.centroDistribuicao,
        quantidade_atual: e.quantidadeAtual,
        quantidade_minima: e.quantidadeMinima,
        municipio_id: e.municipioId,
        created_at: e.createdAt,
        materiais: e.material,
        municipios: e.municipio,
      }));
    },
  });
}

export function useCreateEstoque() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (values: { material_id: string; centro_distribuicao?: string; quantidade_atual?: number; quantidade_minima?: number; municipio_id?: string }) => {
      const payload = {
        materialId: values.material_id,
        centroDistribuicao: values.centro_distribuicao,
        quantidadeAtual: values.quantidade_atual,
        quantidadeMinima: values.quantidade_minima,
        municipioId: values.municipio_id,
      };
      const data = await api.post('/materiais/estoques', payload);
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["estoques"] }),
  });
}

// ---- MOVIMENTAÇÕES ----
export function useMovimentacoes(estoqueId?: string) {
  return useQuery({
    queryKey: ["movimentacoes_estoque", estoqueId],
    queryFn: async () => {
      const data = await api.get<any[]>(`/materiais/movimentacoes?estoqueId=${estoqueId}`);
      return (data || []).map(m => ({
        ...m,
        estoque_id: m.estoqueId,
        responsavel_id: m.responsavelId,
        created_at: m.createdAt,
      }));
    },
    enabled: !!estoqueId,
  });
}

export function useCreateMovimentacao() {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: async (values: { estoque_id: string; tipo: TipoMovimentacao; quantidade: number; motivo?: string }) => {
      const payload = {
        estoqueId: values.estoque_id,
        tipo: values.tipo,
        quantidade: values.quantidade,
        motivo: values.motivo,
      };
      const data = await api.post('/materiais/movimentacoes', payload);
      return data;
    },
    onSuccess: (_, v) => {
      qc.invalidateQueries({ queryKey: ["movimentacoes_estoque", v.estoque_id] });
      qc.invalidateQueries({ queryKey: ["estoques"] });
    },
  });
}
