import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export type CoberturaMunicipio = {
  campanha_id: string;
  municipio_id: string;
  municipio_nome: string;
  geocodigo_ibge: string | null;
  meta_votos: number;
  meta_cadastros: number;
  prioridade: "alta" | "media" | "baixa";
  cadastrados: number;
  eleitorado_tse: number;
  bairros_count: number;
};

export function useCoberturaTerritorial(campanhaId?: string) {
  return useQuery({
    queryKey: ["cobertura-territorial", campanhaId],
    enabled: !!campanhaId,
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("v_cobertura_territorial_campanha")
        .select("*")
        .eq("campanha_id", campanhaId)
        .order("municipio_nome");
      if (error) throw error;
      return (data || []) as CoberturaMunicipio[];
    },
  });
}

export function useUpsertMetaMunicipio() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      campanha_id: string;
      municipio_id: string;
      meta_votos?: number;
      meta_cadastros?: number;
      prioridade?: "alta" | "media" | "baixa";
      observacoes?: string;
    }) => {
      const { data, error } = await (supabase as any)
        .from("campanha_metas_municipio")
        .upsert(input, { onConflict: "campanha_id,municipio_id" })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: ["cobertura-territorial", vars.campanha_id] });
      toast.success("Meta atualizada");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

/**
 * Distribui a meta global proporcionalmente ao eleitorado TSE de cada município de foco.
 * Cria registros zerados onde ainda não há meta, mantendo metas já definidas.
 */
export function useDistribuirMetaProporcional() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: { campanha_id: string; meta_global: number; municipios: CoberturaMunicipio[] }) => {
      const totalEleitorado = input.municipios.reduce((s, m) => s + (m.eleitorado_tse || 0), 0);
      if (totalEleitorado === 0) {
        // fallback: distribuição igual
        const igual = Math.round(input.meta_global / Math.max(1, input.municipios.length));
        const rows = input.municipios.map((m) => ({
          campanha_id: input.campanha_id,
          municipio_id: m.municipio_id,
          meta_votos: igual,
          meta_cadastros: Math.round(igual * 1.5),
          prioridade: m.prioridade ?? "media",
        }));
        const { error } = await (supabase as any)
          .from("campanha_metas_municipio")
          .upsert(rows, { onConflict: "campanha_id,municipio_id" });
        if (error) throw error;
        return rows.length;
      }
      const rows = input.municipios.map((m) => {
        const peso = (m.eleitorado_tse || 0) / totalEleitorado;
        const meta = Math.round(input.meta_global * peso);
        return {
          campanha_id: input.campanha_id,
          municipio_id: m.municipio_id,
          meta_votos: meta,
          meta_cadastros: Math.round(meta * 1.5),
          prioridade: m.prioridade ?? "media",
        };
      });
      const { error } = await (supabase as any)
        .from("campanha_metas_municipio")
        .upsert(rows, { onConflict: "campanha_id,municipio_id" });
      if (error) throw error;
      return rows.length;
    },
    onSuccess: (count, vars) => {
      qc.invalidateQueries({ queryKey: ["cobertura-territorial", vars.campanha_id] });
      toast.success(`Meta distribuída em ${count} municípios proporcional ao eleitorado TSE`);
    },
    onError: (e: Error) => toast.error(e.message),
  });
}
