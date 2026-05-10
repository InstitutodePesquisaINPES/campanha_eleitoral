import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/apiClient";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useState } from "react";

export type Notificacao = {
  id: string;
  user_id: string;
  tipo: "info" | "sucesso" | "aviso" | "erro" | "demanda" | "agenda" | "financeiro" | "tarefa" | "sistema";
  prioridade: "baixa" | "media" | "alta" | "urgente";
  titulo: string;
  mensagem: string | null;
  link: string | null;
  entidade_tipo: string | null;
  entidade_id: string | null;
  lida: boolean;
  lida_em: string | null;
  created_at: string;
};

export function useNotificacoes() {
  const { user } = useAuth();
  const qc = useQueryClient();

  const query = useQuery({
    queryKey: ["notificacoes", user?.id],
    queryFn: async () => {
      if (!user) return [] as Notificacao[];
      const data = await api.get<any[]>('/notificacoes');
      return (data || []).map(n => ({
        ...n,
        user_id: n.userId,
        entidade_tipo: n.entidadeTipo,
        entidade_id: n.entidadeId,
        lida_em: n.lidaEm,
        created_at: n.createdAt,
      })) as Notificacao[];
    },
    enabled: !!user,
    refetchInterval: 15000, // Long-polling in substitition to Supabase Realtime
  });

  const marcarLida = useMutation({
    mutationFn: async (id: string) => {
      await api.put(`/notificacoes/${id}/lida`, {});
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["notificacoes", user?.id] }),
  });

  const marcarTodasLidas = useMutation({
    mutationFn: async () => {
      if (!user) return;
      await api.put(`/notificacoes/lidas`, {});
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["notificacoes", user?.id] }),
  });

  const remover = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/notificacoes/${id}`);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["notificacoes", user?.id] }),
  });

  const naoLidas = (query.data || []).filter((n) => !n.lida).length;

  return { ...query, naoLidas, marcarLida, marcarTodasLidas, remover };
}
