import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/apiClient";
import { toast } from "sonner";

export type AprovacaoStatus = "pendente" | "aprovado" | "rejeitado" | "revisao";
export type AprovacaoPapel = "tesoureiro" | "juridico" | "candidato" | "admin";

export type ContratoAprovacao = {
  id: string;
  contrato_id: string;
  ordem: number;
  papel: AprovacaoPapel;
  status: AprovacaoStatus;
  aprovador_id: string | null;
  observacao: string | null;
  exige_observacao: boolean;
  decidido_em: string | null;
  created_at: string;
};

export const PAPEL_LABEL: Record<AprovacaoPapel, string> = {
  tesoureiro: "Tesoureiro",
  juridico: "Jurídico",
  candidato: "Candidato",
  admin: "Admin",
};

export const STATUS_LABEL: Record<AprovacaoStatus, string> = {
  pendente: "Pendente",
  aprovado: "Aprovado",
  rejeitado: "Rejeitado",
  revisao: "Em revisão",
};

export function useContratoAprovacoes(contratoId?: string) {
  return useQuery({
    queryKey: ["contrato-aprovacoes", contratoId],
    enabled: !!contratoId,
    queryFn: async () => {
      const data = await api.get<any[]>(`/contratos/aprovacoes?contratoId=${contratoId}`);
      return (data || []).map(a => ({
        ...a,
        contrato_id: a.contratoId,
        aprovador_id: a.aprovadorId,
        exige_observacao: a.exigeObservacao,
        decidido_em: a.decididoEm,
        created_at: a.createdAt,
      })) as ContratoAprovacao[];
    },
  });
}

export function useMinhasAprovacoesPendentes() {
  return useQuery({
    queryKey: ["minhas-aprovacoes-pendentes"],
    queryFn: async () => {
      const data = await api.get<any[]>('/contratos/minhas-aprovacoes');
      return data as Array<{
        id: string;
        contrato_id: string;
        ordem: number;
        papel: AprovacaoPapel;
        exige_observacao: boolean;
        numero: string | null;
        objeto: string;
        valor: number;
        data_inicio: string;
        data_fim: string;
      }>;
    },
  });
}

export function useDecidirAprovacao() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: { id: string; status: AprovacaoStatus; observacao?: string }) => {
      await api.put(`/contratos/aprovacoes/${input.id}/decidir`, {
        status: input.status,
        observacao: input.observacao || null,
      });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["contrato-aprovacoes"] });
      qc.invalidateQueries({ queryKey: ["minhas-aprovacoes-pendentes"] });
      qc.invalidateQueries({ queryKey: ["contratos"] });
      toast.success("Decisão registrada");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useRecriarAprovacoes() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (contratoId: string) => {
      await api.post(`/contratos/${contratoId}/recriar-aprovacoes`, {});
    },
    onSuccess: (_, id) => {
      qc.invalidateQueries({ queryKey: ["contrato-aprovacoes", id] });
      toast.success("Workflow recriado");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}
