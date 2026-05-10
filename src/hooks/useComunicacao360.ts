import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/apiClient";
import { toast } from "sonner";

export type PautaStatus = "ideia" | "aprovada" | "em_producao" | "agendada" | "publicada" | "cancelada";
export type PautaCanal = "instagram" | "facebook" | "tiktok" | "youtube" | "whatsapp" | "site" | "imprensa" | "radio" | "tv" | "outdoor" | "outros";
export type PecaStatus = "rascunho" | "em_revisao" | "aprovacao_juridica" | "aprovada" | "reprovada" | "publicada";
export type PecaTipo = "post" | "video" | "reels" | "story" | "jingle" | "santinho" | "adesivo" | "outdoor" | "release" | "spot" | "outros";
export type MencaoCanal = "instagram" | "facebook" | "twitter" | "tiktok" | "youtube" | "whatsapp" | "imprensa" | "blog" | "grupo" | "outros";
export type MencaoSentimento = "positivo" | "neutro" | "negativo" | "crise";
export type MencaoStatus = "novo" | "em_analise" | "respondido" | "escalado" | "arquivado";

export type Pauta = {
  id: string;
  campanha_id: string | null;
  titulo: string;
  descricao: string | null;
  canal: PautaCanal;
  status: PautaStatus;
  data_publicacao: string | null;
  responsavel_id: string | null;
  tags: string[] | null;
  observacoes: string | null;
  created_at: string;
  updated_at: string;
};

export type Peca = {
  id: string;
  pauta_id: string | null;
  campanha_id: string | null;
  titulo: string;
  tipo: PecaTipo;
  status: PecaStatus;
  arquivo_url: string | null;
  thumbnail_url: string | null;
  texto_legenda: string | null;
  aprovador_id: string | null;
  aprovado_em: string | null;
  observacoes_juridicas: string | null;
  versao: number;
  created_at: string;
  updated_at: string;
};

export type Mencao = {
  id: string;
  campanha_id: string | null;
  canal: MencaoCanal;
  autor: string | null;
  url: string | null;
  conteudo: string;
  sentimento: MencaoSentimento;
  status: MencaoStatus;
  alcance_estimado: number | null;
  resposta: string | null;
  respondido_por: string | null;
  respondido_em: string | null;
  data_mencao: string;
  created_at: string;
  updated_at: string;
};

export type WarRoomKPIs = {
  mencoes_novas: number;
  crises_ativas: number;
  negativas_24h: number;
  positivas_24h: number;
  total_7d: number;
};



export function usePautas() {
  return useQuery({
    queryKey: ["pautas"],
    queryFn: async () => {
      const data = await api.get<Pauta[]>("/comunicacao/pautas");
      return data || [];
    },
  });
}

export function useCreatePauta() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: Partial<Pauta>) => {
      const data = await api.post("/comunicacao/pautas", input);
      return data;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["pautas"] }); toast.success("Pauta criada"); },
    onError: (e: any) => toast.error(e.message),
  });
}

export function useUpdatePauta() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...patch }: { id: string } & Partial<Pauta>) => {
      const data = await api.put(`/comunicacao/pautas/${id}`, patch);
      return data;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["pautas"] }); toast.success("Pauta atualizada"); },
    onError: (e: any) => toast.error(e.message),
  });
}

export function usePecas() {
  return useQuery({
    queryKey: ["pecas"],
    queryFn: async () => {
      const data = await api.get<Peca[]>("/comunicacao/pecas");
      return data || [];
    },
  });
}

export function useCreatePeca() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: Partial<Peca>) => {
      const data = await api.post("/comunicacao/pecas", input);
      return data;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["pecas"] }); toast.success("Peça criada"); },
    onError: (e: any) => toast.error(e.message),
  });
}

export function useUpdatePecaStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status, observacoes_juridicas }: { id: string; status: PecaStatus; observacoes_juridicas?: string }) => {
      const patch: any = { status };
      if (observacoes_juridicas !== undefined) patch.observacoes_juridicas = observacoes_juridicas;
      const data = await api.put(`/comunicacao/pecas/${id}/status`, patch);
      return data;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["pecas"] }); toast.success("Status atualizado"); },
    onError: (e: any) => toast.error(e.message),
  });
}

export function useMencoes() {
  return useQuery({
    queryKey: ["mencoes"],
    queryFn: async () => {
      const data = await api.get<Mencao[]>("/comunicacao/mencoes");
      return data || [];
    },
  });
}

export function useCreateMencao() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: Partial<Mencao>) => {
      const data = await api.post("/comunicacao/mencoes", input);
      return data;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["mencoes"] }); qc.invalidateQueries({ queryKey: ["warroom-kpis"] }); toast.success("Menção registrada"); },
    onError: (e: any) => toast.error(e.message),
  });
}

export function useResponderMencao() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, resposta, status }: { id: string; resposta: string; status: MencaoStatus }) => {
      const data = await api.put(`/comunicacao/mencoes/${id}/responder`, { resposta, status });
      return data;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["mencoes"] }); qc.invalidateQueries({ queryKey: ["warroom-kpis"] }); toast.success("Resposta registrada"); },
    onError: (e: any) => toast.error(e.message),
  });
}

export function useWarRoomKPIs() {
  return useQuery({
    queryKey: ["warroom-kpis"],
    queryFn: async () => {
      const data = await api.get<WarRoomKPIs>("/comunicacao/kpis");
      return data || { mencoes_novas: 0, crises_ativas: 0, negativas_24h: 0, positivas_24h: 0, total_7d: 0 };
    },
    refetchInterval: 30000,
  });
}
