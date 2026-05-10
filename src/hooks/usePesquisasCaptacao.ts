import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/apiClient";
import { toast } from "sonner";

export function usePesquisas() {
  return useQuery({
    queryKey: ["pesquisas"],
    queryFn: async () => {
      const data = await api.get<any[]>('/pesquisas');
      return data || [];
    },
  });
}

export function useUpsertPesquisa() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (p: any) => {
      if (p.id) {
        await api.put(`/pesquisas/${p.id}`, p);
      } else {
        await api.post('/pesquisas', p);
      }
    },
    onSuccess: () => { toast.success("Pesquisa salva"); qc.invalidateQueries({ queryKey: ["pesquisas"] }); },
    onError: (e: any) => toast.error(e.message),
  });
}

export function useUpsertResultado() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (r: any) => {
      if (r.id) {
        await api.put(`/pesquisas/resultados/${r.id}`, r);
      } else {
        await api.post('/pesquisas/resultados', r);
      }
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["pesquisas"] }); },
    onError: (e: any) => toast.error(e.message),
  });
}

export function useCaptacao() {
  return useQuery({
    queryKey: ["captacao_doadores"],
    queryFn: async () => {
      const data = await api.get<any[]>('/pesquisas/captacao');
      return data || [];
    },
  });
}

export function useUpsertDoador() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (d: any) => {
      if (d.id) {
        await api.put(`/pesquisas/captacao/${d.id}`, d);
      } else {
        await api.post('/pesquisas/captacao', d);
      }
    },
    onSuccess: () => { toast.success("Doador salvo"); qc.invalidateQueries({ queryKey: ["captacao_doadores"] }); },
    onError: (e: any) => toast.error(e.message),
  });
}

export function useDeleteDoador() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/pesquisas/captacao/${id}`);
    },
    onSuccess: () => { toast.success("Doador removido"); qc.invalidateQueries({ queryKey: ["captacao_doadores"] }); },
    onError: (e: any) => toast.error(e.message),
  });
}
