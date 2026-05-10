import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/apiClient";

import { toast } from "sonner";

type AIProviderRow = any;
type AIProviderInsert = any;
type AIProviderUpdate = any;
type AIModelRow = any;
type AIModelInsert = any;
type AIModelUpdate = any;
type AICopilotRow = any;
type AICopilotInsert = any;
type AICopilotUpdate = any;
type AIUsageLogRow = any;

type ProviderSummary = Pick<AIProviderRow, "nome" | "tipo" | "status">;
type ProviderName = Pick<AIProviderRow, "nome">;

export type AIProviderPayload = AIProviderInsert | (AIProviderUpdate & { id: string });
export type AIModelPayload = AIModelInsert | (AIModelUpdate & { id: string });
export type AICopilotPayload = AICopilotInsert | (AICopilotUpdate & { id: string });
export type AIProviderMutationPayload = AIProviderInsert & { id?: string };
export type AIModelMutationPayload = AIModelInsert & { id?: string };
export type AICopilotMutationPayload = AICopilotInsert & { id?: string };

export type AIModelWithProvider = AIModelRow & {
  ai_provedores: ProviderSummary | null;
};

export type AICopilotWithModel = AICopilotRow & {
  ai_modelos: (Pick<AIModelRow, "nome" | "modelo_id"> & {
    ai_provedores: ProviderName | null;
  }) | null;
};

export type AIUsageLogWithRelations = AIUsageLogRow & {
  ai_provedores: ProviderName | null;
  ai_modelos: Pick<AIModelRow, "nome"> | null;
  ai_copilots: Pick<AICopilotRow, "nome"> | null;
};

export interface AIChatPayload {
  copilot_id?: string;
  modelo_id?: string;
  conversa_id?: string;
  messages: Array<{ role: string; content: string }>;
}

export interface AIChatResponse {
  content: string;
  tokens?: { input: number; output: number };
  custo_estimado?: number;
  latencia_ms?: number;
  modelo?: string;
  provedor?: string;
  error?: string;
}

function getErrorMessage(error: unknown) {
  if (error instanceof Error) return error.message;
  if (typeof error === "object" && error && "message" in error) {
    const message = (error as { message?: unknown }).message;
    if (typeof message === "string") return message;
  }
  return "Erro inesperado";
}

export function useAIProvedores() {
  return useQuery({
    queryKey: ["ai_provedores"],
    queryFn: async () => {
      const data = await api.get<AIProviderRow[]>("/ai/provedores");
      return data || [];
    },
  });
}

export function useAIModelos(provedorId?: string) {
  return useQuery({
    queryKey: ["ai_modelos", provedorId],
    queryFn: async () => {
      const url = provedorId ? `/ai/modelos?provedorId=${provedorId}` : "/ai/modelos";
      const data = await api.get<AIModelWithProvider[]>(url);
      return data || [];
    },
  });
}

export function useAICopilots() {
  return useQuery({
    queryKey: ["ai_copilots"],
    queryFn: async () => {
      const data = await api.get<AICopilotWithModel[]>("/ai/copilots");
      return data || [];
    },
  });
}

export function useUpsertProvedor() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (p: AIProviderMutationPayload) => {
      const { id, ...dataToSave } = p;
      if (id) {
        return await api.put(`/ai/provedores/${id}`, dataToSave);
      }
      return await api.post("/ai/provedores", dataToSave);
    },
    onSuccess: () => { toast.success("Provedor salvo"); qc.invalidateQueries({ queryKey: ["ai_provedores"] }); },
    onError: (error: unknown) => toast.error(getErrorMessage(error)),
  });
}

export function useDeleteProvedor() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/ai/provedores/${id}`);
    },
    onSuccess: () => { toast.success("Provedor removido"); qc.invalidateQueries({ queryKey: ["ai_provedores"] }); },
    onError: (error: unknown) => toast.error(getErrorMessage(error)),
  });
}

export function useTestProvedor() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (provedor_id: string) => {
      const data = await api.post("/ai/provedores/test", { provedor_id });
      return data;
    },
    onSuccess: (data: { ok?: boolean; error?: string } | null) => {
      qc.invalidateQueries({ queryKey: ["ai_provedores"] });
      if (data?.ok) toast.success("Conexão OK!");
      else toast.error(`Falhou: ${data?.error ?? "Erro desconhecido"}`);
    },
    onError: (error: unknown) => toast.error(getErrorMessage(error)),
  });
}

export function useUpsertModelo() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (m: AIModelMutationPayload) => {
      const { id, ...dataToSave } = m;
      if (id) {
        return await api.put(`/ai/modelos/${id}`, dataToSave);
      }
      return await api.post("/ai/modelos", dataToSave);
    },
    onSuccess: () => { toast.success("Modelo salvo"); qc.invalidateQueries({ queryKey: ["ai_modelos"] }); },
    onError: (error: unknown) => toast.error(getErrorMessage(error)),
  });
}

export function useDeleteModelo() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/ai/modelos/${id}`);
    },
    onSuccess: () => { toast.success("Modelo removido"); qc.invalidateQueries({ queryKey: ["ai_modelos"] }); },
    onError: (error: unknown) => toast.error(getErrorMessage(error)),
  });
}

export function useUpsertCopilot() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (c: AICopilotMutationPayload) => {
      const { id, ...dataToSave } = c;
      if (id) {
        return await api.put(`/ai/copilots/${id}`, dataToSave);
      }
      return await api.post("/ai/copilots", dataToSave);
    },
    onSuccess: () => { toast.success("Copilot salvo"); qc.invalidateQueries({ queryKey: ["ai_copilots"] }); },
    onError: (error: unknown) => toast.error(getErrorMessage(error)),
  });
}

export function useAIChat() {
  return useMutation({
    mutationFn: async (payload: AIChatPayload) => {
      const data = await api.post<AIChatResponse>("/ai/chat", payload);
      return data;
    },
  });
}

export function useAIUsoLog(limit = 50) {
  return useQuery({
    queryKey: ["ai_uso_log", limit],
    queryFn: async () => {
      const data = await api.get<AIUsageLogWithRelations[]>(`/ai/log?limit=${limit}`);
      return data || [];
    },
  });
}
