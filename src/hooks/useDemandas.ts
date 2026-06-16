import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export type CategoriaDemanda = "saude" | "educacao" | "infraestrutura" | "seguranca" | "social" | "emprego" | "moradia" | "transporte" | "outros";
export type PrioridadeDemanda = "baixa" | "media" | "alta" | "urgente";
export type StatusDemanda = "aberta" | "triagem" | "encaminhada" | "em_andamento" | "resolvida" | "arquivada";
export type OrigemDemanda = "visita" | "telefone" | "whatsapp" | "gabinete" | "evento" | "rede_social";

export const categoriaLabels: Record<string, string> = {
  saude: "Saúde", educacao: "Educação", infraestrutura: "Infraestrutura", seguranca: "Segurança",
  social: "Social", emprego: "Emprego", moradia: "Moradia", transporte: "Transporte", outros: "Outros",
};

export const prioridadeLabels: Record<string, string> = { baixa: "Baixa", media: "Média", alta: "Alta", urgente: "Urgente" };
export const prioridadeColors: Record<string, string> = {
  baixa: "bg-muted text-muted-foreground",
  media: "bg-primary/15 text-primary",
  alta: "bg-warning/15 text-warning",
  urgente: "bg-destructive/15 text-destructive",
};
// Default SLA in days per priority
export const prioridadeSLA: Record<string, number> = { urgente: 2, alta: 7, media: 15, baixa: 30 };

export const statusLabels: Record<string, string> = {
  aberta: "Aberta", triagem: "Triagem", encaminhada: "Encaminhada",
  em_andamento: "Em Andamento", resolvida: "Resolvida", arquivada: "Arquivada",
};
export const statusColors: Record<string, string> = {
  aberta: "bg-info/15 text-info",
  triagem: "bg-warning/15 text-warning",
  encaminhada: "bg-accent text-accent-foreground",
  em_andamento: "bg-primary/15 text-primary",
  resolvida: "bg-success/15 text-success",
  arquivada: "bg-muted text-muted-foreground",
};

export const origemLabels: Record<string, string> = {
  visita: "Visita", telefone: "Telefone", whatsapp: "WhatsApp", gabinete: "Gabinete", evento: "Evento", rede_social: "Rede Social",
};

export interface DemandasFilters {
  status?: string;
  prioridade?: string;
  categoria?: string;
  origem?: string;
  search?: string;
  vencidas?: boolean;
  semResponsavel?: boolean;
  municipioId?: string;
}

// ---- DEMANDAS ----
export function useDemandas(filters: DemandasFilters = {}) {
  return useQuery({
    queryKey: ["demandas", filters],
    queryFn: async () => {
      let q = supabase
        .from("demandas")
        .select("*, pessoas(full_name), municipios(nome), bairros(nome)")
        .order("data_abertura", { ascending: false })
        .limit(500);
      if (filters.status && filters.status !== "all") q = q.eq("status", filters.status as StatusDemanda);
      if (filters.prioridade && filters.prioridade !== "all") q = q.eq("prioridade", filters.prioridade as PrioridadeDemanda);
      if (filters.categoria && filters.categoria !== "all") q = q.eq("categoria", filters.categoria as CategoriaDemanda);
      if (filters.origem && filters.origem !== "all") q = q.eq("origem", filters.origem as OrigemDemanda);
      if (filters.municipioId) q = q.eq("municipio_id", filters.municipioId);
      if (filters.semResponsavel) q = q.is("responsavel_id", null);
      if (filters.search?.trim()) {
        const s = filters.search.trim();
        q = q.or(`titulo.ilike.%${s}%,protocolo.ilike.%${s}%,descricao.ilike.%${s}%`);
      }
      const { data, error } = await q;
      if (error) throw error;
      let rows = data || [];
      if (filters.vencidas) {
        const now = new Date();
        rows = rows.filter((d: any) => d.data_prazo && new Date(d.data_prazo) < now && !["resolvida", "arquivada"].includes(d.status));
      }
      return rows;
    },
  });
}

export function useDemandasStats() {
  return useQuery({
    queryKey: ["demandas-stats"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("demandas")
        .select("status,prioridade,data_prazo,data_resolucao,data_abertura,satisfacao_cidadao")
        .limit(5000);
      if (error) throw error;
      const rows = data || [];
      const now = new Date();
      const ativas = rows.filter((d) => !["resolvida", "arquivada"].includes(d.status));
      const vencidas = ativas.filter((d) => d.data_prazo && new Date(d.data_prazo) < now);
      const resolvidas = rows.filter((d) => d.status === "resolvida");
      const urgentes = ativas.filter((d) => d.prioridade === "urgente");
      const tempoMedio = (() => {
        const arr = resolvidas
          .filter((d) => d.data_resolucao && d.data_abertura)
          .map((d) => (new Date(d.data_resolucao!).getTime() - new Date(d.data_abertura).getTime()) / 86400000);
        if (!arr.length) return 0;
        return arr.reduce((a, b) => a + b, 0) / arr.length;
      })();
      const satisfacao = (() => {
        const arr = rows.filter((d) => d.satisfacao_cidadao).map((d) => d.satisfacao_cidadao!);
        if (!arr.length) return 0;
        return arr.reduce((a, b) => a + b, 0) / arr.length;
      })();
      return {
        total: rows.length,
        ativas: ativas.length,
        vencidas: vencidas.length,
        resolvidas: resolvidas.length,
        urgentes: urgentes.length,
        tempoMedioDias: tempoMedio,
        satisfacaoMedia: satisfacao,
        taxaResolucao: rows.length ? (resolvidas.length / rows.length) * 100 : 0,
      };
    },
  });
}

export function useDemanda(id?: string) {
  return useQuery({
    queryKey: ["demanda", id],
    queryFn: async () => {
      if (!id) return null;
      const { data, error } = await supabase
        .from("demandas")
        .select("*, pessoas(full_name), municipios(nome), bairros(nome)")
        .eq("id", id)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });
}

export function useCreateDemanda() {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: async (values: {
      titulo: string; descricao?: string; pessoa_id?: string;
      categoria?: CategoriaDemanda; prioridade?: PrioridadeDemanda;
      origem?: OrigemDemanda; municipio_id?: string; bairro_id?: string;
      responsavel_id?: string; data_prazo?: string;
    }) => {
      // Auto-set SLA based on priority if no prazo provided
      let data_prazo = values.data_prazo;
      if (!data_prazo && values.prioridade) {
        const days = prioridadeSLA[values.prioridade] ?? 15;
        const d = new Date();
        d.setDate(d.getDate() + days);
        data_prazo = d.toISOString();
      }
      const { data, error } = await supabase.from("demandas")
        .insert({ ...values, data_prazo, protocolo: "TEMP", created_by: user?.id })
        .select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["demandas"] });
      qc.invalidateQueries({ queryKey: ["demandas-stats"] });
    },
  });
}

export function useUpdateDemanda() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...values }: {
      id: string; titulo?: string; descricao?: string; categoria?: CategoriaDemanda;
      prioridade?: PrioridadeDemanda; status?: StatusDemanda; responsavel_id?: string;
      resolucao_descricao?: string; satisfacao_cidadao?: number; data_resolucao?: string;
      data_prazo?: string; municipio_id?: string; bairro_id?: string; origem?: OrigemDemanda;
    }) => {
      const { data, error } = await supabase.from("demandas").update(values).eq("id", id).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ["demandas"] });
      qc.invalidateQueries({ queryKey: ["demanda", vars.id] });
      qc.invalidateQueries({ queryKey: ["demandas-stats"] });
    },
  });
}

export function useDeleteDemanda() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("demandas").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["demandas"] });
      qc.invalidateQueries({ queryKey: ["demandas-stats"] });
    },
  });
}

// ---- ENCAMINHAMENTOS ----
export function useEncaminhamentos(demandaId?: string) {
  return useQuery({
    queryKey: ["demandas_encaminhamentos", demandaId],
    queryFn: async () => {
      const { data, error } = await supabase.from("demandas_encaminhamentos").select("*").eq("demanda_id", demandaId!).order("created_at", { ascending: false });
      if (error) throw error;
      return data || [];
    },
    enabled: !!demandaId,
  });
}

export function useCreateEncaminhamento() {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: async (values: { demanda_id: string; para_usuario_id?: string; observacao?: string }) => {
      const { data, error } = await supabase.from("demandas_encaminhamentos").insert({ ...values, de_usuario_id: user?.id }).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: (_, v) => qc.invalidateQueries({ queryKey: ["demandas_encaminhamentos", v.demanda_id] }),
  });
}

// ---- ANEXOS ----
export function useAnexos(demandaId?: string) {
  return useQuery({
    queryKey: ["demandas_anexos", demandaId],
    queryFn: async () => {
      const { data, error } = await supabase.from("demandas_anexos").select("*").eq("demanda_id", demandaId!).order("created_at", { ascending: false });
      if (error) throw error;
      return data || [];
    },
    enabled: !!demandaId,
  });
}

export function useCreateAnexo() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (values: { demanda_id: string; arquivo_url: string; descricao?: string; tipo?: string }) => {
      const { data, error } = await supabase.from("demandas_anexos").insert(values).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: (_, v) => qc.invalidateQueries({ queryKey: ["demandas_anexos", v.demanda_id] }),
  });
}

// ============================================================
// SLA + Histórico de status (Onda 4)
// ============================================================
export type SituacaoSLA = "no_prazo" | "vencendo" | "vencida" | "atrasada" | "sem_prazo";

export interface DemandaSLA {
  id: string;
  protocolo: string;
  titulo: string;
  status: string;
  prioridade: string;
  responsavel_id: string | null;
  data_abertura: string;
  data_prazo: string | null;
  respondida_em: string | null;
  tempo_resposta_min: number | null;
  situacao_sla: SituacaoSLA;
  horas_restantes: number | null;
}

export function useDemandasSLA(filters: { somenteMinhas?: boolean; userId?: string } = {}) {
  return useQuery({
    queryKey: ["demandas_sla", filters],
    queryFn: async () => {
      let q = supabase.from("v_demandas_sla" as any).select("*").order("data_prazo", { ascending: true, nullsFirst: false });
      if (filters.somenteMinhas && filters.userId) q = q.eq("responsavel_id", filters.userId);
      const { data, error } = await q.limit(500);
      if (error) throw error;
      return (data || []) as unknown as DemandaSLA[];
    },
    refetchInterval: 30_000,
  });
}

export function useDemandaSLA(id?: string) {
  return useQuery({
    queryKey: ["demanda_sla", id],
    queryFn: async () => {
      const { data, error } = await supabase.from("v_demandas_sla" as any).select("*").eq("id", id!).maybeSingle();
      if (error) throw error;
      return data as unknown as DemandaSLA | null;
    },
    enabled: !!id,
    refetchInterval: 30_000,
  });
}

export function useDemandaHistorico(demandaId?: string) {
  return useQuery({
    queryKey: ["demanda_historico", demandaId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("demandas_historico_status" as any)
        .select("*")
        .eq("demanda_id", demandaId!)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data || []) as any[];
    },
    enabled: !!demandaId,
  });
}

